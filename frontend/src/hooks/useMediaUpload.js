import { useState, useEffect } from 'react';
import axios from 'axios';
import { getUploadUrl, getMediaStatus } from '../api';

// activeStep values, in the order the pipeline moves through them.
export const STEP = {
  IDLE: -1,
  SELECTED: 0,
  PERMISSION: 1,
  UPLOADING: 2,
  UPLOADED: 3,
  CHECKING: 4,
  DONE: 5,
};

const POLL_MAX_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 3000;

const pollValidationStatus = async (mediaId, signal) => {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError');
    }
    try {
      const result = await getMediaStatus(mediaId);
      // pending is an intermediate state — keep polling.
      if (result.status !== 'pending') {
        // approved, rejected, or any other terminal value.
        return result;
      }
    } catch (err) {
      if (signal?.aborted) {
        throw new DOMException('Polling aborted', 'AbortError');
      }
      // 404 means Lambda hasn't written to DynamoDB yet — keep polling.
      if (err.response?.status !== 404) {
        // Real error — stop polling
        throw err;
      }
    }

    // Sleep, but bail immediately if the caller aborts mid-sleep.
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, POLL_INTERVAL_MS);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Polling aborted', 'AbortError'));
        }, { once: true });
      }
    });
  }

  throw new Error('Validation timed out after 90 seconds');
};

export function useMediaUpload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [mediaId, setMediaId] = useState(null);
  const [presignResponse, setPresignResponse] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [mediaStatus, setMediaStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeStep, setActiveStep] = useState(STEP.IDLE);
  // Which stage failed: 'permission' | 'upload' | 'check' | null.
  const [failedAt, setFailedAt] = useState(null);

  const resetState = () => {
    setUploadProgress(0);
    setPresignResponse(null);
    setUploadResponse(null);
    setMediaStatus(null);
    setMediaId(null);
    setUploadError(false);
    setUploadSuccess(false);
    setNotification(null);
    setFailedAt(null);
  };

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    resetState();
    setActiveStep(STEP.SELECTED);
  };

  const clearFile = () => {
    setFile(null);
    resetState();
    setActiveStep(STEP.IDLE);
  };

  const rejectFile = (message) => {
    setNotification({ type: 'error', message });
  };

  const upload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadError(false);
    setFailedAt(null);
    setNotification(null);
    setActiveStep(STEP.PERMISSION);

    let presigned = false;
    try {
      if (!file.name || !file.size) {
        throw new Error('Filename and filesize are required');
      }
      const presignData = await getUploadUrl(file.name, file.size);
      presigned = true;
      setPresignResponse(presignData);
      setMediaId(presignData.media_id);
      setUploadProgress(0);
      setActiveStep(STEP.UPLOADING);

      const { fields } = presignData.upload;

      const formData = new FormData();

      // Append fields FIRST
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // File MUST be last
      formData.append('file', file);

      const response = await axios.post(presignData.upload.url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setUploadResponse(response);
      setUploadProgress(100);
      setActiveStep(STEP.UPLOADED);
      setUploadSuccess(true);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(true);
      setUploadProgress(0);
      setFailedAt(presigned ? 'upload' : 'permission');
      setActiveStep(STEP.SELECTED);

      const status = err?.response?.status;
      let message;
      if (status === 401 || status === 403) {
        message = 'Authentication error — please sign in again.';
      } else if (status === 400) {
        message = 'Upload rejected: invalid file or request.';
      } else {
        message = 'Upload failed. Check the console for details.';
      }
      setNotification({ type: 'error', message });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!(uploadSuccess && mediaId)) return undefined;

    const controller = new AbortController();

    const checkStatus = async () => {
      setStatusLoading(true);
      setActiveStep((prev) => (prev < STEP.CHECKING ? STEP.CHECKING : prev));

      try {
        const status = await pollValidationStatus(mediaId, controller.signal);
        if (controller.signal.aborted) return;
        setMediaStatus(status);
        setActiveStep(STEP.DONE);

        if (status.status === 'approved') {
          setNotification({ type: 'success', message: 'File approved.' });
        } else if (status.status === 'rejected') {
          setNotification({ type: 'error', message: `File rejected. Reason: ${status.rejection_reason || 'Unknown'}` });
        } else {
          setNotification({ type: 'warning', message: `Unexpected status: ${status.status}` });
        }
      } catch (err) {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        setFailedAt('check');
        setNotification({ type: 'error', message: err.message || 'Failed to check status.' });
      } finally {
        if (!controller.signal.aborted) setStatusLoading(false);
      }
    };

    checkStatus();

    return () => {
      controller.abort();
    };
  }, [uploadSuccess, mediaId]);

  return {
    file,
    activeStep,
    failedAt,
    uploading,
    uploadProgress,
    statusLoading,
    notification,
    dismissNotification: () => setNotification(null),
    presignResponse,
    uploadResponse,
    mediaStatus,
    selectFile,
    clearFile,
    rejectFile,
    upload,
    // Uploading, or waiting on the validator; used to lock the file controls.
    busy: uploading || statusLoading,
    // The upload button shows until a run has started for this file.
    canUpload: !!file && !uploading && activeStep <= STEP.SELECTED,
    uploadError,
  };
}
