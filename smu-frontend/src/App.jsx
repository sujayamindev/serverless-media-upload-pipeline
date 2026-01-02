import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from "./pages/UploadPage";
import HowItWorksPage from "./pages/HowItWorksPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </Router>
  );
}

export default App;
