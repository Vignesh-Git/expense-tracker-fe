import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import PageHeader from '../components/PageHeader';
import { expenseService } from '../utils/expenseService';
import { Tag } from 'primereact/tag';

const AdminExpenseRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Fetch pending approvals from backend
      const data = await expenseService.getPendingApprovals();
      setRequests(data);
    } catch (error) {
      setRequests([]);
    }
    setLoading(false);
  };

  const handleAction = (expenseId: string, action: 'approve' | 'deny') => {
    confirmDialog({
      message: `Are you sure you want to ${action} this expense?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Confirmation`,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Call backend to approve/deny
          await expenseService.updateApprovalStatus(expenseId, action === 'approve' ? 'approved' : 'denied');
          loadRequests();
          toast?.show({ severity: 'success', summary: 'Success', detail: `Expense ${action}d.` });
        } catch (error: any) {
          toast?.show({ severity: 'error', summary: 'Error', detail: error.message || `Failed to ${action} expense.` });
        }
      }
    });
  };

  return (
    <div className="app-page-root">
      <PageHeader title="Expense Requests" subtitle="Approve or deny pending expense requests" />
      <Card>
        <Toast ref={setToast} />
        <ConfirmDialog />
        <DataTable value={requests} loading={loading} responsiveLayout="scroll">
          <Column field="user.name" header="User" />
          <Column field="amount" header="Amount" body={row => row.amount ? row.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : ''} />
          <Column field="category.name" header="Category" body={row => (
            <span className="flex align-items-center gap-2">
              {row.category?.icon && <i className={row.category.icon} style={{ color: row.category.color }} />}
              <Tag value={row.category?.name} style={{ backgroundColor: row.category?.color, color: '#fff', border: 'none' }} />
            </span>
          )} />
          <Column field="date" header="Date" body={row => new Date(row.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} />
          <Column field="description" header="Description" />
          <Column field="status" header="Status" body={row => {
            let severity: "success" | "info" | "danger" = "info", label = "Requested";
            if (row.approval?.status === "approved") { severity = "success"; label = "Approved"; }
            else if (row.approval?.status === "denied") { severity = "danger"; label = "Denied"; }
            return <Tag value={label} severity={severity} />;
          }} />
          <Column
            header="Actions"
            body={rowData => (
              <div className="flex gap-2">
                <Button label="Approve" icon="pi pi-check" className="p-button-success p-button-sm"
                  onClick={() => handleAction(rowData._id, 'approve')} />
                <Button label="Deny" icon="pi pi-times" className="p-button-danger p-button-sm"
                  onClick={() => handleAction(rowData._id, 'deny')} />
              </div>
            )}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default AdminExpenseRequests; 