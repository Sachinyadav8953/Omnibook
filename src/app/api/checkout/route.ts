import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes("PASTE_YOUR") || stripeKey.length < 20) {
      console.error("STRIPE_SECRET_KEY is missing or invalid in .env");
      return NextResponse.json(
        { error: "Payment system not configured. Please add your Stripe secret key to .env" },
        { status: 503 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-02-24.acacia" as any,
    });


    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        movieDetail: {
          include: { showtime: { include: { movie: true } } },
        },
        hotelDetail: {
          include: { roomType: { include: { hotel: true } } },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking is not in pending state" }, { status: 400 });
    }


    const title = booking.type === "MOVIE" 
      ? `Movie Tickets${booking.movieDetail?.showtime?.movie?.title ? `: ${booking.movieDetail.showtime.movie.title}` : ""}`
      : `Hotel Booking${booking.hotelDetail?.roomType?.hotel?.name ? `: ${booking.hotelDetail.roomType.hotel.name}` : ""}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";


    const unitAmount = Math.max(5000, Math.round(booking.totalAmount * 100));

    console.log("Creating Stripe session:", {
      title,
      unitAmount,
      bookingId: booking.id,
      email: session.email,
    });


    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: title || "OmniBook Booking",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/checkout/${booking.id}?canceled=true`,
      metadata: {
        bookingId: booking.id,
      },
    });

    console.log("Stripe session created:", stripeSession.id, stripeSession.url);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("=== STRIPE CHECKOUT ERROR ===");
    console.error("Error type:", error?.type);
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.code);
    console.error("Full error:", error);
    
    const message = error?.message || "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
