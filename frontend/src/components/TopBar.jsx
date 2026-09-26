import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../auth/useAuth';
import { t } from '../lib/tokens';

const REPO_URL = 'https://github.com/sujayamindev/serverless-media-upload-pipeline';

export default function TopBar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const onHowItWorks = pathname === '/how-this-works';

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: t.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, py: 1 }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: t.ink, textDecoration: 'none', mr: 'auto' }}
        >
          <BrandMark />
          <Typography component="span" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'inline' } }}>
            Media Upload Pipeline
          </Typography>
        </Box>

        <Button component={RouterLink} to={onHowItWorks ? '/' : '/how-this-works'} variant="text">
          {onHowItWorks ? 'Upload' : 'How it works'}
        </Button>

        {user?.email && (
          <Typography
            variant="body2"
            noWrap
            sx={{ color: t.ink42, display: { xs: 'none', md: 'block' }, maxWidth: 220 }}
          >
            {user.email}
          </Typography>
        )}

        <IconButton
          component="a"
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          size="small"
        >
          <GitHubIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <ThemeToggle />

        <Button onClick={signOut} variant="contained" size="small">
          Sign out
        </Button>
      </Container>
    </Box>
  );
}
