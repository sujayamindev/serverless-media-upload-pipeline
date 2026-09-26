import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import PageShell from '../components/PageShell';
import Eyebrow from '../components/Eyebrow';
import BracketFrame from '../components/BracketFrame';
import PipelineDiagram from '../components/PipelineDiagram';
import PlusMinus from '../components/PlusMinus';
import { dottedRule, inset } from '../lib/layout';
import { metaType, t } from '../lib/tokens';

const SECTIONS = [
  {
    id: 'hosting',
    kicker: 'Delivery',
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
    step: '01',
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
    step: '02',
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
    step: '03',
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
    ],
  },
  {
    id: 'status',
    step: '04',
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
];

// Security notes and failure handling, as accordion rows.
const DETAILS = [
  {
    q: 'Why is the browser treated as untrusted?',
    a: [
      <>
        The system follows a <strong>zero-trust client model</strong>. The frontend is treated as
        untrusted, and all critical validation and enforcement happens on the server or at the AWS
        service level.
      </>,
    ],
  },
  {
    q: 'How are API calls authorised?',
    a: [
      <>
        All API Gateway endpoints are protected by a Cognito JWT authorizer. Requests must include
        an <code>Authorization: Bearer &lt;access_token&gt;</code> header issued by the Cognito
        User Pool. Unauthenticated or expired tokens are rejected before they reach any Lambda
        function. Per-record ownership is then enforced inside the Lambda by comparing the JWT{' '}
        <code>sub</code> claim against the stored <code>user_sub</code>.
      </>,
    ],
  },
  {
    q: 'What does S3 enforce on its own?',
    a: [
      <>
        File size, content type, upload location, and expiration are enforced by Amazon S3 through
        the pre-signed POST policy. Even if a user tampers with browser requests, S3 rejects
        uploads that violate these constraints.
      </>,
    ],
  },
  {
    q: 'How is the blast radius kept small?',
    a: [
      <>
        Temporary credentials, short-lived URLs, IAM least-privilege roles, and automatic cleanup
        rules together reduce the blast radius of misuse or abuse.
      </>,
      <>
        No AWS credentials are ever exposed to the client, and all access is scoped, temporary, and
        auditable.
      </>,
    ],
  },
  {
    q: 'What happens if validation keeps failing?',
    a: [
      <>
        If the Lambda fails repeatedly, for example because of a cold-start error or a
        misconfigured layer, the invocation is retried twice before giving up. A dead-letter queue
        (Amazon SQS) then captures the original S3 event payload, so a failed validation leaves a
        recoverable record that can be inspected and replayed once the underlying issue is fixed.
      </>,
    ],
  },
  {
    q: 'Which security headers does CloudFront add?',
    a: [
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
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 6fr)' },
        columnGap: 8,
        rowGap: 3,
        py: { xs: 6, md: 8 },
        borderTop: `1px dotted ${t.rule}`,
      }}
    >
      <Box sx={{ alignSelf: 'start', position: { md: 'sticky' }, top: { md: 110 } }}>
        <Eyebrow tone={section.step ? 'orange' : 'olive'} chip={false} sx={{ mb: 2 }}>
          {section.step ? `${section.step} · Step` : section.kicker}
        </Eyebrow>
        <Typography id={`${section.id}-title`} variant="h2">
          {section.title}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 620, pt: { md: 4 } }}>
        <Stack spacing={2}>
          {section.body.map((paragraph, index) => (
            <Typography key={index} variant="body1" sx={{ color: t.ink70 }}>
              {paragraph}
            </Typography>
          ))}
        </Stack>

        {section.services && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="meta" component="h3" sx={{ m: 0, mb: 1.5 }}>
              AWS services involved
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {section.services.map((service) => (
                <Eyebrow key={service} component="li" tone="ink">
                  {service}
                </Eyebrow>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

const band = { py: { xs: 8, md: 15 } };

export default function HowItWorksPage() {
  return (
    <PageShell>
      {/* Hero + diagram */}
      <Box component="section" aria-labelledby="how-title" sx={{ ...inset, pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Box sx={{ maxWidth: 760 }}>
          <Eyebrow tone="orange" sx={{ mb: 3 }}>
            How it works
          </Eyebrow>
          <Typography id="how-title" variant="h1">
            How an upload moves through the pipeline.
          </Typography>
          <Typography variant="lede" sx={{ mt: 3, maxWidth: 640 }}>
            What happens behind the scenes when you upload a file, and how the AWS services work
            together.
          </Typography>
        </Box>

        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <PipelineDiagram />
          <Typography variant="meta" component="p" sx={{ mt: 2 }}>
            Fig. 1 — Architecture · Numbers match the steps below
          </Typography>
        </Box>
      </Box>

      <Box component="hr" sx={dottedRule} />

      {/* Key idea */}
      <Box
        component="section"
        aria-label="Key ideas"
        sx={{
          ...inset,
          ...band,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: { xs: 3, md: 4 },
        }}
      >
        <BracketFrame>
          <Eyebrow tone="ink" chip={false}>
            The client
          </Eyebrow>
          <Typography variant="h3" component="h2" sx={{ mt: 2 }}>
            The browser asks. The cloud decides.
          </Typography>
          <Typography variant="body1" sx={{ color: t.ink70, mt: 3 }}>
            Every rule that matters, from who may upload to how big a file can be and what it
            really contains, is enforced by API Gateway, S3 or a Lambda function. Nothing in the
            browser is trusted.
          </Typography>
        </BracketFrame>
        <BracketFrame inverse>
          <Eyebrow tone="inverse" chip={false}>
            The key idea
          </Eyebrow>
          <Typography variant="h3" component="h2" sx={{ mt: 2, color: 'inherit' }}>
            The backend never touches your file bytes.
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, color: 'color-mix(in srgb, var(--inverse-fg) 70%, transparent)' }}>
            The API only signs a five-minute upload policy. Your browser sends the file straight to
            S3, and the validator reads it there. No server in the request path ever buffers an
            upload.
          </Typography>
        </BracketFrame>
      </Box>

      {/* Steps */}
      <Box sx={{ ...inset }}>
        {SECTIONS.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </Box>

      {/* Technical details */}
      <Box
        component="section"
        aria-labelledby="details-title"
        sx={{
          ...inset,
          pt: { xs: 8, md: 15 },
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 6fr)' },
          columnGap: 8,
          rowGap: 4,
        }}
      >
        <Box>
          <Eyebrow tone="olive" chip={false} sx={{ mb: 2 }}>
            Technical details
          </Eyebrow>
          <Typography id="details-title" variant="h2">
            Security notes
          </Typography>
          <Typography variant="body1" sx={{ color: t.ink70, mt: 3, maxWidth: 420 }}>
            How the pieces are locked down, and what happens when something fails.
          </Typography>
        </Box>
        <Box>
          {DETAILS.map((item) => (
            <Accordion key={item.q}>
              <AccordionSummary expandIcon={<PlusMinus />}>{item.q}</AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {item.a.map((paragraph, index) => (
                    <Typography key={index} variant="body1" sx={{ color: t.ink70 }}>
                      {paragraph}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
          <Typography variant="meta" component="p" sx={{ ...metaType, color: t.ink42, mt: 3 }}>
            Zero-trust client · Least-privilege IAM · Short-lived URLs
          </Typography>
        </Box>
      </Box>
    </PageShell>
  );
}
