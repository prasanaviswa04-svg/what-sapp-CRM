import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Skeleton } from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';

// Role-Specific Portals
import { SuperAdminPortal } from './portals/SuperAdminPortal';
import { CompanyAdminPortal } from './portals/CompanyAdminPortal';
import { ManagerPortal } from './portals/ManagerPortal';
import { BrokerPortal } from './portals/BrokerPortal';
import { SalesAgentPortal } from './portals/SalesAgentPortal';
import { SupportAgentPortal } from './portals/SupportAgentPortal';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data?.kpis || res.data?.success) {
        setData(res.data);
      } else {
        const { getOfflineStats } = await import('../../services/offlineStorage');
        setData(getOfflineStats());
      }
    } catch (err) {
      console.warn('Dashboard network notice, falling back to offline stats:', err.message);
      try {
        const { getOfflineStats } = await import('../../services/offlineStorage');
        setData(getOfflineStats());
      } catch (e) {
        setData({ kpis: {}, charts: {} });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const role = user?.role || 'Company Admin';

  return (
    <div className="space-y-4">
      {/* Role-Specific Portal dynamically rendered for the authenticated user */}
      {role === 'Super Admin' && (
        <SuperAdminPortal data={data} onRefresh={fetchDashboardData} />
      )}
      {role === 'Real Estate Manager' && (
        <ManagerPortal data={data} onRefresh={fetchDashboardData} />
      )}
      {role === 'Property Broker' && (
        <BrokerPortal data={data} onRefresh={fetchDashboardData} />
      )}
      {role === 'Sales Agent' && (
        <SalesAgentPortal data={data} onRefresh={fetchDashboardData} />
      )}
      {role === 'Customer Support Agent' && (
        <SupportAgentPortal data={data} onRefresh={fetchDashboardData} />
      )}
      {role === 'Company Admin' && (
        <CompanyAdminPortal data={data} onRefresh={fetchDashboardData} />
      )}
    </div>
  );
};
