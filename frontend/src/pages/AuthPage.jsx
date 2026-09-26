import { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Link,
  Box,
} from '@mui/material';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../auth/useAuth';

const VIEW_LOGIN = 'login';
const VIEW_REGISTER = 'register';
const VIEW_CONFIRM = 'confirm';

const HEADINGS = {
  [VIEW_LOGIN]: 'Sign in',
  [VIEW_REGISTER]: 'Create an account',
  [VIEW_CONFIRM]: 'Confirm your email',
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
    />
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
        bgcolor: 'background.default',
      }}
    >
      {/* Brand panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 3, md: 8 },
          p: { xs: 3, md: 7 },
          bgcolor: 'background.paper',
          borderRight: { md: 1 },
          borderBottom: { xs: 1, md: 0 },
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'primary.main' }}>
          <BrandMark size={32} />
          <Typography variant="h5" component="span" sx={{ color: 'text.primary' }}>
            Media Upload Pipeline
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 480 }}>
          <Typography variant="h1" sx={{ mb: { xs: 0, md: 4 } }}>
            Upload it. We check what&rsquo;s inside.
          </Typography>
          <Stack component="ul" spacing={2} sx={{ display: { xs: 'none', md: 'flex' }, listStyle: 'none', m: 0, p: 0 }}>
            {FACTS.map((fact) => (
              <Typography key={fact} component="li" variant="body1" color="text.secondary">
                {fact}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Serverless on AWS: CloudFront, API Gateway, Lambda, S3 and DynamoDB.
        </Typography>
      </Box>

      {/* Form */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 7 } }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h2" sx={{ mb: 3 }}>
            {HEADINGS[view]}
          </Typography>

          {view !== VIEW_CONFIRM && (
            <Alert severity="info" sx={{ mb: 2.5 }}>
              {DEMO_HINT}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          {view === VIEW_LOGIN && (
            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2}>
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
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  No account?{' '}
                  <Link component="button" type="button" onClick={() => switchView(VIEW_REGISTER)}>
                    Create one
                  </Link>
                </Typography>
              </Stack>
            </Box>
          )}

          {view === VIEW_REGISTER && (
            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={2}>
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
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Create account'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component="button" type="button" onClick={() => switchView(VIEW_LOGIN)}>
                    Sign in
                  </Link>
                </Typography>
              </Stack>
            </Box>
          )}

          {view === VIEW_CONFIRM && (
            <Box component="form" onSubmit={handleConfirm}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
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
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
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
        </Box>
      </Box>
    </Box>
  );
}
