import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } },
      { status: 200 }
    );
    response.headers.set(
      "Set-Cookie",
      serialize("omnibook-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
