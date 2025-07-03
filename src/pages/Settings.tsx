import React, { useEffect, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ColorPicker } from 'primereact/colorpicker';
import { categoryService } from '../utils/categoryService';
import type { Category } from '../utils/categoryService';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../utils/useAuth';
import { notificationService } from '../utils/notificationService';
import type { Notification } from '../utils/notificationService';

// Curated list of category icons with plain labels (no emoji)
const primeIcons = [
  { label: 'Home & Utilities', value: 'pi pi-home' },
  { label: 'Food & Dining', value: 'pi pi-apple' },
  { label: 'Transportation', value: 'pi pi-car' },
  { label: 'Shopping', value: 'pi pi-shopping-bag' },
  { label: 'Work & Business', value: 'pi pi-briefcase' },
  { label: 'Health & Medical', value: 'pi pi-heart' },
  { label: 'Education', value: 'pi pi-book' },
  { label: 'Entertainment & Leisure', value: 'pi pi-star' },
  { label: 'Travel', value: 'pi pi-globe' },
  { label: 'Debt & Loans', value: 'pi pi-credit-card' },
  { label: 'Investments & Savings', value: 'pi pi-chart-line' },
  { label: 'Family & Kids', value: 'pi pi-users' },
  { label: 'Pets', value: 'pi pi-discord' },
  { label: 'Personal & Others', value: 'pi pi-user-edit' },
];

