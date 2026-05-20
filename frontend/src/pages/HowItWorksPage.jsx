import {
    Container,
    Typography,
    Stack,
    Box,
    Divider,
    Button,
    Chip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import diagram from '../assets/diagram.svg';

export default function HowItWorksPage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="xl" sx={{ mt: 4, minHeight: '100vh', pb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                >
                    Back to Upload
                </Button>
                <a
                    href="https://github.com/sujayamindev/secure-cloud-native-media-upload-pipeline"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        opacity: 0.6,
                        transition: 'opacity 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"
                        alt="GitHub Repository"
                        style={{ width: 24, height: 24 }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>View on GitHub</span>
                </a>
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                How This Works
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                This section explains what happens behind the scenes when you upload
                a file and how different AWS services work together.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, border: "1px solid #e0e0e0", borderRadius: 2, overflowX: 'auto', p: { xs: 1, sm: 2 } }}>
                <img
                    src={diagram}
                    alt="System Architecture Diagram"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                />
            </Box>

            <Stack spacing={4}>
                {/* Frontend Hosting */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Frontend Hosting & Delivery
                    </Typography>

                    <Typography variant="body2" paragraph>
                        The frontend is a static React application hosted securely on Amazon S3
                        and delivered globally via Amazon CloudFront. The S3 bucket is private and only accessible via CloudFront using Origin Access Control (OAC).
                    </Typography>

                    <Typography variant="body2" paragraph>
                        CloudFront provides HTTPS, caching, and low-latency global access.
                    </Typography>

                    <Typography variant="body2">
                        <strong>AWS Services involved:</strong>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: -1 }}>
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src="https://a.b.cdn.console.awsstatic.com/a/v1/DKY2SIL5N3MJQCULDNOQE7TKLNQIUXRSOHBJKJGQAHLZO7TLH3TQ/icon/c0828e0381730befd1f7a025057c74fb-43acc0496e64afba82dbc9ab774dc622.svg"
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>}
                                label="S3"
                                variant="outlined"
                                size="medium"
                            />

                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src="https://a.b.cdn.console.awsstatic.com/a/v1/O5KUMVBWS74QN7SCF6UJX2EBWYVGGRWTRCB3H6YPT5QYNZU7RUYQ/icon/4200ac8906c9a841a229ed9e5008a533-465d196059bdeeb0ffcb07ebe5f79b28.svg"
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>}
                                label="CloudFront"
                                variant="outlined"
                                size="medium"
                            />
                        </Stack>

                        <br />• Amazon S3 (private static hosting)
                        <br />• Amazon CloudFront (CDN + HTTPS)
                        <br />• Origin Access Control (OAC)
                    </Typography>
                </Box>

                {/* Step 1 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Requesting a Secure Upload Policy
                    </Typography>
                    <Typography variant="body2" paragraph>
                        When you click <strong>Upload</strong>, the frontend does NOT
                        upload the file to the backend. Instead, it requests a
                        <strong> short-lived, pre-signed POST upload policy</strong>.
                        <i> Why POST? Because it allows strict server-enforced conditions such as content-length-range.</i>
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Before the presigned policy is issued, API Gateway validates a JWT access token included in the request. This token is issued by Amazon Cognito when you sign in — unauthenticated requests are rejected at the gateway before reaching any Lambda function.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        This policy strictly defines allowed file size, content type,
                        upload location, and expiration time. These rules are enforced
                        by Amazon S3 itself.
                    </Typography>
                    <Typography variant="body2">
                        <strong>AWS Services involved:</strong>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: -1 }}>
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://miro.medium.com/v2/1*3Qv7hpvX8cyjzHjumzetLw.png" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="Cognito"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/YQSXE26XPXPOFR4RNTHADZ6A5EBPBODPAKV6IERNZE66HMBAER2A/icon/fb0cde6228b21d89ec222b45efec54e7-0856e92285f4e7ed254b2588d1fe1829.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="API Gateway"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/ASJXZFLVLBGU5KRUAC63L3KCZ62OQVM4G3PQXYVSD4FAUUJ6QI7Q/icons/lambda.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="Lambda"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/DKY2SIL5N3MJQCULDNOQE7TKLNQIUXRSOHBJKJGQAHLZO7TLH3TQ/icon/c0828e0381730befd1f7a025057c74fb-43acc0496e64afba82dbc9ab774dc622.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="S3"
                                variant="outlined"
                                size="medium"
                            />
                        </Stack>
                        <br />• Amazon Cognito
                        <br />• Amazon API Gateway
                        <br />• AWS Lambda (generateUploadUrl)
                        <br />• Amazon S3 (pre-signed POST)
                    </Typography>
                </Box>

                {/* Step 2 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Direct Upload to Amazon S3
                    </Typography>
                    <Typography variant="body2" paragraph>
                        The browser uploads the file directly to Amazon S3 using the
                        pre-signed POST. The backend is not involved in the file transfer.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        On success, Amazon S3 responds with HTTP 204 (No Content),
                        which confirms the upload without returning a response body.
                    </Typography>
                    <Typography variant="body2">
                        <strong>AWS Services involved:</strong>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: -1 }}>
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/DKY2SIL5N3MJQCULDNOQE7TKLNQIUXRSOHBJKJGQAHLZO7TLH3TQ/icon/c0828e0381730befd1f7a025057c74fb-43acc0496e64afba82dbc9ab774dc622.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="S3"
                                variant="outlined"
                                size="medium"
                            />
                        </Stack>
                        <br />• Amazon S3
                    </Typography>
                </Box>

                {/* Step 3 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Automatic Server-Side Validation
                    </Typography>
                    <Typography variant="body2" paragraph>
                        When a file appears in S3, an event triggers a Lambda function
                        that performs server-side validation. The actual file content
                        is inspected rather than trusting client-provided metadata.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Validation uses three libraries in sequence: <code>filetype</code> inspects
                        binary magic numbers to detect the true file type regardless of extension,
                        Pillow verifies image integrity, and OpenCV reads at least one frame from
                        video files. Files up to 50&nbsp;MB are supported. Each file is then moved
                        to either <code>approved</code> or <code>rejected</code>.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        This prevents attackers from bypassing client-side checks by renaming files
                        or forging MIME types — the actual binary content is inspected, not the
                        filename or Content-Type header.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        If the Lambda fails repeatedly — for example, due to a cold-start error or
                        misconfigured layer — S3 retries the invocation twice before giving up. Instead
                        of silently dropping the event, a dead-letter queue (Amazon SQS) captures the
                        original S3 event payload. Failed validations leave a recoverable record that
                        can be inspected and replayed once the underlying issue is resolved.
                    </Typography>
                    <Typography variant="body2">
                        <strong>AWS Services involved:</strong>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: -1 }}>
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/DKY2SIL5N3MJQCULDNOQE7TKLNQIUXRSOHBJKJGQAHLZO7TLH3TQ/icon/c0828e0381730befd1f7a025057c74fb-43acc0496e64afba82dbc9ab774dc622.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="S3"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/ASJXZFLVLBGU5KRUAC63L3KCZ62OQVM4G3PQXYVSD4FAUUJ6QI7Q/icons/lambda.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="Lambda"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/AN2R6BU3DBLYCROPWJWYQWM62AYYLMXTM5V7AHNGQIU34L2VIEEA/icon/6f419a45e63123b4c16bd679549610f6-87862c68693445999110bbd6a467ce88.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="DynamoDB"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://www.apono.io/wp-content/uploads/2023/05/amazon-sqs-min.png" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="Amazon SQS"
                                variant="outlined"
                                size="medium"
                            />
                        </Stack>
                        <br />• Amazon S3 (event trigger)
                        <br />• AWS Lambda (media validation)
                        <br />• Amazon DynamoDB (status storage)
                        <br />• Amazon SQS (dead-letter queue)
                    </Typography>
                </Box>

                {/* Step 4 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Checking Status & Previewing Media
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Once the file is uploaded to S3, the frontend automatically polls
                        the backend every 3 seconds to check the validation result. No
                        manual action is required.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        During polling, 404 responses are handled gracefully — they simply
                        mean the <code>imageValidator</code> Lambda hasn't finished writing
                        to DynamoDB yet. Polling continues silently until an
                        <code> approved</code> or <code>rejected</code> status is returned,
                        or until the 90-second timeout is reached.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        If approved, the <code>getMediaStatus</code> Lambda generates a
                        temporary pre-signed GET URL from S3, allowing the browser to
                        preview the file directly without exposing the bucket publicly.
                        DynamoDB acts as the system of record for all validation results.
                    </Typography>
                    <Typography variant="body2">
                        <strong>AWS Services involved:</strong>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: -1 }}>
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/YQSXE26XPXPOFR4RNTHADZ6A5EBPBODPAKV6IERNZE66HMBAER2A/icon/fb0cde6228b21d89ec222b45efec54e7-0856e92285f4e7ed254b2588d1fe1829.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="API Gateway"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/ASJXZFLVLBGU5KRUAC63L3KCZ62OQVM4G3PQXYVSD4FAUUJ6QI7Q/icons/lambda.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="Lambda"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/AN2R6BU3DBLYCROPWJWYQWM62AYYLMXTM5V7AHNGQIU34L2VIEEA/icon/6f419a45e63123b4c16bd679549610f6-87862c68693445999110bbd6a467ce88.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="DynamoDB"
                                variant="outlined"
                                size="medium"
                            />
                            <Chip
                                icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/DKY2SIL5N3MJQCULDNOQE7TKLNQIUXRSOHBJKJGQAHLZO7TLH3TQ/icon/c0828e0381730befd1f7a025057c74fb-43acc0496e64afba82dbc9ab774dc622.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="S3"
                                variant="outlined"
                                size="medium"
                            />
                        </Stack>
                        <br />• Amazon API Gateway
                        <br />• AWS Lambda (getMediaStatus)
                        <br />• Amazon DynamoDB
                        <br />• Amazon S3 (pre-signed GET URL)
                    </Typography>
                </Box>

                {/* Security Notes */}
                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Security Notes
                        </Typography>

                        <Typography variant="body2" paragraph>
                            This system is designed with a <strong>zero-trust client model</strong>.
                            The frontend is treated as untrusted, and all critical validation and
                            enforcement happens on the server or at the AWS service level.
                        </Typography>

                        <Typography variant="body2" paragraph>
                            All API Gateway endpoints are protected by a Cognito JWT authorizer.
                            Requests must include an <code>Authorization: Bearer &lt;access_token&gt;</code>
                            header issued by the Cognito User Pool. Unauthenticated or expired tokens
                            are rejected before reaching any Lambda function. Per-record ownership is
                            then enforced inside the Lambda by comparing the JWT <code>sub</code> claim
                            against the stored <code>user_sub</code>.
                        </Typography>
                        <Typography variant="body2" paragraph>
                            File size, content type, upload location, and expiration are enforced by
                            Amazon S3 using a pre-signed POST policy. Even if a user tampers with
                            browser requests, S3 will reject uploads that violate these constraints.
                        </Typography>

                        <Typography variant="body2" paragraph>
                            Temporary credentials, short-lived URLs, IAM least-privilege roles,
                            and automatic cleanup rules together reduce the blast radius of misuse
                            or abuse.
                        </Typography>

                        <Typography variant="body2" paragraph>
                            No AWS credentials are ever exposed to the client, and all access is scoped, temporary, and auditable.
                        </Typography>

                        <Typography variant="body2" paragraph>
                            Every response from CloudFront passes through a viewer-response Function that
                            injects HTTP security headers: HSTS (1 year, includeSubDomains),
                            X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy:
                            strict-origin, and a strict Content-Security-Policy. These headers are enforced
                            at the CDN layer regardless of what the origin returns.
                        </Typography>
                    </Box>
            </Stack>

        </Container>
    );
}