import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import Appointments from "./pages/Appointments";
import Telemedicine from "./pages/Telemedicine";
import Records from "./pages/Records";
import Medicines from "./pages/Medicines";
import Labs from "./pages/Labs";
import Emergency from "./pages/Emergency";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import Careers from "./pages/Careers";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import PharmacyDashboard from "./pages/dashboard/PharmacyDashboard";
import LabDashboard from "./pages/dashboard/LabDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DASHBOARD_ROUTES = [
  '/dashboard/patient',
  '/dashboard/doctor',
  '/dashboard/admin',
  '/dashboard/pharmacy',
  '/dashboard/superadmin',
  '/dashboard/lab',
];

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const isDashboard = DASHBOARD_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      <ScrollToTop />
      {/* Navbar always visible on non-dashboard pages */}
      {!isDashboard && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/telemedicine" element={<Telemedicine />} />
          <Route path="/records" element={<Records />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<Help />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/dashboard/lab" element={<LabDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <AuthProvider>
        <AppDataProvider>
          <CartProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </CartProvider>
        </AppDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
