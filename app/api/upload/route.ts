import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";
import { apiMessages, getRequestLocale } from "@/lib/api-errors";

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const t = apiMessages(getRequestLocale());

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: t.unauthorized }, { status: 401 });
  }

  const rl = await rateLimit(clientKey(req, `upload:${session.user.id}`), 30, 300);
  if (!rl.allowed) return NextResponse.json({ error: t.tooManyAttempts }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: t.noFile }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: t.fileTooLarge }, { status: 400 });
  }

  try {
    const result = await uploadImage(file);
    await audit({
      action: "upload.image",
      resource: "media",
      userId: session.user.id,
      metadata: { url: result.url, bytes: file.size, type: file.type },
      request: req,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? t.uploadFailed }, { status: 400 });
  }
}

export const runtime = "nodejs";
