import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return { user };
}
