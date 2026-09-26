import { Box } from '@mui/material';
import TopBar from './TopBar';
import BrandMark from './BrandMark';
import { inset, dottedRule } from '../lib/layout';
import { metaType, t } from '../lib/tokens';

/** Page frame: floating nav, main content, dotted-rule footer. */
export default function PageShell({ navAction, children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: t.bg, overflowX: 'clip' }}>
      <TopBar action={navAction} />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Box component="footer" sx={{ mt: { xs: 8, md: 15 } }}>
        <Box component="hr" sx={dottedRule} />
        <Box
          sx={{
            ...inset,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 4,
            color: t.ink42,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: t.ink60 }}>
            <BrandMark size={14} />
            <Box component="span" sx={{ ...metaType, color: t.ink42 }}>
              Serverless media upload pipeline
            </Box>
          </Box>
          <Box component="span" sx={{ ...metaType, color: t.ink42 }}>
            CloudFront · API Gateway · Lambda · S3 · DynamoDB
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
