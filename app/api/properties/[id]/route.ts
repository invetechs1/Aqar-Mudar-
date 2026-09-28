import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = apiMessages(getRequestLocale());
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      report: true,
      owner: { select: { id: true, name: true, phone: true } },
    },
  });
  if (!property) return NextResponse.json({ error: t.notFound }, { status: 404 });
  return NextResponse.json({ property });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = apiMessages(getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t.unauthorized }, { status: 401 });

  const prop = await prisma.property.findUnique({ where: { id: params.id } });
  if (!prop) return NextResponse.json({ error: t.notFound }, { status: 404 });

  if (prop.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: t.forbidden }, { status: 403 });
  }

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
