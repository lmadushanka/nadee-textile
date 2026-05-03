import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Storage } from "@google-cloud/storage";

function envValue(name: string) {
  const v = process.env[name]?.trim();
  return v ? v : null;
}

function parseServiceAccountJson(raw: string) {
  try {
    const parsed = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
      project_id?: string;
    };
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error(
        "GOOGLE_CLOUD_CREDENTIALS_JSON must include client_email and private_key.",
      );
    }
    let privateKey = parsed.private_key;
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    return {
      client_email: parsed.client_email,
      private_key: privateKey,
      project_id: parsed.project_id,
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("GOOGLE_CLOUD_CREDENTIALS_JSON is not valid JSON.");
    }
    throw e;
  }
}

function getStorage() {
  const projectId = envValue("PROJECT_ID");
  const credentialsJson = envValue("GOOGLE_CLOUD_CREDENTIALS_JSON");
  const keyFile =
    envValue("GOOGLE_CLOUD_KEY_FILE") ??
    envValue("GOOGLE_APPLICATION_CREDENTIALS");

  if (credentialsJson) {
    const credentials = parseServiceAccountJson(credentialsJson);
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
    if (fs.existsSync(resolved)) {
      return new Storage({
        projectId: projectId ?? undefined,
        keyFilename: resolved,
      });
    }
    console.warn(
      `[gcs] Key file not found at ${resolved} — using Application Default Credentials. ` +
        "On Cloud Run, grant the runtime service account Storage access on the bucket, " +
        "or set GOOGLE_CLOUD_CREDENTIALS_JSON / mount a secret file.",
    );
  }

  // Cloud Run / GCE: Application Default Credentials (runtime service account).
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

  // Buckets with uniform bucket-level access cannot use per-object ACLs; use bucket IAM
  // (e.g. allUsers: Storage Object Viewer) for public reads instead.
  try {
    await blob.makePublic();
  } catch (aclErr) {
    console.warn(
      "[gcs] makePublic failed (often OK if the bucket uses IAM-only public read):",
      aclErr instanceof Error ? aclErr.message : aclErr,
    );
  }

  return {
    objectPath,
    publicUrl: `https://storage.googleapis.com/${bucketName}/${objectPath}`,
  };
}
