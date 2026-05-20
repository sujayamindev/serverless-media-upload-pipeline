import axios from 'axios';
import { getAccessToken } from './auth/cognito';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) throw new Error('VITE_API_BASE_URL is not set.');

const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getUploadUrl = async (filename, filesize) => {
  const response = await apiClient.post('/generate-upload-url', {
    filename,
    filesize,
  });
  return response.data;
};

export const getMediaStatus = async (mediaId) => {
  const response = await apiClient.post('/media-status', {
    media_id: mediaId,
  });
  return response.data;
};
