import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters.").max(128)
});

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Check your email and password.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "An account with this email already exists.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return "Database tables are missing. Run npm run prisma:migrate, then try again.";
  }

  return error instanceof Error ? error.message : "Signup failed.";
}

export async function POST(request: Request) {
  try {
    if (!getDatabaseConfig() || !getJwtConfig()) {
      return NextResponse.json(
        { error: "Missing DATABASE_URL or JWT_SECRET. Add them to .env.local before signing up." },
        { status: 400 }
      );
    }

    const input = credentialsSchema.parse(await request.json());
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash
      },
      select: { id: true, email: true }
    });

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
