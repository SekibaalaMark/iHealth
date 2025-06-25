import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import SignupForm from "./auth/components/signup-form";
import LoginForm from "./auth/components/login-form.jsx";
import VerifyEmail from "./auth/components/VerifyEmail"; // New import for verification dashboard
import HospitalDashboard from "./auth/components/HospitalDashboard";
import CdoHealth from "./auth/components/CdoHealth";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/account/signup" element={<SignupForm />} />
      <Route path="/account/verify-email" element={<VerifyEmail />} />
      <Route path="/account/login" element={<LoginForm />} />
      <Route path="/account/HospitalDashboard" element={<HospitalDashboard />} />
      <Route path="/account/CdoHealth" element={<CdoHealth />} />
    </Routes>
  );
}

export default App;