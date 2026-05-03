import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { uploadImageToBucket } from "@/lib/gcs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const maybeFile = form.get("file");
    if (!(maybeFile instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const nameLower = maybeFile.name.toLowerCase();
    const looksLikeIco =
      nameLower.endsWith(".ico") &&
      (!maybeFile.type ||
        maybeFile.type === "application/octet-stream" ||
        maybeFile.type === "image/x-icon" ||
        maybeFile.type === "image/vnd.microsoft.icon");
    if (!maybeFile.type.startsWith("image/") && !looksLikeIco) {
      return NextResponse.json(
        { error: "Only image files (or .ico favicons) are supported" },
        { status: 400 },
      );
    }

    const maxBytes = 5 * 1024 * 1024;
    if (maybeFile.size > maxBytes) {
      return NextResponse.json(
        { error: "File too large. Max size is 5MB." },
        { status: 400 },
      );
    }

    const uploaded = await uploadImageToBucket(maybeFile);
    return NextResponse.json({ ok: true, url: uploaded.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin-upload]", msg, e);
    return NextResponse.json(
      { error: "Upload failed. Check GCS credentials and bucket settings." },
      { status: 500 },
    );
  }
}
