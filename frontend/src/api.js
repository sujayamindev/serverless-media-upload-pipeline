import axios from 'axios';

const API_BASE = 'https://oqw0a4j9b8.execute-api.us-east-1.amazonaws.com'; // API Gateway endpoint

export const getUploadUrl = async (filename, filesize) => {
  try {
    const response = await axios.post(`${API_BASE}/generate-upload-url`, {
      filename,
      filesize,
    });
    return response.data;
  } catch (err) {
    return (err);
  }
};

export const getMediaStatus = async (mediaId) => {
  try {
    const response = await axios.post(`${API_BASE}/media-status`, {
      media_id: mediaId,
    });
    return response.data;
  } catch (err) {
    return (err);
  }
};
