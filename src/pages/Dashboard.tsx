import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useAuth } from '../utils/useAuth';
import { expenseService } from '../utils/expenseService';
import { categoryService } from '../utils/categoryService';

const API_BASE_URL = 'http://localhost:5000';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
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
      setUserAnalytics(analytics);
      const recent = await expenseService.getExpenses({ limit: 5, sortBy: 'date', sortOrder: 'desc' });
      setRecentExpenses(recent.expenses);
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
  const renderUserDashboard = () => (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <Card title="Total Spent (This Month)" style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            ${userAnalytics?.summary?.totalSpending?.toFixed(2) || 0}
          </div>
        </Card>
        <Card title="Categories" style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{categories.length}</div>
        </Card>
        <Card title="Recent Expenses" style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{recentExpenses.length}</div>
        </Card>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <Card title="Spending by Category" style={{ flex: 2 }}>
          <Chart type="doughnut" data={getCategoryChartData(userAnalytics)} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </Card>
        <Card title="Spending Trend" style={{ flex: 3 }}>
          <Chart type="line" data={getTrendChartData(userAnalytics)} options={{ plugins: { legend: { display: false } } }} />
        </Card>
      </div>
      <Card title="Recent Expenses">
        <DataTable value={recentExpenses} loading={loading} responsiveLayout="scroll">
          <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString()} />
          <Column field="description" header="Description" />
          <Column field="amount" header="Amount" body={row => `$${row.amount.toFixed(2)}`} />
          <Column field="category.name" header="Category" />
          <Column field="approval.status" header="Status" body={row => <Tag value={row.approval?.status || 'N/A'} severity={getStatusSeverity(row.approval?.status)} />} />
        </DataTable>
      </Card>
    </div>
  );

  // --- Admin Dashboard Layout ---
  const renderAdminDashboard = () => (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <Card title="Total Spent (All Users)" style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            ${adminAnalytics?.totalSpent?.toFixed(2) || 0}
          </div>
        </Card>
        <Card title="Total Users" style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{adminAnalytics?.userCount || 0}</div>
        </Card>
        <Card title="Pending Approvals" style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{pendingApprovals.length}</div>
        </Card>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <Card title="Top Categories" style={{ flex: 2 }}>
          <Chart type="doughnut" data={getAdminCategoryChartData(adminAnalytics)} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </Card>
        <Card title="Spending Trend (All Users)" style={{ flex: 3 }}>
          <Chart type="line" data={getAdminTrendChartData(adminAnalytics)} options={{ plugins: { legend: { display: false } } }} />
        </Card>
      </div>
      <Card title="Recent Expenses (All Users)">
        <DataTable value={adminRecentExpenses} loading={loading} responsiveLayout="scroll">
          <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString()} />
          <Column field="description" header="Description" />
          <Column field="amount" header="Amount" body={row => `$${row.amount.toFixed(2)}`} />
          <Column field="category.name" header="Category" />
          <Column field="user.name" header="User" />
          <Column field="approval.status" header="Status" body={row => <Tag value={row.approval?.status || 'N/A'} severity={getStatusSeverity(row.approval?.status)} />} />
        </DataTable>
      </Card>
      <Card title="Pending Approvals">
        <DataTable value={pendingApprovals} loading={loading} responsiveLayout="scroll">
          <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString()} />
          <Column field="description" header="Description" />
          <Column field="amount" header="Amount" body={row => `$${row.amount.toFixed(2)}`} />
          <Column field="category.name" header="Category" />
          <Column field="user.name" header="User" />
          <Column field="approval.status" header="Status" body={row => <Tag value={row.approval?.status || 'N/A'} severity={getStatusSeverity(row.approval?.status)} />} />
        </DataTable>
      </Card>
    </div>
  );

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: 32 }}>Dashboard</h2>
      {isAdmin ? renderAdminDashboard() : renderUserDashboard()}
    </div>
  );
};

export default Dashboard; 