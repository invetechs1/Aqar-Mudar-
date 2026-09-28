import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecret, otpauthUrl } from "@/lib/totp";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: apiMessages(getRequestLocale()).unauthorized }, { status: 401 });

  const secret = generateSecret();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: secret, totpEnabled: false },
  });
  const uri = otpauthUrl("Aqar Mudar", session.user.email ?? session.user.id, secret);
  return NextResponse.json({ secret, uri });
}
