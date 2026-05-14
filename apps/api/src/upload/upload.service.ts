import { BadRequestException, Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadPresignInput, UploadPresignResponse } from "@repo/shared";
import { randomUUID } from "node:crypto";
import path from "node:path";

@Injectable()
export class UploadService {
  private client: S3Client | null = null;
  private bucket: string | null = null;
  private publicUrl: string | null = null;

  async createPresignedUpload(input: UploadPresignInput): Promise<UploadPresignResponse> {
    this.ensureConfigured();
    const extension = path.extname(input.filename).toLowerCase();
    if (!extension || extension.length > 10) {
      throw new BadRequestException("Tên file không hợp lệ.");
    }

    const client = this.client!;
    const bucket = this.bucket!;
    const publicUrl = this.publicUrl!;

    const key = `${input.folder}/${randomUUID()}${extension}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

    return {
      uploadUrl,
      publicUrl: `${publicUrl}/${key}`,
      key,
      headers: {
        "Content-Type": input.contentType,
      },
    };
  }

  private ensureConfigured(): void {
    if (this.client && this.bucket && this.publicUrl) {
      return;
    }

    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION ?? "us-east-1";
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const bucket = process.env.S3_BUCKET;
    const publicUrl = process.env.S3_PUBLIC_URL;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      throw new BadRequestException("Thiếu cấu hình S3.");
    }

    this.bucket = bucket;
    this.publicUrl = publicUrl.replace(/\/$/, "");
    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
}
