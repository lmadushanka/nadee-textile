import crypto from "crypto";
import path from "path";
import { Storage } from "@google-cloud/storage";

function envValue(name: string) {
  const v = process.env[name]?.trim();
  return v ? v : null;
}

function getStorage() {
  const projectId = envValue("PROJECT_ID");
  const credentialsJson = envValue("GOOGLE_CLOUD_CREDENTIALS_JSON");
  const keyFile =
    envValue("GOOGLE_CLOUD_KEY_FILE") ??
    envValue("GOOGLE_APPLICATION_CREDENTIALS");

  if (credentialsJson) {
    const credentials = JSON.parse(credentialsJson) as {
      client_email: string;
      private_key: string;
      project_id?: string;
    };
    return new Storage({
      projectId: projectId ?? credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
  }

  if (keyFile) {
    const resolved = path.isAbsolute(keyFile)
      ? keyFile
      : path.resolve(/* turbopackIgnore: true */ process.cwd(), keyFile);
    return new Storage({
      projectId: projectId ?? undefined,
      keyFilename: resolved,
    });
  }

  return new Storage({
    projectId: projectId ?? undefined,
  });
}

function sanitizeName(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  return normalized.replace(/^-+|-+$/g, "") || "file";
}

export async function uploadImageToBucket(file: File) {
  const bucketName = envValue("BUCKET_NAME");
  if (!bucketName) {
    throw new Error("Missing BUCKET_NAME in environment.");
  }

  const storage = getStorage();
  const bucket = storage.bucket(bucketName);

  const extFromType = file.type.startsWith("image/")
    ? file.type.split("/")[1]
    : "";
  const safeName = sanitizeName(file.name);
  const ext = extFromType || safeName.split(".").pop() || "bin";
  const base = safeName.replace(/\.[^.]+$/, "");
  const objectPath = `products/${Date.now()}-${crypto.randomUUID()}-${base}.${ext}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const blob = bucket.file(objectPath);

  await blob.save(buffer, {
    resumable: false,
    metadata: {
      contentType: file.type || "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  // This requires public object access; if your bucket policy blocks it,
  // keep object private and use signed URLs in a future step.
  await blob.makePublic();

  return {
    objectPath,
    publicUrl: `https://storage.googleapis.com/${bucketName}/${objectPath}`,
  };
}
