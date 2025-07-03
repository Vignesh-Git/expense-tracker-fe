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

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

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

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (window.confirm(`Delete category '${category.name}'?`)) {
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
    }
  };

  // Table action buttons
  const actionTemplate = (cat: Category) => (
    <>
      <Button icon="pi pi-pencil" className="p-button-text p-mr-2" onClick={() => openDialog(cat)} tooltip="Edit" />
      {!cat.isDefault && (
        <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => handleDelete(cat)} tooltip="Delete" />
      )}
    </>
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
      <TabView>
        <TabPanel header="Category">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Manage Categories</h3>
            <Button label="Add Category" icon="pi pi-plus" onClick={() => openDialog()} />
          </div>
          <DataTable value={categories} loading={loading} responsiveLayout="scroll" paginator rows={8} style={{ minHeight: 300 }}>
            <Column field="name" header="Name" sortable />
            <Column field="color" header="Color" body={colorTemplate} />
            <Column field="icon" header="Icon" body={iconTemplate} />
            <Column field="isDefault" header="Default" body={cat => cat.isDefault ? <Tag value="Default" severity="info" /> : ''} />
            <Column header="Actions" body={actionTemplate} style={{ width: 120 }} />
          </DataTable>
          <Dialog header={editingCategory ? 'Edit Category' : 'Add Category'} visible={showDialog} style={{ width: 400 }} onHide={() => setShowDialog(false)} modal className="p-fluid" draggable={false} resizable={false}>
            <div className="p-field">
              <label htmlFor="name">Name</label>
              <InputText id="name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div className="p-field">
              <label htmlFor="color">Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* ColorPicker expects value without #, so strip it for the component, but store with # */}
                <ColorPicker
                  id="color"
                  value={formData.color.replace('#', '')}
                  onChange={e => setFormData(f => ({ ...f, color: `#${e.value}` }))}
                  format="hex"
                  style={{ width: 32, height: 32 }}
                />
                {/* Color preview */}
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
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <Button label="Cancel" className="p-button-text" onClick={() => setShowDialog(false)} />
              <Button label={editingCategory ? 'Update' : 'Create'} icon="pi pi-check" onClick={handleSave} loading={loading} />
            </div>
          </Dialog>
        </TabPanel>
      </TabView>
    </Card>
  );
};

export default Settings; 