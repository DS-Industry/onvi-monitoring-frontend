import api from '@/config/axiosConfig';

export interface PresignedUrlRequest {
  key: string;
  expiresIn?: number;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

export async function getPresignedUploadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<PresignedUrlResponse> {
  const response = await api.post('/user/s3/presigned-url', {
    key,
    expiresIn,
  });
  return response.data;
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 1800
): Promise<PresignedUrlResponse> {
  const response = await api.get('/user/s3/presigned-url', {
    params: { key, expiresIn },
  });
  return response.data;
}

export async function uploadFileToS3(
  file: File,
  presignedUrl: string
): Promise<void> {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
      mode: 'cors', 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('S3 Upload Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: presignedUrl,
      });
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error('CORS Error: S3 bucket needs to be configured to allow uploads from your domain. Please check S3 CORS configuration.');
    }
    throw error;
  }
}

export async function uploadFileWithPresignedUrl(
  file: File,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { url } = await getPresignedUploadUrl(key, expiresIn);
    
    await uploadFileToS3(file, url);
    
    return key;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

export function generateTechTaskImageKey(
  posId: number,
  techTaskId: number,
  itemId: number,
  fileName: string
): string {
  const timestamp = Date.now();
  return `pos/${posId}/techTask/${techTaskId}/${itemId}/${timestamp}-${fileName}`;
}
