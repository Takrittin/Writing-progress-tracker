import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const entryIdSchema = z.string().uuid();

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!getDatabaseConfig() || !getJwtConfig()) {
      return NextResponse.json(
        { error: "Missing DATABASE_URL or JWT_SECRET. Add them to .env.local before deleting entries." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in before deleting writing." }, { status: 401 });
    }

    const { id } = await params;
    const entryId = entryIdSchema.parse(id);
    const result = await prisma.writingEntry.deleteMany({
      where: {
        id: entryId,
        userId: user.id
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Writing entry not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete writing entry.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
