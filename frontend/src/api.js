import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy frontend/.env.example to frontend/.env and fill in the value.'
  );
}

export const getUploadUrl = async (filename, filesize) => {
  try {
    const response = await axios.post(`${API_BASE}/generate-upload-url`, {
      filename,
      filesize,
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

export const getMediaStatus = async (mediaId) => {
  try {
    const response = await axios.post(`${API_BASE}/media-status`, {
      media_id: mediaId,
    });
    return response.data;
  } catch (err) {
    return err;
  }
};