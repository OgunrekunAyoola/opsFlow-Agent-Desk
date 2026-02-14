import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Tickets } from './pages/Tickets';
import { TicketDetail } from './pages/TicketDetail';
import { Dashboard } from './pages/Dashboard';
import { Team } from './pages/Team';
import { Clients } from './pages/Clients';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<AppShell />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="team" element={<Team />} />
          <Route path="clients" element={<Clients />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
