import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendBookingConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else {

      event = JSON.parse(payload);
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          movieDetail: {
            include: {
              seats: { include: { seat: true } },
              showtime: { include: { movie: true } },
            },
          },
          hotelDetail: {
            include: {
              roomType: { include: { hotel: true } },
            },
          },
        },
      });

      if (booking && booking.status === "PENDING") {
        const transactionId = (session.payment_intent as string) || session.id;

        await prisma.$transaction(async (tx: any) => {
          await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              lockedUntil: null,
            },
          });

          await tx.payment.create({
            data: {
              bookingId,
              amount: booking.totalAmount,
              status: "COMPLETED",
              method: "stripe",
              transactionId,
            },
          });

          if (booking.type === "MOVIE" && booking.movieDetail) {
            const seatIds = booking.movieDetail.seats.map((s: any) => s.seatId);
            for (const seatId of seatIds) {
              await tx.showtimeSeatStatus.upsert({
                where: {
                  showtimeId_seatId: {
                    showtimeId: booking.movieDetail.showtimeId,
                    seatId,
                  },
                },
                update: { status: "BOOKED", lockedBy: null, lockedAt: null },
                create: {
                  showtimeId: booking.movieDetail.showtimeId,
                  seatId,
                  status: "BOOKED",
                },
              });
            }
          }
        });


        try {
          const userEmail = booking.user?.email;
          const userName = booking.user?.name || "Customer";

          if (userEmail) {
            if (booking.type === "MOVIE" && booking.movieDetail) {
              const md = booking.movieDetail;
              const seatLabels = md.seats.map(
                (s: any) => `${s.seat?.row || "?"}${s.seat?.number || "?"}`
              );

              await sendBookingConfirmationEmail(userEmail, userName, {
                type: "MOVIE",
                bookingId: booking.id,
                movieTitle: md.showtime?.movie?.title || "Movie",
                theatreName: "OmniBook Cinema",
                screenName: "Screen 1",
                showtime: md.showtime?.startTime?.toISOString() || new Date().toISOString(),
                seats: seatLabels,
                totalAmount: booking.totalAmount,
                transactionId,
              });
            } else if (booking.type === "HOTEL" && booking.hotelDetail) {
              const hd = booking.hotelDetail;

              await sendBookingConfirmationEmail(userEmail, userName, {
                type: "HOTEL",
                bookingId: booking.id,
                hotelName: hd.roomType?.hotel?.name || "Hotel",
                roomType: hd.roomType?.name || "Room",
                checkIn: hd.checkIn.toISOString(),
                checkOut: hd.checkOut.toISOString(),
                rooms: hd.rooms,
                guests: hd.guests,
                totalAmount: booking.totalAmount,
                transactionId,
              });
            }
          }
        } catch (emailError) {

          console.error("Email send failed (non-critical):", emailError);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
