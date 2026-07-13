import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export class UploadService {
  async getPresignedUrl(sellerId: string, mimeType: 'application/pdf' | 'image/jpeg' | 'image/png') {
    const ext = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1]
    const key = `tickets/${sellerId}/${randomUUID()}.${ext}`
    const command = new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME!,
      Key:         key,
      ContentType: mimeType,
    })
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
    const fileUrl   = `${process.env.R2_PUBLIC_URL}/${key}`
    return { uploadUrl, fileUrl, key }
  }
}
