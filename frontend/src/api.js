import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_KEY  = import.meta.env.VITE_API_KEY;

if (!API_BASE) throw new Error('VITE_API_BASE_URL is not set.');
if (!API_KEY)  throw new Error('VITE_API_KEY is not set.');

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-api-key': API_KEY,
  },
});

export const getUploadUrl = async (filename, filesize) => {
  try {
    const response = await apiClient.post('/generate-upload-url', {
      filename,
      filesize,
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

export const getMediaStatus = async (mediaId) => {
  const response = await apiClient.post('/media-status', {
    media_id: mediaId,
  });
  return response.data;
};