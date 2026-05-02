import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentUser(retries = 2) {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const user = await currentUser();
      if (!user) return null;

      const email = user.emailAddresses?.[0]?.emailAddress || `${user.id}@example.com`;


      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Omnibook User",
            email: email,
            password: "clerk-sso-user",
            avatar: user.imageUrl,
          }
        });
      } catch (error) {

        try {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
              id: user.id,
              name: "Omnibook User",
              email: `${user.id}@clerk.omnibook.com`,
              password: "clerk-sso-user",
            }
          });
        } catch (e) {
          console.error("Failed to auto-sync user:", e);
        }
      }

      return { userId: user.id, email };
    } catch (error: any) {
      lastError = error;
      const isNetworkError =
        error?.message?.includes("fetch failed") ||
        error?.errors?.[0]?.message?.includes("fetch failed");

      if (isNetworkError && attempt < retries) {
        console.warn(`⚠️  Clerk API fetch failed (attempt ${attempt + 1}/${retries + 1}), retrying in 1s...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
