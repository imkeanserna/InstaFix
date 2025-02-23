import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PostMedia } from '@repo/types';
import { getR2Client, getR2PublicUrl } from './r2-client';
import { MediaType } from '@prisma/client';
import { prisma } from '@/server/index';

// export const runtime = 'edge'

interface UploadConfig {
  maxFileSizeInMB?: number;
  allowedMimeTypes?: string[];
}

const DEFAULT_CONFIG: UploadConfig = {
  maxFileSizeInMB: 5,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ]
};

export function validateFile(file: File, config: UploadConfig = DEFAULT_CONFIG): string | null {
  if (!file) {
    return 'No file provided';
  }

  if (config.maxFileSizeInMB && file.size > config.maxFileSizeInMB * 1024 * 1024) {
    return `File size exceeds ${config.maxFileSizeInMB}MB limit`;
  }

  if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.type)) {
    return `File type ${file.type} not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`;
  }

  return null;
}

function getMediaType(mimeType: string): MediaType {
  return mimeType.startsWith('video/') ? MediaType.VIDEO : MediaType.IMAGE;
}

function generateFileName(file: File): string {
  const extension = file.name.split('.').pop();
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
}

export async function uploadSingleFile(
  file: File,
  config: UploadConfig = DEFAULT_CONFIG
): Promise<PostMedia> {
  const r2 = getR2Client();
  const publicUrl = getR2PublicUrl();
  const validationError = validateFile(file, config);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = generateFileName(file);

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    }));

    return {
      url: `${publicUrl}/${fileName}`,
      type: getMediaType(file.type)
    };
  } catch (error) {
    throw new Error(`Failed to upload file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadMultipleFiles(
  files: File[],
  config: UploadConfig = DEFAULT_CONFIG
): Promise<PostMedia[]> {
  if (!files.length) {
    throw new Error('No files provided');
  }

  // Validate all files before uploading any
  const validationErrors = files
    .map(file => ({ file: file.name, error: validateFile(file, config) }))
    .filter(result => result.error !== null);

  if (validationErrors.length > 0) {
    throw new Error(
      `Validation failed for files: ${validationErrors
        .map(error => `${error.file}: ${error.error}`)
        .join(', ')}`
    );
  }

  try {
    return await Promise.all(files.map(file => uploadSingleFile(file, config)));
  } catch (error) {
    throw new Error(`Failed to upload multiple files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFilesFromR2(urls: string[]): Promise<void> {
  const deletePromises = urls.map(url => {
    const fileName = getFileNameFromUrl(url);
    return deleteFileFromR2(fileName);
  });

  await Promise.allSettled(deletePromises);
}

async function deleteFileFromR2(fileName: string): Promise<void> {
  const r2 = getR2Client();

  try {
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName
    }));
  } catch (error) {
    console.error(`Failed to delete file ${fileName}:`, error);
    // Don't throw here - we want to continue even if some deletions fail
    // continue only if there's an error
  }
}

export async function getCurrentMediaUrls(postId: string): Promise<string[]> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      media: {
        select: { url: true }
      }
    }
  });

  return post?.media.map(media => media.url) || [];
}

function getFileNameFromUrl(url: string): string {
  return url.split('/').pop() || '';
}
