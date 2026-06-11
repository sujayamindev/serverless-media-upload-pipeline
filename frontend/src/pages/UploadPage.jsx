import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Chip,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { styled, keyframes } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import DeblurOutlinedIcon from '@mui/icons-material/DeblurOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ApiIcon from '@mui/icons-material/Api';
import FunctionsIcon from '@mui/icons-material/Functions';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ImageIcon from '@mui/icons-material/Image';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Looks5OutlinedIcon from '@mui/icons-material/Looks5Outlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { getUploadUrl, getMediaStatus } from "../api";
import axios from "axios";
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const canPlayQuicktime = document.createElement('video').canPlayType('video/quicktime') !== '';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  alternativeLabel: {
    top: 22,
  },
  active: {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  completed: {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  line: {
    borderColor: '#e0e0e0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const pollValidationStatus = async (mediaId, signal) => {
  const maxAttempts = 30;
  const interval = 3000; // 3 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError');
    }
    try {
      const result = await getMediaStatus(mediaId);
      // pending is an intermediate state — keep polling.
      if (result.status === 'pending') {
        // fallthrough to sleep
      } else {
        // approved, rejected, or any other terminal value.
        return result;
      }
    } catch (err) {
      if (signal?.aborted) {
        throw new DOMException('Polling aborted', 'AbortError');
      }
      // 404 means Lambda hasn't written to DynamoDB yet — keep polling.
      if (err.response?.status === 404) {
        // fallthrough to sleep
      } else {
        // Real error — stop polling
        throw err;
      }
    }

    // Sleep, but bail immediately if the caller aborts mid-sleep.
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, interval);
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

export default function UploadPage() {
  const { signOut } = useAuth();
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
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [notification, setNotification] = useState(null);
  const [activeStep, setActiveStep] = useState(-1);

  const resetState = () => {
    setUploadProgress(0);
    setPresignResponse(null);
    setUploadResponse(null);
    setMediaStatus(null);
    setMediaId(null);
    setUploadError(false);
    setUploadSuccess(false);
    setUploadStatusText("");
    setNotification(null);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      resetState();
      setActiveStep(0);
    }
  };

  const handleUploadUrl = async () => {
    if (!file.name || !file.size) {
      throw new Error("Filename and filesize are required");
    }
    return await getUploadUrl(file.name, file.size);
  };

  const handleUpload = async () => {
  if (!file) return;

  setUploading(true);
  setUploadError(false);
  setUploadStatusText("Requesting upload policy...");
  setNotification(null);
  setActiveStep(1);

  try {
    const presignData = await handleUploadUrl();
    setPresignResponse(presignData);
    setMediaId(presignData.media_id);
    setUploadProgress(0);
    setActiveStep(2);

    const { fields } = presignData.upload;

    const formData = new FormData();

    // Append fields FIRST
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // File MUST be last
    formData.append("file", file);

    setUploadStatusText("Uploading to S3...");

    const response = await axios.post(presignData.upload.url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      }
    });

    setUploadResponse(response);
    setUploadStatusText("Upload complete");
    setUploadProgress(100);
    setActiveStep(3);
    setUploadSuccess(true);
    setNotification({
      type: "success",
      message: "Upload successful. S3 validated size and type."
    });

  } catch (err) {
    console.error("Upload error:", err);
    setUploadError(true);
    setUploadProgress(0);
    setUploadStatusText("Upload failed");
    setActiveStep(0);

    const status = err?.response?.status;
    let message;
    if (status === 401 || status === 403) {
      message = "Authentication error — please sign in again.";
    } else if (status === 400) {
      message = "Upload rejected: invalid file or request.";
    } else {
      message = "Upload failed. Check the console for details.";
    }
    setNotification({ type: "error", message });
  } finally {
    setUploading(false);
  }
  };

  useEffect(() => {
    if (!(uploadSuccess && mediaId)) return undefined;

    const controller = new AbortController();

    const checkStatus = async () => {
      setStatusLoading(true);
      setActiveStep((prev) => (prev < 4 ? 4 : prev));

      try {
        const status = await pollValidationStatus(mediaId, controller.signal);
        if (controller.signal.aborted) return;
        setMediaStatus(status);

        if (status.status === 'approved') {
          setActiveStep(5);
          setNotification({ type: 'success', message: `File validated successfully! Status: ${status.status}` });
        } else if (status.status === 'rejected') {
          setActiveStep(5);
          setNotification({ type: 'error', message: `File rejected. Reason: ${status.rejection_reason || 'Unknown'}` });
        } else {
          setActiveStep(5);
          setNotification({ type: 'warning', message: `Unexpected status: ${status.status}` });
        }
      } catch (err) {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        setNotification({ type: 'error', message: err.message || 'Failed to check status. Retrying...' });
      } finally {
        if (!controller.signal.aborted) setStatusLoading(false);
      }
    };

    checkStatus();

    return () => {
      controller.abort();
    };
  }, [uploadSuccess, mediaId]);

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{alignItems: 'center', display: 'flex'}}>
            <DeblurOutlinedIcon sx={{ fontSize: { xs: 36, sm: 54 }, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
              Serverless Media Upload Pipeline
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
              Upload media securely with server-side validation on AWS
            </Typography>
          </Box>
        </Box>

        {/* How It Works Link + Sign out */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/how-this-works"
            variant="text"
            startIcon={<InfoOutlinedIcon />}
            sx={{ borderRadius: 2 }}
          >
            How This Works
          </Button>
          <Button
            onClick={signOut}
            variant="text"
            startIcon={<LogoutIcon />}
            sx={{ borderRadius: 2, color: 'text.secondary' }}
          >
            Sign out
          </Button>
        </Box>
      </Box>

      {/* AWS Pipeline Visualization */}
      <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 4, mb: 4 }}>
        <CardContent sx={{ overflowX: 'auto' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            AWS Pipeline Flow
          </Typography>
          <Box sx={{ minWidth: 500 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorlibConnector />}
          >
            <Step>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    mt: -1,
                    borderRadius: '50%', 
                    backgroundColor: activeStep >= 0 ? 'primary.main' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PermMediaOutlinedIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              >
                <Typography variant="caption" fontWeight={activeStep >= 0 ? "bold" : "normal"}>
                  File Selected
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    mt: -1,
                    borderRadius: '50%', 
                    backgroundColor: activeStep >= 1 ? 'primary.main' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ApiIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              >
                <Typography variant="caption" fontWeight={activeStep >= 1 ? "bold" : "normal"}>
                  API Gateway
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    mt: -1,
                    borderRadius: '50%', 
                    backgroundColor: activeStep >= 2 ? 'primary.main' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FunctionsIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              >
                <Typography variant="caption" fontWeight={activeStep >= 2 ? "bold" : "normal"}>
                  Lambda (Presign)
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    mt: -1,
                    borderRadius: '50%', 
                    backgroundColor: activeStep >= 3 ? 'primary.main' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CloudQueueIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              >
                <Typography variant="caption" fontWeight={activeStep >= 3 ? "bold" : "normal"}>
                  S3 Upload
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    mt: -1,
                    borderRadius: '50%', 
                    backgroundColor: activeStep >= 4 ? 'primary.main' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: statusLoading ? `${pulse} 1.5s ease-in-out infinite` : 'none',
                  }}>
                    <StorageIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              >
                <Typography variant="caption" fontWeight={activeStep >= 4 ? "bold" : "normal"}>
                  DynamoDB Query
                </Typography>
              </StepLabel>
            </Step>
            <Step>
              <StepLabel 
                StepIconComponent={() => (
                  <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  mt: -1,
                  borderRadius: '50%', 
                  backgroundColor: activeStep >= 5 ? 'primary.main' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: statusLoading ? `${pulse} 1.5s ease-in-out infinite` : 'none',
                }}>
                  <CheckCircleOutlineOutlinedIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                )}
              >
                <Typography variant="caption" fontWeight={activeStep >= 5 ? "bold" : "normal"}>
                  Validation Complete
                </Typography>
              </StepLabel>
            </Step>
          </Stepper>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 6, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
        {/* Left Card - Upload Section */}
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 4, flex: 1 }}>
          <CardContent>
            <Stack spacing={3}>
              {/* File Requirements Info Card */}
              <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  File Requirements
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ImageOutlinedIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Accepted formats: JPEG, PNG, WebP, MP4, WebM, MOV"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Looks5OutlinedIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Maximum file size: 50 MB"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </Alert>

              {/* Notification Area */}
              {notification && (
                <Alert 
                  severity={notification.type} 
                  onClose={() => setNotification(null)}
                  sx={{ borderRadius: 2 }}
                >
                  {notification.message}
                </Alert>
              )}

              {/* File Picker */}
              <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: { xs: 2, sm: 4 }, textAlign: "center", gap: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    id="file-input"
                    onChange={handleFileSelect}
                  />

                  <label htmlFor="file-input">
                    <Button variant="contained" component="span" disableElevation startIcon={<PermMediaOutlinedIcon />} 
                    sx={{
                      borderRadius: 2,
                      px: 2.5,
                      }}>
                      Select a File
                    </Button>
                  </label>
                  
                  {file && (
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setFile(null);
                        resetState();
                        setActiveStep(-1);
                      }}
                      startIcon={<ClearIcon />}
                      disableElevation 
                      color="warning"
                      sx={{
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2
                        }
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
                
                <Box 
                sx={{ 
                  mt: 1, 
                  backgroundColor: "#f5f5f5", 
                  borderRadius: 2, 
                  px: 2,
                  py: 1,
                  textAlign: "center",
                  verticalAlign: "middle" 
                  }} >
                  {file && (
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {file.name} — {file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Upload Progress */}
              {uploading || uploadProgress > 0 ? (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }} color={uploadError ? "error" : "text.secondary"}>
                    {uploadStatusText}
                  </Typography>
                  <LinearProgressWithLabel value={uploadProgress} />
                </Box>
              ) : (
                file && (
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading}
                    disableElevation 
                    startIcon={<CloudUploadOutlinedIcon />}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    Upload
                  </Button>
                )
              )}

            </Stack>
          </CardContent>
        </Card>

        {/* Right Card - New Section */}
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 4, flex: 1 }}>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="bold">
                Responses
              </Typography>

              {/* Empty State */}
              {!presignResponse && !uploadResponse && !mediaStatus && (
                <Box 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No Upload Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select and upload a file to see technical responses from AWS services including presigned URLs, upload confirmations, and validation results.
                  </Typography>
                </Box>
              )}

             {/* Presign Response */}
              {uploading && !presignResponse && (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Box>
              )}
              {presignResponse && (() => {
                const displayData = { ...presignResponse };
                if (displayData.upload?.fields) {
                  // eslint-disable-next-line no-unused-vars
                  const { policy, 'x-amz-signature': _xAmzSig, ...safeFields } = displayData.upload.fields;
                  displayData.upload = {
                    ...displayData.upload,
                    fields: { ...safeFields, policy: '[redacted]', 'x-amz-signature': '[redacted]' }
                  };
                }
                return (
                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                    marginTop: "20px !important"
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      "&.Mui-expanded": {
                        borderRadius: "8px 8px 0 0"
                      }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Presigned URL Response
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: "#fafafa",
                      p: 2,
                      overflow: "auto",
                      maxHeight: "300px"
                    }}
                  >
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.75rem", overflowX: "auto" }}>
                      {JSON.stringify(displayData, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
                );
              })()}

              {/* Upload Response */}
              {uploading && presignResponse && !uploadResponse && (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1 }} />
                  <Skeleton variant="text" width="50%" />
                </Box>
              )}
              {uploadResponse && (
                <Accordion 
                  elevation={0}
                  sx={{ 
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                    marginTop: "20px !important"
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      "&.Mui-expanded": {
                        borderRadius: "8px 8px 0 0"
                      }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Upload Response
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: "#fafafa",
                      p: 2,
                      overflow: "auto",
                      maxHeight: "300px"
                    }}
                  >
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.75rem", overflowX: "auto" }}>
                      {JSON.stringify(uploadResponse, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Validation Result */}
              {statusLoading && (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1 }} />
                  <Skeleton variant="text" width="70%" />
                </Box>
              )}
              {presignResponse && uploadResponse && mediaStatus &&!uploadError && uploadProgress === 100 && (
                <Accordion 
                  elevation={0}
                  sx={{ 
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                    marginTop: "20px !important"
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      "&.Mui-expanded": {
                        borderRadius: "8px 8px 0 0"
                      }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Validation Result
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: "#fafafa",
                      p: 2,
                      overflow: "auto",
                      maxHeight: "300px"
                    }}
                  >
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.75rem", overflowX: "auto" }}>
                      {JSON.stringify(mediaStatus, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Media Preview */}
              {mediaStatus?.status === "approved" && mediaStatus.preview_url && (
                <Accordion 
                  defaultExpanded
                  elevation={0}
                  sx={{ 
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                    marginTop: "20px !important"
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      "&.Mui-expanded": {
                        borderRadius: "8px 8px 0 0"
                      }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Preview
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: "#fafafa",
                      p: 2,
                      overflow: "auto",
                      maxHeight: "none",
                      display: "flex",
                      justifyContent: "center"
                    }}
                  >
                    {mediaStatus.content_type?.startsWith('video/') ? (
                      mediaStatus.content_type === 'video/quicktime' && !canPlayQuicktime ? (
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            MOV files cannot be previewed in the browser. Download to view.
                          </Typography>
                          <Button
                            variant="outlined"
                            href={mediaStatus.preview_url}
                            download
                            startIcon={<CloudDownloadOutlinedIcon />}
                            sx={{
                              borderRadius: 2,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                            Download File
                          </Button>
                        </Box>
                      ) : (
                      <video
                        controls
                        crossOrigin="anonymous"
                        preload="metadata"
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
                      >
                        <source src={mediaStatus.preview_url} type={mediaStatus.content_type} />
                        Your browser does not support the video tag.
                      </video>
                      )
                    ) : (
                      <img
                        src={mediaStatus.preview_url}
                        alt="Preview"
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* GitHub Repository Link */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: { xs: 'none', md: 'block' } }}>
        <a 
          href="https://github.com/sujayamindev/serverless-media-upload-pipeline"
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            textDecoration: 'none',
            color: 'inherit',
            opacity: 0.6, 
            transition: 'opacity 0.2s', 
            cursor: 'pointer' 
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"
            alt="GitHub Repository"
            style={{ width: 24, height: 24 }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>View on GitHub</span>
        </a>
      </Box>

    </Container>
  );
}
