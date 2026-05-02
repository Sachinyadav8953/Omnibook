import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface MovieEmailData {
  type: "MOVIE";
  bookingId: string;
  movieTitle: string;
  theatreName: string;
  screenName: string;
  showtime: string;
  seats: string[];
  totalAmount: number;
  transactionId: string;
}

interface HotelEmailData {
  type: "HOTEL";
  bookingId: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  totalAmount: number;
  transactionId: string;
}

type BookingEmailData = MovieEmailData | HotelEmailData;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function buildEmailHTML(data: BookingEmailData, userName: string): string {
  const isMovie = data.type === "MOVIE";
  const accentColor = isMovie ? "#183e29" : "#c4a962";
  const iconEmoji = isMovie ? "🎬" : "🏨";

  const detailsRows = isMovie
    ? `
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Movie</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as MovieEmailData).movieTitle}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Theatre</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as MovieEmailData).theatreName}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Screen</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as MovieEmailData).screenName}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${formatDate((data as MovieEmailData).showtime)}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Time</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${formatTime((data as MovieEmailData).showtime)}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Seats</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as MovieEmailData).seats.join(", ")}</td></tr>
    `
    : `
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Hotel</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as HotelEmailData).hotelName}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Room Type</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as HotelEmailData).roomType}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Check-in</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${formatDate((data as HotelEmailData).checkIn)}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Check-out</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${formatDate((data as HotelEmailData).checkOut)}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Rooms</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as HotelEmailData).rooms}</td></tr>
      <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #f0f0f0;">Guests</td><td style="padding:10px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">${(data as HotelEmailData).guests}</td></tr>
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f7f5f0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:28px;font-weight:700;color:${accentColor};letter-spacing:-0.5px;">
        OmniBook
      </div>
      <p style="color:#999;font-size:12px;margin:4px 0 0;letter-spacing:1px;text-transform:uppercase;">Booking Confirmation</p>
    </div>

    <!-- Main Card -->
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

      <!-- Green success banner -->
      <div style="background:${accentColor};padding:28px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">${iconEmoji}</div>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
          Booking Confirmed!
        </h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
          Thank you for your booking, ${userName}
        </p>
      </div>

      <!-- Booking ID badge -->
      <div style="padding:20px 32px 0;text-align:center;">
        <div style="display:inline-block;background:#f7f5f0;border-radius:12px;padding:10px 20px;">
          <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booking ID</span>
          <br>
          <span style="color:#333;font-size:15px;font-weight:700;font-family:monospace;">${data.bookingId.slice(-12).toUpperCase()}</span>
        </div>
      </div>

      <!-- Details Table -->
      <div style="padding:24px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          ${detailsRows}
        </table>
      </div>

      <!-- Total -->
      <div style="margin:0 32px;padding:20px 24px;background:${accentColor}0D;border-radius:14px;display:flex;justify-content:space-between;align-items:center;">
        <table style="width:100%;">
          <tr>
            <td style="color:#666;font-size:14px;font-weight:500;">Total Paid</td>
            <td style="text-align:right;color:${accentColor};font-size:24px;font-weight:700;">${formatCurrency(data.totalAmount)}</td>
          </tr>
        </table>
      </div>

      <!-- Transaction ID -->
      <div style="padding:16px 32px;text-align:center;">
        <span style="color:#bbb;font-size:11px;">Transaction: ${data.transactionId}</span>
      </div>

      <!-- CTA Button -->
      <div style="padding:0 32px 28px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
           style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:14px;font-weight:600;letter-spacing:0.3px;">
          View My Bookings →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:28px;padding:0 16px;">
      <p style="color:#bbb;font-size:11px;line-height:1.6;">
        This is an automated confirmation email from OmniBook.<br>
        Please do not reply to this email.
      </p>
      <p style="color:#ddd;font-size:11px;margin-top:8px;">
        © ${new Date().getFullYear()} OmniBook • All rights reserved
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function sendBookingConfirmationEmail(
  toEmail: string,
  userName: string,
  data: BookingEmailData
): Promise<boolean> {

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️  SMTP not configured — skipping confirmation email. Add SMTP_EMAIL and SMTP_PASSWORD to .env");
    return false;
  }

  const isMovie = data.type === "MOVIE";
  const subject = isMovie
    ? `🎬 Booking Confirmed — ${(data as MovieEmailData).movieTitle}`
    : `🏨 Booking Confirmed — ${(data as HotelEmailData).hotelName}`;

  try {
    await transporter.sendMail({
      from: `"OmniBook" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject,
      html: buildEmailHTML(data, userName),
    });

    console.log(`✅ Confirmation email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
    return false;
  }
}
