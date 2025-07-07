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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Paginator } from 'primereact/paginator';
import { expenseService } from '../utils/expenseService';
import type { Expense, CreateExpenseRequest, ExpenseFilters } from '../utils/expenseService';
import { categoryService } from '../utils/categoryService';
import type { Category } from '../utils/categoryService';
import { notificationService } from '../utils/notificationService';
import SkeletonLoader from '../components/SkeletonLoader';
import NoDataFound from '../components/NoDataFound';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../utils/useAuth';

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

  // Add validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.category) errors.category = 'Category is required.';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Amount must be greater than 0.';
    if (!formData.description || formData.description.trim() === '') errors.description = 'Description is required.';
    if (!formData.date) errors.date = 'Date is required.';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  // Add status filter for admin
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadExpenses();
    // eslint-disable-next-line
  }, [isAdmin ? statusFilter : null]);

  /**
   * Load expenses from API
   */
  const loadExpenses = async () => {
    try {
      setLoading(true);
      let response;
      if (isAdmin) {
        const adminFilters: any = { ...filters };
        if (statusFilter !== 'all') adminFilters['approvalStatus'] = statusFilter;
        response = await expenseService.getAllExpensesAdmin(adminFilters);
      } else {
        response = await expenseService.getExpenses(filters);
      }
      setExpenses(response.expenses);
      setPagination(response.pagination);
    } catch (error) {
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
    setTimeout(() => {
      if (isAdmin) {
        const adminFilters: any = { ...newFilters };
        if (statusFilter !== 'all') adminFilters['approvalStatus'] = statusFilter;
        expenseService.getAllExpensesAdmin(adminFilters).then(response => {
          setExpenses(response.expenses);
          setPagination(response.pagination);
        }).catch(error => {
          console.error('Load expenses error:', error);
        });
      } else {
        expenseService.getExpenses(newFilters).then(response => {
          setExpenses(response.expenses);
          setPagination(response.pagination);
        }).catch(error => {
          console.error('Load expenses error:', error);
        });
      }
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
    setTimeout(() => {
      if (isAdmin) {
        const adminFilters: any = { ...newFilters };
        if (statusFilter !== 'all') adminFilters['approvalStatus'] = statusFilter;
        expenseService.getAllExpensesAdmin(adminFilters).then(response => {
          setExpenses(response.expenses);
          setPagination(response.pagination);
        }).catch(error => {
          console.error('Load expenses error:', error);
        });
      } else {
        expenseService.getExpenses(newFilters).then(response => {
          setExpenses(response.expenses);
          setPagination(response.pagination);
        }).catch(error => {
          console.error('Load expenses error:', error);
        });
      }
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
    setTimeout(() => {
      if (isAdmin) {
        const adminFilters: any = { ...newFilters };
        if (statusFilter !== 'all') adminFilters['approvalStatus'] = statusFilter;
        expenseService.getAllExpensesAdmin(adminFilters).then(response => {
          setExpenses(response.expenses);
          setPagination(response.pagination);
        }).catch(error => {
          console.error('Load expenses error:', error);
        });
      } else {
        expenseService.getExpenses(newFilters).then(response => {
          setExpenses(response.expenses);
          setPagination(response.pagination);
        }).catch(error => {
          console.error('Load expenses error:', error);
        });
      }
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
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, formData);
      } else {
        const newExpense = await expenseService.createExpense(formData);
        
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
          loadExpenses();
        } catch (error) {
          console.error('Delete error:', error);
        }
      }
    });
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

  return (
    <div className="app-page-root">
      <PageHeader title="Expenses" subtitle="Manage and track your expenses">
        {/* Only show Add Expense button if there is data or loading and not admin */}
        {(!isAdmin && (loading || expenses.length > 0)) && (
          <Button label="Add Expense" icon="pi pi-plus" onClick={openCreateDialog} className="p-button-primary" />
        )}
      </PageHeader>
      <div className="flex flex-column gap-4 w-full">
        {/* <Toast ref={(el) => setToast(el)} /> */}
        <ConfirmDialog />
        
        {/* Filters */}
        <Card>
          {/* Updated: Filters and Reset in a single row */}
          <div className="flex flex-column md:flex-row align-items-end gap-3 w-full">
            <div className="flex-1">
              <InputText
                placeholder="Search expenses..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Dropdown
                placeholder="Select category"
                value={filters.category || ''}
                options={categories.map(cat => ({ label: cat.name, value: cat._id }))}
                onChange={(e) => handleFilterChange('category', e.value)}
                showClear
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Dropdown
                placeholder="Select payment method"
                value={filters.paymentMethod || ''}
                options={paymentMethods}
                onChange={(e) => handleFilterChange('paymentMethod', e.value)}
                showClear
                className="w-full"
              />
            </div>
            {isAdmin && (
              <div className="flex-1">
                <Dropdown
                  value={statusFilter}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Requested', value: 'requested' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Denied', value: 'denied' }
                  ]}
                  onChange={e => setStatusFilter(e.value)}
                  placeholder="Filter by status"
                  className="w-full"
                />
              </div>
            )}
            <div className="flex-none">
              <Button
                label="Reset"
                icon="pi pi-refresh"
                onClick={resetFilters}
                className="p-button-outlined"
                style={{ minWidth: 120 }}
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
                {isAdmin && <Column field="user.name" header="User" body={expense => (
                  <span>{expense.user?.name || ''}<br /><small>{expense.user?.email || ''}</small></span>
                )} />}
                <Column field="date" header="Date" body={expense => new Date(expense.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} sortable />
                <Column field="description" header="Description" sortable />
                <Column field="category" header="Category" body={expense => (
                  <span className="flex align-items-center gap-2">
                    {expense.category?.icon && <i className={expense.category.icon} style={{ color: expense.category.color }} />}
                    <Tag value={expense.category?.name} style={{ backgroundColor: expense.category?.color, color: '#fff', border: 'none' }} />
                  </span>
                )} />
                <Column field="amount" header="Amount" body={expense => expense.amount ? expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : ''} sortable />
                <Column field="paymentMethod" header="Payment Method" body={expense => expense.paymentMethod ? expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1).replace('_', ' ') : ''} />
                <Column field="approval.status" header="Approval Status" body={expense => {
                  let severity: "success" | "info" | "danger" = "info", label = "Requested";
                  if (expense.approval.status === "approved") { severity = "success"; label = "Approved"; }
                  else if (expense.approval.status === "denied") { severity = "danger"; label = "Denied"; }
                  return <Tag value={label} severity={severity} />;
                }} style={{ minWidth: 140 }} />
                {!isAdmin && <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />}
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
              {...((filters.search || filters.category || filters.paymentMethod)
                ? {
                    message: "No data found matching your filter.",
                    onAction: undefined
                  }
                : {
                    message: "You haven't added any expenses yet. Start tracking your spending by adding your first expense.",
                    onAction: openCreateDialog
                  })}
            />
          )}
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          visible={showDialog}
          onHide={() => setShowDialog(false)}
          header={editingExpense ? 'Edit Expense' : 'Add New Expense'}
          modal
          style={{ maxWidth: '500px', width: '100%' }}
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
          <div className="flex flex-column gap-3">
            <div className="w-11 sm:w-10 md:w-8 lg:w-7 xl:w-6" style={{ width: '75%' }}>
              <label className="block mb-2">Category</label>
              <Dropdown
                placeholder="Select category"
                value={formData.category}
                options={categories.map(cat => ({ label: cat.name, value: cat._id }))}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.value }))}
                showClear
                className="w-full"
              />
              {formErrors.category && <small className="p-error block mt-1">{formErrors.category}</small>}
            </div>
            <div className="w-11 sm:w-10 md:w-8 lg:w-7 xl:w-6" style={{ width: '75%' }}>
              <label className="block mb-2">Amount</label>
              <InputNumber
                value={formData.amount}
                onValueChange={(e) => setFormData(prev => ({ ...prev, amount: e.value || 0 }))}
                mode="currency"
                currency="USD"
                className="w-full"
              />
              {formErrors.amount && <small className="p-error block mt-1">{formErrors.amount}</small>}
            </div>
            <div className="w-11 sm:w-10 md:w-8 lg:w-7 xl:w-6" style={{ width: '75%' }}>
              <label className="block mb-2">Description</label>
              <InputText
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter expense description"
                className="w-full"
              />
              {formErrors.description && <small className="p-error block mt-1">{formErrors.description}</small>}
            </div>
            <div className="w-11 sm:w-10 md:w-8 lg:w-7 xl:w-6" style={{ width: '75%' }}>
              <label className="block mb-2">Date</label>
              <Calendar
                value={formData.date ? new Date(formData.date) : null}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  date: e.value ? new Date(e.value).toISOString().split('T')[0] : ''
                }))}
                dateFormat="yy-mm-dd"
                className="w-full"
              />
              {formErrors.date && <small className="p-error block mt-1">{formErrors.date}</small>}
            </div>
            <div className="w-11 sm:w-10 md:w-8 lg:w-7 xl:w-6" style={{ width: '75%' }}>
              <label className="block mb-2">Payment Method</label>
              <Dropdown
                placeholder="Select payment method"
                value={formData.paymentMethod}
                options={paymentMethods}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.value }))}
                showClear
                className="w-full"
              />
              {formErrors.paymentMethod && <small className="p-error block mt-1">{formErrors.paymentMethod}</small>}
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Expenses; 