const Settings: React.FC = () => {
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#2196f3', icon: 'pi pi-tag' });
  const [toast, setToast] = useState<Toast | null>(null);
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [statusAction, setStatusAction] = useState<'approved' | 'denied' | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestFormData, setRequestFormData] = useState({ name: '', color: '#2196f3', icon: 'pi pi-tag' });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load notifications on tab change
  useEffect(() => {
    if (activeTab === 1) loadNotifications();
    // eslint-disable-next-line
  }, [activeTab]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      showToast('error', 'Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      await categoryService.toggleCategoryStatus(category._id, !category.isActive);
      showToast('success', 'Success', `Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      loadCategories();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update category status');
    }
  };

  const loadNotifications = async () => {
    try {
      const data = isAdmin 
        ? await notificationService.getAllNotifications()
        : await notificationService.getNotifications();
      setNotifications(data);
    } catch (e) {
      showToast('error', 'Error', 'Failed to load notifications');
    }
  };

  const handleSelectNotification = (n: Notification) => {
    setSelectedNotification(n);
    setReplyMessage('');
    setStatusRemark('');
    setStatusAction(null);
  };

  const handleReply = async () => {
    if (!selectedNotification || !replyMessage.trim()) return;
    try {
      await notificationService.addReply(selectedNotification._id, replyMessage.trim());
      setReplyMessage('');
      loadNotifications();
      showToast('success', 'Replied', 'Reply sent');
    } catch (e) {
      showToast('error', 'Error', 'Failed to send reply');
    }
  };

  const handleStatus = async (action: 'approved' | 'denied') => {
    if (!selectedNotification || !statusRemark.trim()) return;
    try {
      await notificationService.updateStatus(selectedNotification._id, action, statusRemark.trim());
      setStatusRemark('');
      setStatusAction(null);
      loadNotifications();
      showToast('success', 'Status Updated', `Request ${action}`);
    } catch (e) {
      showToast('error', 'Error', 'Failed to update status');
    }
  };

  const handleCategoryRequest = async () => {
    if (!requestFormData.name.trim()) {
      showToast('error', 'Validation', 'Category name is required');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Creating category request:', requestFormData);
      
      // Create category (will be inactive by default from backend)
      const newCategory = await categoryService.createCategory(requestFormData);
      console.log('Category created:', newCategory);

      // Create notification for admin
      const notificationData = {
        type: 'category' as const,
        relatedCategory: newCategory.category._id,
        message: `Category request: ${requestFormData.name} - Please review and activate this category.`
      };
      console.log('Creating notification:', notificationData);
      
      const notification = await notificationService.createNotification(notificationData);
      console.log('Notification created:', notification);

      setShowRequestDialog(false);
      setRequestFormData({ name: '', color: '#2196f3', icon: 'pi pi-tag' });
      loadCategories();
      showToast('success', 'Request Sent', 'Your category request has been sent to admin');
      
      // Refresh notifications if tab is open
      if (activeTab === 1) loadNotifications();
    } catch (error: any) {
      console.error('Error in handleCategoryRequest:', error);
      showToast('error', 'Error', error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  // Show toast message
  const showToast = (severity: 'success' | 'error' | 'info', summary: string, detail: string) => {
    toast?.show({ severity, summary, detail, life: 3000 });
  };

  // Open dialog for create/edit
  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, color: category.color, icon: category.icon });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', color: '#2196f3', icon: 'pi pi-tag' });
    }
    setShowDialog(true);
  };

  // Handle create or update
  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Validation', 'Category name is required');
      return;
    }
    setLoading(true);
    try {
      if (editingCategory) {
        // Update
        await categoryService.updateCategory(editingCategory._id, formData);
        showToast('success', 'Updated', 'Category updated');
      } else {
        // Create
        await categoryService.createCategory(formData);
        showToast('success', 'Created', 'Category created');
      }
      setShowDialog(false);
      loadCategories();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete with PrimeReact confirmation popup
  const handleDelete = (category: Category) => {
    confirmDialog({
      message: `Are you sure you want to delete category '${category.name}'?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        setLoading(true);
        try {
          await categoryService.deleteCategory(category._id);
          showToast('success', 'Deleted', 'Category deleted');
          loadCategories();
        } catch (error: any) {
          showToast('error', 'Error', error.message || 'Delete failed');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Table action buttons (icons horizontally)
  const actionTemplate = (cat: Category) => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <Button icon="pi pi-pencil" className="p-button-text" onClick={() => openDialog(cat)} tooltip="Edit" />
      <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => handleDelete(cat)} tooltip="Delete" />
      <Button 
        icon={cat.isActive ? "pi pi-eye-slash" : "pi pi-eye"} 
        className={`p-button-text ${cat.isActive ? 'p-button-warning' : 'p-button-success'}`} 
        onClick={() => handleToggleCategoryStatus(cat)} 
        tooltip={cat.isActive ? "Deactivate" : "Activate"} 
      />
    </div>
  );

  // Status template
  const statusTemplate = (cat: Category) => (
    <Tag 
      value={cat.isActive ? 'Active' : 'Inactive'} 
      severity={cat.isActive ? 'success' : 'warning'} 
    />
  );

  // Color and icon display
  const colorTemplate = (cat: Category) => (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ width: 18, height: 18, background: cat.color, borderRadius: '50%', display: 'inline-block', marginRight: 8, border: '1px solid #ccc' }} />
      {cat.color}
    </span>
  );
  const iconTemplate = (cat: Category) => (
    <i className={cat.icon} style={{ fontSize: 18 }}></i>
  );

  return (
    <Card title="Settings" style={{ margin: '2rem auto', maxWidth: 900 }}>
      <Toast ref={setToast} />
      <TabView activeIndex={activeTab} onTabChange={e => setActiveTab(e.index)}>
        <TabPanel header="Category">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>{isAdmin ? 'Manage Categories' : 'Categories'}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isAdmin && (
                <Button 
                  label="Request Category" 
                  icon="pi pi-plus" 
                  className="p-button-outlined"
                  onClick={() => setShowRequestDialog(true)}
                />
              )}
              {isAdmin && (
                <Button label="Add Category" icon="pi pi-plus" onClick={() => openDialog()} />
              )}
            </div>
          </div>
          <DataTable value={categories} loading={loading} responsiveLayout="scroll" paginator rows={8} style={{ minHeight: 300 }}>
            <Column field="name" header="Name" sortable />
            <Column field="color" header="Color" body={colorTemplate} />
            <Column field="icon" header="Icon" body={iconTemplate} />
            <Column field="isActive" header="Status" body={statusTemplate} />
            {isAdmin && <Column header="Actions" body={actionTemplate} style={{ width: 120 }} />}
          </DataTable>
          <ConfirmDialog />
          <Dialog header={editingCategory ? 'Edit Category' : 'Add Category'} visible={showDialog} style={{ width: 400 }} onHide={() => setShowDialog(false)} modal className="p-fluid" draggable={false} resizable={false}>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} autoFocus disabled={!isAdmin} />
            </div>
            <div className="p-field">
              <label htmlFor="color">Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ColorPicker
                  id="color"
                  value={formData.color.replace('#', '')}
                  onChange={e => setFormData(f => ({ ...f, color: `#${e.value}` }))}
                  format="hex"
                  style={{ width: 32, height: 32 }}
                  disabled={!isAdmin}
                />
                <span style={{ width: 28, height: 28, background: formData.color, borderRadius: '50%', border: '1px solid #ccc', display: 'inline-block' }} />
                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{formData.color}</span>
              </div>
            </div>
            <div className="p-field">
              <label htmlFor="icon">Icon</label>
              <Dropdown
                id="icon"
                value={formData.icon}
                options={primeIcons}
                onChange={e => setFormData(f => ({ ...f, icon: e.value }))}
                filter
                showClear
                optionLabel="label"
                itemTemplate={(option) => (
                  option && option.value ? (
                    <span><i className={option.value} style={{ marginRight: 8 }} />{option.label}</span>
                  ) : null
                )}
                valueTemplate={(option, props) =>
                  option && option.value ? (
                    <span><i className={option.value} style={{ marginRight: 8 }} />{option.label}</span>
                  ) : (
                    <span>Select an icon</span>
                  )
                }
                style={{ width: '100%' }}
                placeholder="Select icon"
                disabled={!isAdmin}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <Button label="Cancel" className="p-button-text" onClick={() => setShowDialog(false)} />
              {isAdmin && (
                <Button label={editingCategory ? 'Update' : 'Create'} icon="pi pi-check" onClick={handleSave} loading={loading} />
              )}
            </div>
          </Dialog>

          {/* Category Request Dialog */}
          <Dialog header="Request New Category" visible={showRequestDialog} style={{ width: 400 }} onHide={() => setShowRequestDialog(false)} modal className="p-fluid" draggable={false} resizable={false}>
            <div className="p-field">
              <label htmlFor="requestName">Category Name</label>
              <InputText 
                id="requestName" 
                value={requestFormData.name} 
                onChange={e => setRequestFormData(f => ({ ...f, name: e.target.value }))} 
                autoFocus 
                placeholder="Enter category name"
              />
            </div>
            <div className="p-field">
              <label htmlFor="requestColor">Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ColorPicker
                  id="requestColor"
                  value={requestFormData.color.replace('#', '')}
                  onChange={e => setRequestFormData(f => ({ ...f, color: `#${e.value}` }))}
                  format="hex"
                  style={{ width: 32, height: 32 }}
                />
                <span style={{ width: 28, height: 28, background: requestFormData.color, borderRadius: '50%', border: '1px solid #ccc', display: 'inline-block' }} />
                <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{requestFormData.color}</span>
              </div>
            </div>
            <div className="p-field">
              <label htmlFor="requestIcon">Icon</label>
              <Dropdown
                id="requestIcon"
                value={requestFormData.icon}
                options={primeIcons}
                onChange={e => setRequestFormData(f => ({ ...f, icon: e.value }))}
                filter
                showClear
                optionLabel="label"
                itemTemplate={(option) => (
                  option && option.value ? (
                    <span><i className={option.value} style={{ marginRight: 8 }} />{option.label}</span>
                  ) : null
                )}
                valueTemplate={(option, props) =>
                  option && option.value ? (
                    <span><i className={option.value} style={{ marginRight: 8 }} />{option.label}</span>
                  ) : (
                    <span>Select an icon</span>
                  )
                }
                style={{ width: '100%' }}
                placeholder="Select icon"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <Button label="Cancel" className="p-button-text" onClick={() => setShowRequestDialog(false)} />
              <Button label="Submit Request" icon="pi pi-send" onClick={handleCategoryRequest} loading={loading} />
            </div>
          </Dialog>
        </TabPanel>
        <TabPanel header="Notifications">
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <h3 style={{ marginBottom: 12 }}>Notifications</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {notifications.map(n => (
                  <li key={n._id} style={{ marginBottom: 8 }}>
                    <Button
                      label={`${n.type === 'category' ? 'Category' : 'Expense'}: ${n.status}`}
                      className={`p-button-sm p-button-${n.status === 'approved' ? 'success' : n.status === 'denied' ? 'danger' : 'info'}`}
                      onClick={() => handleSelectNotification(n)}
                      style={{ width: '100%', textAlign: 'left', marginBottom: 4 }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 2, minWidth: 400 }}>
              {selectedNotification ? (
                <div>
                  <h4>Conversation</h4>
                  <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 16 }}>
                    {selectedNotification.messages.map((m, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <b style={{ color: m.sender === 'admin' ? '#2196f3' : '#374151' }}>{m.sender === 'admin' ? 'Admin' : 'You'}:</b>
                        <span style={{ marginLeft: 8 }}>{m.message}</span>
                        <span style={{ float: 'right', color: '#888', fontSize: 12 }}>{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <InputText
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      style={{ flex: 1 }}
                    />
                    <Button label="Reply" icon="pi pi-send" onClick={handleReply} disabled={!replyMessage.trim()} />
                  </div>
                  {isAdmin && selectedNotification.status === 'requested' && (
                    <div style={{ marginTop: 16 }}>
                      <h5>Approve or Deny</h5>
                      <InputText
                        value={statusRemark}
                        onChange={e => setStatusRemark(e.target.value)}
                        placeholder="Remarks (required)"
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          label="Approve"
                          icon="pi pi-check"
                          className="p-button-success"
                          onClick={() => handleStatus('approved')}
                          disabled={!statusRemark.trim()}
                        />
                        <Button
                          label="Deny"
                          icon="pi pi-times"
                          className="p-button-danger"
                          onClick={() => handleStatus('denied')}
                          disabled={!statusRemark.trim()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#888' }}>Select a notification to view details.</div>
              )}
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Card>
  );
};

export default Settings; 