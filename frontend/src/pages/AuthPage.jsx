import { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Link,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import PageShell from '../components/PageShell';
import BracketFrame from '../components/BracketFrame';
import Eyebrow from '../components/Eyebrow';
import { useAuth } from '../auth/useAuth';
import { inset } from '../lib/layout';
import { MONO, t } from '../lib/tokens';

const VIEW_LOGIN = 'login';
const VIEW_REGISTER = 'register';
const VIEW_CONFIRM = 'confirm';

const HEADINGS = {
  [VIEW_LOGIN]: 'Sign in',
  [VIEW_REGISTER]: 'Create an account',
  [VIEW_CONFIRM]: 'Confirm your email',
};

const EYEBROWS = {
  [VIEW_LOGIN]: 'Account · Sign in',
  [VIEW_REGISTER]: 'Account · New',
  [VIEW_CONFIRM]: 'Account · Verify',
};

const FACTS = [
  'Every file is opened and inspected on the server, so renaming a file or faking its type doesn’t get it through.',
  'Uploads go straight from your browser to S3. The API only issues a five-minute upload link.',
  'Only approved files get a preview link, and only the account that uploaded a file can ask for it.',
];

const DEMO_HINT =
  'Testing the demo? Sign up with any working email and you’ll get a verification code. Disposable inboxes like temp-mail.org work.';

function getErrorMessage(err) {
  if (!err) return 'Something went wrong.';
  const name = err.name || err.code;
  switch (name) {
    case 'NotAuthorizedException':
    case 'UserNotFoundException':
      return 'Incorrect email or password.';
    case 'UserNotConfirmedException':
      return 'Account not confirmed yet — check your email for the verification code.';
    case 'UsernameExistsException':
      return 'An account with that email already exists.';
    case 'InvalidPasswordException':
      return 'Password does not meet the requirements (min 8 chars, upper, lower, number).';
    case 'CodeMismatchException':
      return 'That verification code is incorrect.';
    case 'ExpiredCodeException':
      return 'That code has expired. Please request a new one.';
    case 'InvalidParameterException':
      return err.message || 'Invalid input.';
    default:
      return err.message || 'Something went wrong.';
  }
}

export default function AuthPage() {
  const { signIn, signUp, confirmSignUp } = useAuth();

  const [view, setView] = useState(VIEW_LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetFields = () => {
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      if (err && (err.name === 'UserNotConfirmedException' || err.code === 'UserNotConfirmedException')) {
        setView(VIEW_CONFIRM);
        setError(null);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      setView(VIEW_CONFIRM);
      resetFields();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await confirmSignUp(email.trim(), code.trim());
      setView(VIEW_LOGIN);
      resetFields();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const switchView = (next) => {
    setView(next);
    resetFields();
  };

  const emailField = (
    <TextField
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      fullWidth
      autoComplete="email"
      placeholder="you@example.com"
    />
  );

  const navAction =
    view === VIEW_LOGIN ? (
      <Button variant="contained" size="small" onClick={() => switchView(VIEW_REGISTER)}>
        Create account
      </Button>
    ) : (
      <Button variant="contained" size="small" onClick={() => switchView(VIEW_LOGIN)}>
        Sign in
      </Button>
    );

  return (
    <PageShell navAction={navAction}>
      <Box
        sx={{
          ...inset,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(360px, 460px)' },
          gridTemplateAreas: { xs: '"intro" "form" "facts"', md: '"intro form" "facts form"' },
          columnGap: { md: 8, lg: 15 },
          rowGap: { xs: 6, md: 6 },
          alignItems: 'start',
          pt: { xs: 6, md: 12 },
        }}
      >
        {/* Intro */}
        <Box sx={{ gridArea: 'intro', maxWidth: 620 }}>
          <Eyebrow tone="orange" sx={{ mb: 3 }}>
            Serverless · AWS
          </Eyebrow>
          <Typography variant="h1">Uploads that check themselves.</Typography>
          <Typography variant="lede" sx={{ mt: 3, maxWidth: 560 }}>
            Sign in, drop a photo or video, and watch it get opened and inspected on the server
            before anyone can see it.
          </Typography>
          <Typography variant="meta" component="p" sx={{ mt: 4 }}>
            CloudFront · API Gateway · Lambda · S3 · DynamoDB
          </Typography>
        </Box>

        {/* Facts */}
        <Box component="ul" sx={{ gridArea: 'facts', listStyle: 'none', m: 0, p: 0, maxWidth: 620 }}>
          {FACTS.map((fact, index) => (
            <Box
              component="li"
              key={fact}
              sx={{
                display: 'grid',
                gridTemplateColumns: '40px minmax(0, 1fr)',
                py: 2.5,
                borderTop: index === 0 ? 0 : `1px dotted ${t.rule}`,
              }}
            >
              <Box component="span" sx={{ fontFamily: MONO, fontSize: 11, lineHeight: '24px', color: t.orange, letterSpacing: '0.06em' }}>
                {String(index + 1).padStart(2, '0')}
              </Box>
              <Typography variant="body1" sx={{ color: t.ink70 }}>
                {fact}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Form panel */}
        <BracketFrame filled sx={{ gridArea: 'form', p: { xs: 3, sm: 5 } }}>
          {view !== VIEW_CONFIRM && (
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={view}
              onChange={(_, next) => next && switchView(next)}
              aria-label="Account"
              sx={{ mb: 4 }}
            >
              <ToggleButton value={VIEW_LOGIN}>Sign in</ToggleButton>
              <ToggleButton value={VIEW_REGISTER}>Create account</ToggleButton>
            </ToggleButtonGroup>
          )}

          <Eyebrow tone="ink" chip={false}>
            {EYEBROWS[view]}
          </Eyebrow>
          <Typography variant="h3" component="h2" sx={{ mt: 1.5, mb: 3 }}>
            {HEADINGS[view]}
          </Typography>

          {view !== VIEW_CONFIRM && (
            <Box sx={{ mb: 3, pl: 1.5, borderLeft: `1px dashed ${t.rule}` }}>
              <Typography variant="body2" sx={{ color: t.ink60, fontSize: 13, lineHeight: '19px' }}>
                {DEMO_HINT}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {view === VIEW_LOGIN && (
            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={3}>
                {emailField}
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 1 }}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </Box>
          )}

          {view === VIEW_REGISTER && (
            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={3}>
                {emailField}
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                  helperText="Min 8 characters with upper, lower, and number."
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                />
                <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 1 }}>
                  {submitting ? 'Creating account…' : 'Create account'}
                </Button>
              </Stack>
            </Box>
          )}

          {view === VIEW_CONFIRM && (
            <Box component="form" onSubmit={handleConfirm}>
              <Stack spacing={3}>
                <Typography variant="body2" sx={{ color: t.ink60 }}>
                  Check your email for a verification code, then enter it below.
                </Typography>
                {emailField}
                <TextField
                  label="Verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  fullWidth
                  slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'one-time-code' } }}
                />
                <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 1 }}>
                  {submitting ? 'Confirming…' : 'Confirm'}
                </Button>
                <Typography variant="body2">
                  <Link component="button" type="button" onClick={() => switchView(VIEW_LOGIN)}>
                    Back to sign in
                  </Link>
                </Typography>
              </Stack>
            </Box>
          )}
        </BracketFrame>
      </Box>
    </PageShell>
  );
}
