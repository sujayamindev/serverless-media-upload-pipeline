import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Link,
  Box,
} from '@mui/material';
import DeblurOutlinedIcon from '@mui/icons-material/DeblurOutlined';
import { useAuth } from '../auth/useAuth';

const VIEW_LOGIN = 'login';
const VIEW_REGISTER = 'register';
const VIEW_CONFIRM = 'confirm';

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header at top in normal flow */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ alignItems: 'center', display: 'flex' }}>
          <DeblurOutlinedIcon sx={{ fontSize: { xs: 36, sm: 54 }, color: 'primary.main' }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
            Serverless Media Upload Pipeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload media securely with server-side validation on AWS
          </Typography>
        </Box>
      </Box>

      {/* Card centered in remaining vertical space */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: { xs: 3, md: 4 } }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              {view === VIEW_LOGIN && 'Sign in'}
              {view === VIEW_REGISTER && 'Create an account'}
              {view === VIEW_CONFIRM && 'Confirm your email'}
            </Typography>

            {view === VIEW_LOGIN && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1, alignItems: 'center' }}>
                Testing the demo? Sign up with any working email — you'll get a verification code. Disposable inboxes like temp-mail.org work perfectly.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {view === VIEW_LOGIN && (
              <Box component="form" onSubmit={handleLogin}>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoComplete="email"
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    autoComplete="current-password"
                  />
                  <Button type="submit" variant="contained" size="large" disableElevation disabled={submitting}>
                    {submitting ? 'Signing in…' : 'Sign in'}
                  </Button>
                  <Typography variant="body2" align="center">
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
                  <Alert severity="info" sx={{ borderRadius: 1, alignItems: 'center' }}>
                    Testing the demo? Sign up with any working email — you'll get a verification code. Disposable inboxes like temp-mail.org work perfectly.
                  </Alert>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoComplete="email"
                  />
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
                  <Button type="submit" variant="contained" size="large" disableElevation disabled={submitting}>
                    {submitting ? 'Creating account…' : 'Create account'}
                  </Button>
                  <Typography variant="body2" align="center">
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
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoComplete="email"
                  />
                  <TextField
                    label="Verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                  />
                  <Button type="submit" variant="contained" size="large" disableElevation disabled={submitting}>
                    {submitting ? 'Confirming…' : 'Confirm'}
                  </Button>
                  <Typography variant="body2" align="center">
                    <Link component="button" type="button" onClick={() => switchView(VIEW_LOGIN)}>
                      Back to sign in
                    </Link>
                  </Typography>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      </Box>
    </Box>
  );
}
