import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { useAuth } from '../utils/useAuth';
import { expenseService } from '../utils/expenseService';
import { categoryService } from '../utils/categoryService';
import SkeletonLoader from '../components/SkeletonLoader';
import NoDataFound from '../components/NoDataFound';
import PageHeader from '../components/PageHeader';

const API_BASE_URL = 'http://localhost:5000';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  // User dashboard state
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  // Admin dashboard state
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [adminRecentExpenses, setAdminRecentExpenses] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin === undefined) return;
    if (isAdmin) {
      loadAdminDashboard();
    } else {
      loadUserDashboard();
    }
    // eslint-disable-next-line
  }, [isAdmin]);

  // User dashboard data
  const loadUserDashboard = async () => {
    setLoading(true);
    try {
      const analytics = await expenseService.getExpenseAnalytics();
      const recent = await expenseService.getExpenses({ limit: 5, sortBy: 'date', sortOrder: 'desc' });
      // Only include approved expenses
      const approvedExpenses = recent.expenses.filter((e: any) => e.approval?.status === 'approved');
      setUserAnalytics({
        ...analytics,
        // Optionally filter analytics.byCategory, monthlyTrend, etc. if needed
      });
      setRecentExpenses(approvedExpenses);
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  // Admin dashboard data
  const loadAdminDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsRes, recentRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/analytics`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/admin/recent-expenses?limit=5`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/admin/pending-approvals`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }).then(r => r.json()),
      ]);
      setAdminAnalytics(analyticsRes);
      setAdminRecentExpenses(recentRes);
      setPendingApprovals(pendingRes);
    } finally {
      setLoading(false);
    }
  };

  // --- User Dashboard Layout ---
  const renderUserDashboard = () => {
    if (loading) {
      return (
        <div className="flex flex-column gap-4">
          <div className="flex gap-4 mb-4">
            <Card className="flex-1"><SkeletonLoader type="custom" height="4rem" /></Card>
            <Card className="flex-1"><SkeletonLoader type="custom" height="4rem" /></Card>
            <Card className="flex-1"><SkeletonLoader type="custom" height="4rem" /></Card>
          </div>
          <div className="flex gap-4 mb-4">
            <Card className="flex-2"><SkeletonLoader type="chart" /></Card>
            <Card className="flex-3"><SkeletonLoader type="chart" /></Card>
          </div>
          <Card title="Recent Expenses"><SkeletonLoader type="table" count={5} /></Card>
        </div>
      );
    }
    return (
      <div className="flex flex-column gap-4">
        <div className="flex gap-4 mb-4">
          <Card title="Total Spent (This Month)" className="flex-1">
            <div className="text-2xl font-bold">${userAnalytics?.summary?.totalSpending?.toFixed(2) || 0}</div>
          </Card>
          <Card title="Categories" className="flex-1">
            <div className="text-2xl font-bold">{categories.length}</div>
          </Card>
          <Card title="Recent Expenses" className="flex-1">
            <div className="text-2xl font-bold">{recentExpenses.length}</div>
          </Card>
        </div>
        <div className="flex gap-4 mb-4">
          <Card title="Spending by Category" className="flex-2">
            {userAnalytics?.byCategory?.length > 0 ? (
              <Chart type="doughnut" data={getCategoryChartData(userAnalytics)} options={{ plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <NoDataFound type="categories" />
            )}
          </Card>
          <Card title="Spending Trend" className="flex-3 w-full">
            {userAnalytics?.monthlyTrend?.length > 0 ? (
              <Chart type="line" data={getTrendChartData(userAnalytics)} options={{ plugins: { legend: { display: false } } }} />
            ) : (
              <NoDataFound type="custom" title="No Spending Data" message="No spending data available for trend analysis." />
            )}
          </Card>
        </div>
        <Card title="Recent Expenses">
          {recentExpenses.length > 0 ? (
            <DataTable value={recentExpenses} responsiveLayout="scroll">
              <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} />
              <Column field="description" header="Description" />
              <Column field="amount" header="Amount" body={row => row.amount ? row.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : ''} />
              <Column field="category.name" header="Category" body={row => (
                <span className="flex align-items-center gap-2">
                  {row.category?.icon && <i className={row.category.icon} style={{ color: row.category.color }} />}
                  <Tag value={row.category?.name} style={{ backgroundColor: row.category?.color, color: '#fff', border: 'none' }} />
                </span>
              )} />
              <Column field="approval.status" header="Status" body={row => <Tag value={row.approval?.status || 'N/A'} severity={getStatusSeverity(row.approval?.status)} />} />
            </DataTable>
          ) : (
            <NoDataFound type="expenses" />
          )}
        </Card>
      </div>
    );
  };
  // --- Admin Dashboard Layout ---
  const renderAdminDashboard = () => {
    if (loading) {
      return (
        <div className="flex flex-column gap-4">
          <div className="flex gap-4 mb-4">
            <Card className="flex-1"><SkeletonLoader type="custom" height="4rem" /></Card>
            <Card className="flex-1"><SkeletonLoader type="custom" height="4rem" /></Card>
            <Card className="flex-1"><SkeletonLoader type="custom" height="4rem" /></Card>
          </div>
          <div className="flex gap-4 mb-4">
            <Card className="flex-2"><SkeletonLoader type="chart" /></Card>
            <Card className="flex-3"><SkeletonLoader type="chart" /></Card>
          </div>
          <Card title="Recent Expenses (All Users)"><SkeletonLoader type="table" count={5} /></Card>
          <Card title="Pending Approvals"><SkeletonLoader type="table" count={3} /></Card>
        </div>
      );
    }
    return (
      <div className="flex flex-column gap-4">
        <div className="flex gap-4 mb-4">
          <Card title="Total Spent (All Users)" className="flex-1">
            <div className="text-2xl font-bold">${adminAnalytics?.totalSpent?.toFixed(2) || 0}</div>
          </Card>
          <Card title="Total Users" className="flex-1">
            <div className="text-2xl font-bold">{adminAnalytics?.userCount || 0}</div>
          </Card>
          <Card title="Pending Approvals" className="flex-1">
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
          </Card>
        </div>
        <div className="flex gap-4 mb-4">
          <Card title="Top Categories" className="flex-2">
            {adminAnalytics?.topCategories?.length > 0 ? (
              <Chart type="doughnut" data={getAdminCategoryChartData(adminAnalytics)} options={{ plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <NoDataFound type="categories" />
            )}
          </Card>
          <Card title="Spending Trend (All Users)" className="flex-3 w-full">
            {adminAnalytics?.monthlyTrend?.length > 0 ? (
              <Chart type="line" data={getAdminTrendChartData(adminAnalytics)} options={{ plugins: { legend: { display: false } } }} />
            ) : (
              <NoDataFound type="custom" title="No Spending Data" message="No spending data available for trend analysis." />
            )}
          </Card>
        </div>
        <Card title="Recent Expenses (All Users)">
          {adminRecentExpenses.length > 0 ? (
            <DataTable value={adminRecentExpenses} responsiveLayout="scroll">
              <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString()} />
              <Column field="description" header="Description" />
              <Column field="amount" header="Amount" body={row => `$${row.amount.toFixed(2)}`} />
              <Column field="category.name" header="Category" />
              <Column field="user.name" header="User" />
              <Column field="approval.status" header="Status" body={row => <Tag value={row.approval?.status || 'N/A'} severity={getStatusSeverity(row.approval?.status)} />} />
            </DataTable>
          ) : (
            <NoDataFound type="expenses" />
          )}
        </Card>
        <Card title="Pending Approvals">
          {pendingApprovals.length > 0 ? (
            <DataTable value={pendingApprovals} responsiveLayout="scroll">
              <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString()} />
              <Column field="description" header="Description" />
              <Column field="amount" header="Amount" body={row => `$${row.amount.toFixed(2)}`} />
              <Column field="category.name" header="Category" />
              <Column field="user.name" header="User" />
              <Column field="approval.status" header="Status" body={row => <Tag value={row.approval?.status || 'N/A'} severity={getStatusSeverity(row.approval?.status)} />} />
            </DataTable>
          ) : (
            <NoDataFound type="custom" title="No Pending Approvals" message="All expenses have been processed. No pending approvals at the moment." />
          )}
        </Card>
      </div>
    );
  };

  // --- Chart Data Helpers ---
  function getCategoryChartData(analytics: any) {
    if (!analytics?.byCategory) return { labels: [], datasets: [] };
    return {
      labels: analytics.byCategory.map((c: any) => c.categoryName),
      datasets: [{
        data: analytics.byCategory.map((c: any) => c.total),
        backgroundColor: analytics.byCategory.map((c: any) => c.categoryColor || '#2196f3'),
      }]
    };
  }
  function getTrendChartData(analytics: any) {
    if (!analytics?.monthlyTrend) return { labels: [], datasets: [] };
    return {
      labels: analytics.monthlyTrend.map((m: any) => m.period || `${m._id?.month || ''}/${m._id?.year || ''}`),
      datasets: [{
        label: 'Spent',
        data: analytics.monthlyTrend.map((m: any) => m.total),
        fill: false,
        borderColor: '#2196f3',
        tension: 0.4
      }]
    };
  }
  function getAdminCategoryChartData(analytics: any) {
    if (!analytics?.topCategories) return { labels: [], datasets: [] };
    return {
      labels: analytics.topCategories.map((c: any) => c.category),
      datasets: [{
        data: analytics.topCategories.map((c: any) => c.total),
        backgroundColor: ['#2196f3', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      }]
    };
  }
  function getAdminTrendChartData(analytics: any) {
    if (!analytics?.monthlyTrend) return { labels: [], datasets: [] };
    return {
      labels: analytics.monthlyTrend.map((m: any) => `${m._id?.month || ''}/${m._id?.year || ''}`),
      datasets: [{
        label: 'Spent',
        data: analytics.monthlyTrend.map((m: any) => m.total),
        fill: false,
        borderColor: '#2196f3',
        tension: 0.4
      }]
    };
  }
  function getStatusSeverity(status: string) {
    if (status === 'approved') return 'success';
    if (status === 'denied') return 'danger';
    if (status === 'requested') return 'info';
    return undefined;
  }

  return (
    <div className="app-page-root">
      <PageHeader title="Dashboard" />
      {isAdmin ? renderAdminDashboard() : renderUserDashboard()}
    </div>
  );
};

export default Dashboard; 