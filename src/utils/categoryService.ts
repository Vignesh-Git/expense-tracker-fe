// Category service for handling API calls related to categories

const API_BASE_URL = 'http://localhost:5000';

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

/**
 * Category service class
 * Handles all category-related API calls with authentication
 */
class CategoryService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Get current authentication token
   */
  private getToken(): string | null {
    return this.token || localStorage.getItem('authToken');
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Get all categories for the authenticated user
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      return data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch category');
      }

      return data;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<{ message: string; category: Category }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories`, {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      return data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<{ message: string; category: Category }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category');
      }

      return data;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      return data;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Create default categories for new user
   */
  async createDefaultCategories(): Promise<{ message: string; categories: Category[] }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories/default`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create default categories');
      }

      return data;
    } catch (error) {
      console.error('Create default categories error:', error);
      throw error;
    }
  }

  /**
   * Toggle category active status (admin only)
   */
  async toggleCategoryStatus(id: string, isActive: boolean): Promise<{ message: string; category: Category }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/categories/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle category status');
      }

      return data;
    } catch (error) {
      console.error('Toggle category status error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService; 