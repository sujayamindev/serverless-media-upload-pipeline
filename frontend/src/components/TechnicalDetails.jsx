import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import PlusMinus from './PlusMinus';
import { MONO, metaType, t } from '../lib/tokens';

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
      <Box component="h3" sx={{ ...metaType, color: t.ink42, m: 0, mb: 1 }}>
        {title}
      </Box>
      <Box
        component="pre"
        tabIndex={0}
        aria-label={`${title} response`}
        sx={{
          m: 0,
          p: 2,
          maxHeight: 280,
          overflow: 'auto',
          bgcolor: t.windowBody,
          border: `1px solid ${t.border}`,
          color: t.ink70,
          fontFamily: MONO,
          fontSize: 12,
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
    <Accordion>
      <AccordionSummary expandIcon={<PlusMinus />}>
        <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2, rowGap: 0.5 }}>
          <span>Technical details</span>
          <Typography component="span" variant="meta">
            Raw responses from each service
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={3}>
          {presignResponse && <JsonBlock title="Upload permission" value={redactPresign(presignResponse)} />}
          {uploadResponse && <JsonBlock title="S3 upload" value={uploadResponse} />}
          {mediaStatus && <JsonBlock title="Validation result" value={mediaStatus} />}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
