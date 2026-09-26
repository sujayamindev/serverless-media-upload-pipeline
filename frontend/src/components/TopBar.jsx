import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { FaGithub } from 'react-icons/fa';
import BrandMark from './BrandMark';
import { useAuth } from '../auth/useAuth';

const REPO_URL = 'https://github.com/sujayamindev/serverless-media-upload-pipeline';

export default function TopBar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const onHowItWorks = pathname === '/how-this-works';

  return (
    <Box
      component="header"
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, py: 1.25 }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            textDecoration: 'none',
            mr: 'auto',
          }}
        >
          <BrandMark />
          <Typography
            variant="h5"
            component="span"
            sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline' } }}
          >
            Media Upload Pipeline
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to={onHowItWorks ? '/' : '/how-this-works'}
          color="inherit"
          size="small"
        >
          {onHowItWorks ? 'Upload' : 'How it works'}
        </Button>

        {user?.email && (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 220 }}
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
          sx={{ color: 'text.secondary' }}
        >
          <FaGithub size={20} />
        </IconButton>

        <Button
          onClick={signOut}
          size="small"
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Sign out
        </Button>
      </Container>
    </Box>
  );
}
