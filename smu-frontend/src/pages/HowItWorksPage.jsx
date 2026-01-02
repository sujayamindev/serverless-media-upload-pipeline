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
                How This Works 🚀
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                This section explains what happens behind the scenes when you upload
                a file and how different AWS services work together.
            </Typography>

            <Stack spacing={4}>
                {/* Step 1 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        1️⃣ Requesting a Secure Upload URL
                    </Typography>
                    <Typography variant="body2" paragraph>
                        When you click <strong>Upload</strong>, the frontend does NOT
                        upload the file directly to the backend. Instead, it requests a
                        temporary, secure upload URL.
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
                        <br />• AWS Lambda (generateUploadUrl)
                        <br />• Amazon S3 (pre-signed URL)
                    </Typography>
                </Box>

                {/* Step 2 */}
                <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        2️⃣ Direct Upload to Amazon S3
                    </Typography>
                    <Typography variant="body2" paragraph>
                        The browser uploads the file directly to Amazon S3 using the
                        pre-signed URL. This avoids routing large files through the
                        backend and scales efficiently.
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
                        3️⃣ Automatic Server-Side Validation
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Once the file reaches S3, an event automatically triggers a
                        Lambda function that validates the file type, size, and content
                        type. The file is then moved to either <code>approved</code> or
                        <code> rejected</code>.
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
                        4️⃣ Checking Status & Previewing Media
                    </Typography>
                    <Typography variant="body2" paragraph>
                        When you click <strong>Check Status</strong>, the frontend asks
                        the backend for the current validation result. If approved, a
                        temporary preview URL is generated.
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
            </Stack>
        </Container>
    );
}
