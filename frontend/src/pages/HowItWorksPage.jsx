import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import TopBar from '../components/TopBar';
import BracketFrame from '../components/BracketFrame';
import Eyebrow from '../components/Eyebrow';
import diagram from '../assets/diagram.svg';
import { t } from '../lib/tokens';

const SECTIONS = [
  {
    id: 'hosting',
    title: 'Frontend hosting and delivery',
    services: ['Amazon S3 (private static hosting)', 'Amazon CloudFront (CDN + HTTPS)', 'Origin Access Control (OAC)'],
    body: [
      <>
        The frontend is a static React application hosted on Amazon S3 and delivered globally
        through Amazon CloudFront. The S3 bucket is private and only reachable through CloudFront,
        using Origin Access Control (OAC).
      </>,
      <>CloudFront provides HTTPS, caching, and low-latency global access.</>,
    ],
  },
  {
    id: 'permission',
    step: 1,
    title: 'Requesting a secure upload policy',
    services: ['Amazon Cognito', 'Amazon API Gateway', 'AWS Lambda (generateUploadUrl)', 'Amazon S3 (pre-signed POST)'],
    body: [
      <>
        When you click <strong>Upload</strong>, the frontend does not send the file to the backend.
        It asks for a <strong>short-lived, pre-signed POST upload policy</strong> instead.{' '}
        <i>Why POST? It allows strict, server-enforced conditions such as content-length-range.</i>
      </>,
      <>
        Before the policy is issued, API Gateway validates the JWT access token in the request.
        Amazon Cognito issues this token when you sign in. Unauthenticated requests are rejected at
        the gateway, before they reach any Lambda function.
      </>,
      <>
        The policy defines the allowed file size, content type, upload location, and expiration
        time. Amazon S3 itself enforces these rules.
      </>,
    ],
  },
  {
    id: 'upload',
    step: 2,
    title: 'Direct upload to Amazon S3',
    services: ['Amazon S3'],
    body: [
      <>
        The browser uploads the file directly to Amazon S3 using the pre-signed POST. The backend
        takes no part in the file transfer.
      </>,
      <>
        On success, Amazon S3 responds with HTTP 204 (No Content), which confirms the upload
        without returning a response body.
      </>,
    ],
  },
  {
    id: 'validation',
    step: 3,
    title: 'Automatic server-side validation',
    services: [
      'Amazon S3 (event trigger)',
      'AWS Lambda (media validation)',
      'Amazon DynamoDB (status storage)',
      'Amazon SQS (dead-letter queue)',
    ],
    body: [
      <>
        When a file appears in S3, an event triggers a Lambda function that validates it on the
        server. It inspects the actual file content rather than trusting client-provided metadata.
      </>,
      <>
        Validation uses three libraries in sequence: <code>filetype</code> inspects binary magic
        numbers to detect the true file type regardless of extension, Pillow verifies image
        integrity, and OpenCV reads at least one frame from video files. Files up to 50&nbsp;MB are
        supported. Each file is then moved to either <code>approved</code> or <code>rejected</code>.
      </>,
      <>
        This stops attackers from bypassing client-side checks by renaming files or forging MIME
        types: the binary content is inspected, not the filename or Content-Type header.
      </>,
      <>
        If the Lambda fails repeatedly, for example because of a cold-start error or a
        misconfigured layer, the invocation is retried twice before giving up. A dead-letter queue
        (Amazon SQS) then captures the original S3 event payload, so a failed validation leaves a
        recoverable record that can be inspected and replayed once the underlying issue is fixed.
      </>,
    ],
  },
  {
    id: 'status',
    step: 4,
    title: 'Checking status and previewing media',
    services: [
      'Amazon API Gateway',
      'AWS Lambda (getMediaStatus)',
      'Amazon DynamoDB',
      'Amazon S3 (pre-signed GET URL)',
    ],
    body: [
      <>
        Once the file is in S3, the frontend polls the backend every 3 seconds for the validation
        result. No manual action is needed.
      </>,
      <>
        While polling, 404 responses are handled quietly: they only mean the{' '}
        <code>imageValidator</code> Lambda hasn&rsquo;t finished writing to DynamoDB yet. Polling
        continues until an <code>approved</code> or <code>rejected</code> status comes back, or the
        90-second timeout is reached.
      </>,
      <>
        If the file is approved, the <code>getMediaStatus</code> Lambda generates a temporary
        pre-signed GET URL from S3, so the browser can preview the file without the bucket ever
        being public. DynamoDB is the system of record for all validation results.
      </>,
    ],
  },
  {
    id: 'security',
    title: 'Security notes',
    body: [
      <>
        The system follows a <strong>zero-trust client model</strong>. The frontend is treated as
        untrusted, and all critical validation and enforcement happens on the server or at the AWS
        service level.
      </>,
      <>
        All API Gateway endpoints are protected by a Cognito JWT authorizer. Requests must include
        an <code>Authorization: Bearer &lt;access_token&gt;</code> header issued by the Cognito
        User Pool. Unauthenticated or expired tokens are rejected before they reach any Lambda
        function. Per-record ownership is then enforced inside the Lambda by comparing the JWT{' '}
        <code>sub</code> claim against the stored <code>user_sub</code>.
      </>,
      <>
        File size, content type, upload location, and expiration are enforced by Amazon S3 through
        the pre-signed POST policy. Even if a user tampers with browser requests, S3 rejects
        uploads that violate these constraints.
      </>,
      <>
        Temporary credentials, short-lived URLs, IAM least-privilege roles, and automatic cleanup
        rules together reduce the blast radius of misuse or abuse.
      </>,
      <>
        No AWS credentials are ever exposed to the client, and all access is scoped, temporary, and
        auditable.
      </>,
      <>
        Every response from CloudFront passes through a viewer-response function that injects HTTP
        security headers: HSTS (1 year, includeSubDomains), X-Frame-Options: DENY,
        X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin, and a strict
        Content-Security-Policy. These headers are enforced at the CDN layer regardless of what the
        origin returns.
      </>,
    ],
  },
];

