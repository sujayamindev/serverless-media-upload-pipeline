import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { CaretDownIcon } from '@phosphor-icons/react';
import { MONO_FONT } from '../theme';
import { t } from '../lib/tokens';

function JsonBlock({ title, value }) {
  return (
    <Box>
      <Typography variant="meta" component="h3" sx={{ m: 0, mb: 0.75 }}>
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
          bgcolor: t.ink6,
          color: t.ink70,
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
    <Accordion>
      <AccordionSummary expandIcon={<CaretDownIcon size={18} />}>
        <Typography variant="h4" component="span">
          Technical details
        </Typography>
        <Typography variant="meta">Raw responses from each service</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2.5}>
          {presignResponse && <JsonBlock title="Upload permission" value={presignResponse} />}
          {uploadResponse && <JsonBlock title="S3 upload" value={uploadResponse} />}
          {mediaStatus && <JsonBlock title="Validation result" value={mediaStatus} />}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
