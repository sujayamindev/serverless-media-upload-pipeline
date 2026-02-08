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
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ mb: 3 }}
            >
                Back to Upload
            </Button>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
                How This Works
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                This section explains what happens behind the scenes when you upload
                a file and how different AWS services work together.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'left', my: 4, border: "1px solid #e0e0e0", borderRadius: 2, }}>
                <img 
                    src={diagram} 
                    alt="System Architecture Diagram" 
                    style={{ maxWidth: '70%', height: 'auto', marginLeft: '36px', marginRight: '16px' }}
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
                        CloudFront provides HTTPS, caching, and low-latency access, while an
                        Origin Access Control (OAC) ensures that users cannot bypass CloudFront
                        to access the S3 bucket directly.
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
                        This policy strictly defines allowed file size, content type,
                        upload location, and expiration time. These rules are enforced
                        by Amazon S3 itself.
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
                                    <img src="https://a.b.cdn.console.awsstatic.com/a/v1/DKY2SIL5N3MJQCULDNOQE7TKLNQIUXRSOHBJKJGQAHLZO7TLH3TQ/icon/c0828e0381730befd1f7a025057c74fb-43acc0496e64afba82dbc9ab774dc622.svg" alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>}
                                label="S3"
                                variant="outlined"
                                size="medium"
                            />
                        </Stack>
                        <br />• Amazon API Gateway
                        <br />• AWS Lambda (generateUploadPolicy)
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
                        Images are validated using Pillow, videos using OpenCV.
                        Files up to 50&nbsp;MB are supported in the current configuration. Each file is then moved
                        to either <code><i>approved</i></code> or <code><i>rejected</i></code>.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        This prevents attackers from bypassing client-side checks by renaming files or forging MIME types.
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
                        </Stack>
                        <br />• Amazon S3 (event trigger)
                        <br />• AWS Lambda (media validation)
                        <br />• Amazon DynamoDB (status storage)
                    </Typography>
                </Box>

                {/* Step 4 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Checking Status & Previewing Media
                    </Typography>
                    <Typography variant="body2" paragraph>
                        When you click <strong>Check Status</strong>, the frontend asks
                        the backend for the current validation result. If approved, a
                        temporary pre-signed preview URL is generated.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        DynamoDB acts as the system of record for media validation status.
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
                    </Box>
            </Stack>
        </Container>
    );
}
