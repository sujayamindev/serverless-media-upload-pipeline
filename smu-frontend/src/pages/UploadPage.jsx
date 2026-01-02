import { useState } from "react";
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
  Alert
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AnimationOutlinedIcon from '@mui/icons-material/AnimationOutlined';
import DeblurOutlinedIcon from '@mui/icons-material/DeblurOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getUploadUrl, getMediaStatus } from "../api";
import axios from "axios";
import { Link } from 'react-router-dom';

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

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [mediaId, setMediaId] = useState(null);
  const [presignResponse, setPresignResponse] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [mediaStatus, setMediaStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [notification, setNotification] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress(0);
      setPresignResponse(null);
      setUploadResponse(null);
      setMediaStatus(null);
      setMediaId(null);
      setUploadError(false);
      setUploadStatusText("");
      setNotification(null);
    }
  };

  const handleUploadUrl = async () => {
    if (!file.name || !file.size) {
      throw new Error("Filename and filesize are required");
    }

    try {
      return await getUploadUrl(file.name, file.size);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadError(false);
    setUploadStatusText("Getting presigned URL...");
    setNotification(null);

    const presignData = await handleUploadUrl();
    setPresignResponse(presignData);
    setMediaId(presignData.media_id);
    setUploadProgress(50);
    setUploadStatusText("Uploading...");
    setNotification({ type: 'info', message: 'Presigned URL obtained successfully. Starting upload...' });
    try {
      const response = await axios.put(presignData.upload_url, file, {
        headers: presignData.headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });
      setUploadProgress(100);
      setUploadResponse(response);
      setUploadStatusText("Uploaded");
      setNotification({ type: 'success', message: 'File uploaded successfully! You can now check the validation status.' });
    } catch (err) {
      console.error(err);
      setUploadProgress(0);
      setUploadError(true);
      setUploadStatusText("Failed");
      setNotification({ type: 'error', message: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!mediaId) return;
    setStatusLoading(true);

    try {
      const status = await getMediaStatus(mediaId);
      setMediaStatus(status);
      
      if (status.status === 'approved') {
        setNotification({ type: 'success', message: `File validated successfully! Status: ${status.status}` });
      } else if (status.status === 'rejected') {
        setNotification({ type: 'error', message: `File rejected. Reason: ${status.reason || 'Unknown'}` });
      } else {
        setNotification({ type: 'info', message: `File status: ${status.status}` });
      }
    } catch (err) {
      // Handle error silently
      setNotification({ type: 'error', message: 'Failed to check status. Please try again.' });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{alignItems: 'center', display: 'flex'}}>
            <DeblurOutlinedIcon sx={{fontSize: 54, color: 'primary.main'}} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Smart Media Upload Pipeline
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
              Upload an image and let the backend validate it.
            </Typography>
          </Box>
        </Box>
        
        {/* How It Works Link */}
        <Button
          component={Link}
          to="/how-it-works"
          variant="outlined"
          startIcon={<InfoOutlinedIcon />}
          sx={{
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          How It Works
        </Button>
      </Box>


      <Box sx={{ display: 'flex', gap: 3, mb: 6, alignItems: 'flex-start' }}>
        {/* Left Card - Upload Section */}
        <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 4, flex: 1 }}>
          <CardContent>
            <Stack spacing={3}>
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
              <Box sx={{border: "1px solid #e0e0e0", borderRadius: 2, p: 4, textAlign: "center", gap: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <input
                  type="file"
                  accept="file/*"
                  hidden
                  id="file-input"
                  onChange={handleFileSelect}
                />

                <label htmlFor="file-input">
                  <Button variant="contained" component="span" disableElevation startIcon={<PermMediaOutlinedIcon />} 
                  sx={{
                    borderRadius: 2
                    }}>
                    Select a File
                  </Button>
                </label>
                
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
                    <Typography variant="body2">
                      {file.name} — {(file.size / 1024).toFixed(1)} KB
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
                      borderRadius: 2
                    }}
                  >
                    Upload
                  </Button>
                )
              )}

              <Divider />

              {/* Check Status Button */}
              {presignResponse && presignResponse && !uploadError && uploadProgress === 100 && (
                <Button
                  variant="outlined"
                  onClick={handleCheckStatus}
                  disabled={statusLoading}
                  disableElevation 
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{
                    borderWidth: 2,
                    borderRadius: 2
                  }}
                >
                  {statusLoading ? "Checking..." : "Check Status"}
                </Button>
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

             {/* Presign Response */}
              {presignResponse && (
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
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {JSON.stringify(presignResponse, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Upload Response */}
              {uploadResponse && (
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
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {JSON.stringify(uploadResponse, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Validation Result */}
              {presignResponse && uploadResponse && mediaStatus &&!uploadError && uploadProgress === 100 && (
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
                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.875rem" }}>
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
                      maxHeight: "auto",
                      display: "flex",
                      justifyContent: "center"
                    }}
                  >
                    <img
                      src={mediaStatus.preview_url}
                      alt="Preview"
                      style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
                    />
                  </AccordionDetails>
                </Accordion>
              )}

            </Stack>
          </CardContent>
        </Card>
      </Box>

    </Container>
  );
}
