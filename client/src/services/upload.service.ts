import api from './api';

export interface UploadResult {
  url: string;
  public_id: string;
}

/**
 * Uploads a single image file to the backend, which streams it to Cloudinary.
 * Returns the Cloudinary URL to store in the listing's images array.
 */
export const uploadImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data;
};
