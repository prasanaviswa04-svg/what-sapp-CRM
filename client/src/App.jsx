import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { LeadPipeline } from './pages/leads/LeadPipeline';
import { PropertyList } from './pages/properties/PropertyList';
import { PropertyDetail } from './pages/properties/PropertyDetail';
import { PropertyMatching } from './pages/matching/PropertyMatching';
import { WhatsAppInbox } from './pages/whatsapp/WhatsAppInbox';
import { AiAssistant } from './pages/ai/AiAssistant';
import { Appointments } from './pages/appointments/Appointments';
import { Bookings } from './pages/bookings/Bookings';
import { Payments } from './pages/payments/Payments';
import { FollowUpAutomations } from './pages/automations/FollowUpAutomations';
import { Campaigns } from './pages/campaigns/Campaigns';
import { Tasks } from './pages/tasks/Tasks';
import { ReportsAnalytics } from './pages/analytics/ReportsAnalytics';
import { TeamManagement } from './pages/team/TeamManagement';
import { Integrations } from './pages/integrations/Integrations';
import { ActivityLogs } from './pages/activity/ActivityLogs';
import { Settings } from './pages/settings/Settings';
import { HelpSupport } from './pages/help/HelpSupport';

// Marketplace Module Pages
import { MarketplaceLanding } from './pages/marketplace/MarketplaceLanding';
import { OwnerRegistration } from './pages/marketplace/OwnerRegistration';
import { BrokerRegistration } from './pages/marketplace/BrokerRegistration';
import { MarketplaceLogin } from './pages/marketplace/MarketplaceLogin';
import { OwnerDashboard } from './pages/marketplace/OwnerDashboard';
import { BrokerDashboard } from './pages/marketplace/BrokerDashboard';
import { PropertySubmissionForm } from './pages/marketplace/PropertySubmissionForm';
import { RequirementSubmissionForm } from './pages/marketplace/RequirementSubmissionForm';
import { SubmissionTracker } from './pages/marketplace/SubmissionTracker';
import { MarketplaceManager } from './pages/marketplace/MarketplaceManager';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs">
        Loading EstateFlow CRM...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public & External Marketplace Portal Routes */}
              <Route path="/marketplace" element={<MarketplaceLanding />} />
              <Route path="/marketplace/register/owner" element={<OwnerRegistration />} />
              <Route path="/marketplace/register/broker" element={<BrokerRegistration />} />
              <Route path="/marketplace/login" element={<MarketplaceLogin />} />
              <Route path="/marketplace/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/marketplace/broker/dashboard" element={<BrokerDashboard />} />
              <Route path="/marketplace/submit-property" element={<PropertySubmissionForm />} />
              <Route path="/marketplace/submit-requirement" element={<RequirementSubmissionForm />} />
              <Route path="/marketplace/track" element={<SubmissionTracker />} />
              <Route path="/marketplace/track/:submissionId" element={<SubmissionTracker />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="marketplace-manager" element={<MarketplaceManager />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="leads" element={<LeadPipeline />} />
                <Route path="properties" element={<PropertyList />} />
                <Route path="properties/:id" element={<PropertyDetail />} />
                <Route path="matching" element={<PropertyMatching />} />
                <Route path="whatsapp" element={<WhatsAppInbox />} />
                <Route path="ai-assistant" element={<AiAssistant />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="payments" element={<Payments />} />
                <Route path="automations" element={<FollowUpAutomations />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="analytics" element={<ReportsAnalytics />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<HelpSupport />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
