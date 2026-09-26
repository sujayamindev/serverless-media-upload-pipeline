import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';
import GitHubMark from './GitHubMark';
import { useAuth } from '../auth/useAuth';
import { metaType, t } from '../lib/tokens';

const REPO_URL = 'https://github.com/sujayamindev/serverless-media-upload-pipeline';

const LINKS = [
  { to: '/', label: 'Upload' },
  { to: '/how-this-works', label: 'How it works' },
];

// Floating translucent capsule (DESIGN.md §4/§5).
function Capsule({ area, sx, children, ...props }) {
  return (
    <Box
      {...props}
      sx={[
        {
          gridArea: area,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          height: 44,
          px: '6px',
          borderRadius: '9999px',
          bgcolor: t.navCapsule,
          border: `1px solid ${t.navRim}`,
          boxShadow: t.shadowNav,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

const navLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  height: 32,
  px: '14px',
  borderRadius: '9999px',
  fontSize: 14,
  lineHeight: '21px',
  fontWeight: 500,
  color: t.ink60,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'color 250ms var(--ease)',
  '&:hover': { color: t.ink },
  '&[aria-current="page"]': { color: t.ink },
  '&:focus-visible': { outline: `1px solid ${t.ink}`, outlineOffset: 2 },
};

/** Three floating capsules: links (left), brand (centre), account (right). */
export default function TopBar() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();

  return (
    <Box
      component="header"
      sx={{
        position: { xs: 'relative', md: 'sticky' },
        top: 0,
        zIndex: 10,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: 'minmax(0, 1fr) auto minmax(0, 1fr)' },
        gridTemplateAreas: { xs: '"brand account" "links links"', md: '"links brand account"' },
        alignItems: 'center',
        columnGap: 1.5,
        rowGap: 1,
        px: { xs: 2, md: '30px' },
        pt: { xs: 2, md: '30px' },
      }}
    >
      <Capsule component="nav" aria-label="Main" area="links" sx={{ justifySelf: { xs: 'center', md: 'start' } }}>
        {LINKS.map((link) => (
          <Box
            key={link.to}
            component={RouterLink}
            to={link.to}
            aria-current={pathname === link.to ? 'page' : undefined}
            sx={navLink}
          >
            {link.label}
          </Box>
        ))}
        <Box
          component="a"
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={navLink}
          aria-label="Source on GitHub (opens in a new tab)"
        >
          <GitHubMark size={16} />
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            GitHub
          </Box>
        </Box>
      </Capsule>

      <Capsule
        area="brand"
        sx={{
          justifySelf: { xs: 'start', md: 'center' },
          justifyContent: 'center',
          width: { md: 385 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: t.ink,
            textDecoration: 'none',
            minWidth: 0,
            '&:focus-visible': { outline: `1px solid ${t.ink}`, outlineOffset: 4 },
          }}
        >
          <BrandMark />
          <Typography component="span" sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Media Upload{' '}
            </Box>
            Pipeline
          </Typography>
        </Box>
      </Capsule>

      <Capsule area="account" sx={{ justifySelf: 'end', gap: 1, pl: '8px' }}>
        <ThemeToggle />
        {user?.email && (
          <Box
            component="span"
            title={user.email}
            sx={{
              ...metaType,
              color: t.ink42,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: { xs: 'none', lg: 'block' },
              textTransform: 'none',
              letterSpacing: 0,
            }}
          >
            {user.email}
          </Box>
        )}
        <Button variant="contained" size="small" onClick={signOut}>
          Sign out
        </Button>
      </Capsule>
    </Box>
  );
}
