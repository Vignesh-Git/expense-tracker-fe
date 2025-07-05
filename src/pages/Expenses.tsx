import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import { expenseService } from '../utils/expenseService';
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters } from '../utils/expenseService';
import { categoryService } from '../utils/categoryService';
import type { Category } from '../utils/categoryService';
import { notificationService } from '../utils/notificationService';
import SkeletonLoader from '../components/SkeletonLoader';
import NoDataFound from '../components/NoDataFound';

// Payment method options
const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
  { label: 'Other', value: 'other' }
];

const Expenses: React.FC = () => {
  // State management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Filter state
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Remove location and tags from form state
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    isRecurring: false
  });

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, []);

  /**
   * Load expenses from API
   */
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getExpenses(filters);
      setExpenses(response.expenses);
      setPagination(response.pagination);
    } catch (error) {
      showToast('error', 'Error', 'Failed to load expenses');
      console.error('Load expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load categories from API
   */
  const loadCategories = async () => {
    try {
      const categories = await categoryService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Load categories error:', error);
      // Fallback to default categories if API fails
      setCategories([
        { _id: '1', name: 'Food & Dining', color: '#FF6B6B', icon: 'pi pi-utensils',  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: '2', name: 'Transportation', color: '#4ECDC4', icon: 'pi pi-car',  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: '3', name: 'Shopping', color: '#45B7D1', icon: 'pi pi-shopping-bag',  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: '4', name: 'Entertainment', color: '#96CEB4', icon: 'pi pi-gamepad',  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: '5', name: 'Bills & Utilities', color: '#FFEAA7', icon: 'pi pi-bolt',  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]);
    }
  };

  /**
   * Handle pagination change
   */
  const onPageChange = (event: { page: number; first: number; rows: number }) => {
    const newFilters = {
      ...filters,
      page: event.page + 1,
      limit: event.rows
    };
    setFilters(newFilters);
    // Update the filters and reload
    setTimeout(() => {
      expenseService.getExpenses(newFilters).then(response => {
        setExpenses(response.expenses);
        setPagination(response.pagination);
      }).catch(error => {
        showToast('error', 'Error', 'Failed to load expenses');
        console.error('Load expenses error:', error);
      });
    }, 100);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    };
    setFilters(newFilters);
    
    // Update the filters and reload
    setTimeout(() => {
      expenseService.getExpenses(newFilters).then(response => {
        setExpenses(response.expenses);
        setPagination(response.pagination);
      }).catch(error => {
        showToast('error', 'Error', 'Failed to load expenses');
        console.error('Load expenses error:', error);
      });
    }, 300);
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    const newFilters: ExpenseFilters = {
      page: 1,
      limit: 10,
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(newFilters);
    
    // Update the filters and reload
    setTimeout(() => {
      expenseService.getExpenses(newFilters).then(response => {
        setExpenses(response.expenses);
        setPagination(response.pagination);
      }).catch(error => {
        showToast('error', 'Error', 'Failed to load expenses');
        console.error('Load expenses error:', error);
      });
    }, 100);
  };

  /**
   * Open dialog for creating new expense
   */
  const openCreateDialog = () => {
    setEditingExpense(null);
    setFormData({
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      isRecurring: false
    });
    setShowDialog(true);
  };

  /**
   * Open dialog for editing expense
   */
  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category._id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      isRecurring: expense.isRecurring
    });
    setShowDialog(true);
  };

  /**
   * Handle form submission (create or update expense)
   */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, formData);
        showToast('success', 'Success', 'Expense updated successfully');
      } else {
        const newExpense = await expenseService.createExpense(formData);
        showToast('success', 'Success', 'Expense created successfully');
        
        // Create notification for admin about new expense
        try {
          await notificationService.createNotification({
            type: 'expense',
            relatedExpense: newExpense.expense._id,
            message: `New expense added: ${formData.description} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formData.amount)}`
          });
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
          // Don't show error to user as expense was created successfully
        }
      }
      
      setShowDialog(false);
      loadExpenses();
    } catch (error) {
      showToast('error', 'Error', editingExpense ? 'Failed to update expense' : 'Failed to create expense');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle expense deletion
   */
  const handleDelete = (expense: Expense) => {
    confirmDialog({
      message: `Are you sure you want to delete the expense "${expense.description}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await expenseService.deleteExpense(expense._id);
          showToast('success', 'Success', 'Expense deleted successfully');
          loadExpenses();
        } catch (error) {
          showToast('error', 'Error', 'Failed to delete expense');
          console.error('Delete error:', error);
        }
      }
    });
  };

  /**
   * Show toast notification
   */
  const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
    toast?.show({ severity, summary, detail, life: 3000 });
  };

  /**
   * Format amount for display
   */
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  /**
   * Render payment method tag
   */
  const paymentMethodTemplate = (expense: Expense) => {
    const severity = expense.paymentMethod === 'cash' ? 'info' : 
                    expense.paymentMethod === 'card' ? 'success' : 'warning';
    return <Tag value={expense.paymentMethod.toUpperCase()} severity={severity} />;
  };

  /**
   * Render category tag
   */
  const categoryTemplate = (expense: Expense) => {
    return (
      <Tag 
        value={expense.category.name} 
        style={{ backgroundColor: expense.category.color, color: 'white' }}
      />
    );
  };

  /**
   * Render action buttons
   */
  const actionTemplate = (expense: Expense) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-sm p-button-outlined" 
          onClick={() => openEditDialog(expense)}
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-sm p-button-outlined p-button-danger" 
          onClick={() => handleDelete(expense)}
        />
      </div>
    );
  };

  // Helper to render approval status
  const approvalStatusTemplate = (expense: Expense) => {
    let severity: 'success' | 'info' | 'danger' = 'info';
    let label = 'Requested';
    if (expense.approval.status === 'approved') {
      severity = 'success';
      label = 'Approved';
    } else if (expense.approval.status === 'denied') {
      severity = 'danger';
      label = 'Denied';
    }
    return <Tag value={label} severity={severity} />;
  };

  return (
    <div className="flex flex-column gap-4 w-full">
      {/* <Toast ref={(el) => setToast(el)} /> */}
      <ConfirmDialog />
      
      {/* Header */}
      <Card>
        <div className="flex justify-content-between align-items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Expenses</h1>
            <p className="text-gray-600">Manage and track your expenses</p>
          </div>
          <Button label="Add Expense" icon="pi pi-plus" onClick={openCreateDialog} className="p-button-primary" />
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="grid align-items-end gap-3">
          <div className="col-12 md:col-3">
            <InputText
              placeholder="Search expenses..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="col-12 md:col-3">
            <Dropdown
              placeholder="Select category"
              value={filters.category || ''}
              options={categories.map(cat => ({ label: cat.name, value: cat._id }))}
              onChange={(e) => handleFilterChange('category', e.value)}
              showClear
            />
          </div>
          <div className="col-12 md:col-3">
            <Dropdown
              placeholder="Select payment method"
              value={filters.paymentMethod || ''}
              options={paymentMethods}
              onChange={(e) => handleFilterChange('paymentMethod', e.value)}
              showClear
            />
          </div>
          <div className="col-12 md:col-3">
            <Button
              label="Reset"
              icon="pi pi-refresh"
              onClick={resetFilters}
              className="p-button-outlined w-full"
            />
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card>
        {loading ? (
          <SkeletonLoader type="table" count={8} />
        ) : expenses.length > 0 ? (
          <>
            <DataTable
              value={expenses}
              paginator={false}
              className="mb-4"
              stripedRows
              showGridlines
            >
              <Column field="date" header="Date" body={(expense) => formatDate(expense.date)} sortable />
              <Column field="description" header="Description" sortable />
              <Column field="category" header="Category" body={categoryTemplate} />
              <Column field="amount" header="Amount" body={(expense) => formatAmount(expense.amount)} sortable />
              <Column field="paymentMethod" header="Payment Method" body={paymentMethodTemplate} />
              <Column field="approval.status" header="Approval Status" body={approvalStatusTemplate} style={{ minWidth: 140 }} />
              <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />
            </DataTable>
            <Paginator
              first={(pagination.currentPage - 1) * pagination.itemsPerPage}
              rows={pagination.itemsPerPage}
              totalRecords={pagination.totalItems}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </>
        ) : (
          <NoDataFound
            type="expenses"
            onAction={openCreateDialog}
            message={filters.search || filters.category || filters.paymentMethod
              ? "No expenses match your current filters. Try adjusting your search criteria."
              : "You haven't added any expenses yet. Start tracking your spending by adding your first expense."
            }
          />
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        modal
        className="w-full max-w-2xl"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowDialog(false)}
              className="p-button-text"
            />
            <Button
              label={editingExpense ? 'Update' : 'Create'}
              icon="pi pi-check"
              onClick={handleSubmit}
              loading={submitting}
              className="p-button-primary"
            />
          </div>
        }
      >
        <div className="grid gap-3">
          <div className="col-12 md:col-6">
            <Dropdown
              placeholder="Select category"
              value={formData.category}
              options={categories.map(cat => ({ label: cat.name, value: cat._id }))}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.value }))}
              showClear
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <InputNumber
              value={formData.amount}
              onValueChange={(e) => setFormData(prev => ({ ...prev, amount: e.value || 0 }))}
              mode="currency"
              currency="USD"
              className="w-full"
            />
          </div>
          <div className="col-12">
            <InputText
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter expense description"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <Calendar
              value={formData.date ? new Date(formData.date) : null}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                date: e.value ? new Date(e.value).toISOString().split('T')[0] : ''
              }))}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <Dropdown
              placeholder="Select payment method"
              value={formData.paymentMethod}
              options={paymentMethods}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.value }))}
              showClear
              className="w-full"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Expenses; 