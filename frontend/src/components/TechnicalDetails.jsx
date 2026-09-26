import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MONO_FONT } from '../theme';

function redactPresign(presignResponse) {
  if (!presignResponse?.upload?.fields) return presignResponse;
  // eslint-disable-next-line no-unused-vars
  const { policy, 'x-amz-signature': _signature, ...safeFields } = presignResponse.upload.fields;
  return {
    ...presignResponse,
    upload: {
      ...presignResponse.upload,
      fields: { ...safeFields, policy: '[redacted]', 'x-amz-signature': '[redacted]' },
    },
  };
}

function JsonBlock({ title, value }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      <Box
        component="pre"
        tabIndex={0}
        sx={{
          m: 0,
          p: 1.5,
          maxHeight: 280,
          overflow: 'auto',
          bgcolor: 'action.hover',
          borderRadius: 0.5,
          fontFamily: MONO_FONT,
          fontSize: '0.75rem',
          lineHeight: 1.6,
        }}
      >
        {JSON.stringify(value, null, 2)}
      </Box>
    </Box>
  );
}

export default function TechnicalDetails({ presignResponse, uploadResponse, mediaStatus }) {
  if (!presignResponse && !uploadResponse && !mediaStatus) return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Technical details</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5, alignSelf: 'center' }}>
          Raw responses from each service
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2.5}>
          {presignResponse && <JsonBlock title="Upload permission" value={redactPresign(presignResponse)} />}
          {uploadResponse && <JsonBlock title="S3 upload" value={uploadResponse} />}
          {mediaStatus && <JsonBlock title="Validation result" value={mediaStatus} />}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
