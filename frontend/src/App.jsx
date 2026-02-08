import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import UploadPage from "./pages/UploadPage";
import HowItWorksPage from "./pages/HowItWorksPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/how-this-works" element={<HowItWorksPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