function Section({ section }) {
  return (
    <Box
      component="section"
      aria-labelledby={`${section.id}-title`}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '240px minmax(0, 1fr)' },
        columnGap: 6,
        rowGap: 1.5,
        py: { xs: 3, md: 5 },
        borderTop: `1px dashed ${t.rule}`,
      }}
    >
      <Box sx={{ alignSelf: 'start', position: { md: 'sticky' }, top: { md: 24 } }}>
        {section.step && (
          <Eyebrow tone="orange" sx={{ mb: 1.5 }}>
            Step {String(section.step).padStart(2, '0')}
          </Eyebrow>
        )}
        <Typography id={`${section.id}-title`} variant="h3" component="h2">
          {section.title}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 680 }}>
        <Stack spacing={2}>
          {section.body.map((paragraph, index) => (
            <Typography key={index} variant="body1" sx={{ color: t.ink70 }}>
              {paragraph}
            </Typography>
          ))}
        </Stack>

        {section.services && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="meta" component="p" sx={{ mb: 1 }}>
              AWS services involved
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {section.services.map((service) => (
                <Chip key={service} label={service} size="small" />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function HowItWorksPage() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <TopBar />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 640, mb: { xs: 3, md: 5 } }}>
          <Typography variant="h1" sx={{ mb: 1.5 }}>
            How it works
          </Typography>
          <Typography variant="lede">
            What happens behind the scenes when you upload a file, and how the AWS services work
            together.
          </Typography>
        </Box>

        {/* The draw.io export has black strokes, so it keeps a light surface in dark mode too. */}
        <BracketFrame sx={{ bgcolor: t.diagramBg, p: { xs: 1, sm: 2 }, mb: { xs: 3, md: 5 } }}>
          <img
            src={diagram}
            alt="System architecture diagram"
            style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto' }}
          />
        </BracketFrame>

        {SECTIONS.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </Container>
    </Box>
  );
}
