// Expense service for handling API calls related to expenses

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Expense {
  _id: string;
  user: string;
  category: Category;
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: string[];
  approval: {
    status: 'requested' | 'approved' | 'denied';
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateExpenseRequest {
  category: string;
  amount: number;
  description: string;
  date?: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseAnalytics {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalSpending: number;
    totalExpenses: number;
    averageDailySpending: number;
  };
  byCategory: Array<{
    _id: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    count: number;
  }>;
  byPaymentMethod: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    period: string;
    total: number;
    count: number;
  }>;
}

export interface PaginatedResponse<T> {
  expenses: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
  };
}

/**
 * Expense service class
 * Handles all expense-related API calls with authentication
 */
class ExpenseService {
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
   * Get all expenses with filtering and pagination
   */
  async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.makeAuthRequest(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch expenses');
      }

      return data;
    } catch (error) {
      console.error('Get expenses error:', error);
      throw error;
    }
  }

  /**
   * Get a single expense by ID
   */
  async getExpenseById(id: string): Promise<Expense> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/expenses/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch expense');
      }

      return data;
    } catch (error) {
      console.error('Get expense by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData: CreateExpenseRequest): Promise<{ message: string; expense: Expense }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create expense');
      }

      return data;
    } catch (error) {
      console.error('Create expense error:', error);
      throw error;
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(id: string, expenseData: UpdateExpenseRequest): Promise<{ message: string; expense: Expense }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update expense');
      }

      return data;
    } catch (error) {
      console.error('Update expense error:', error);
      throw error;
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<{ message: string }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete expense');
      }

      return data;
    } catch (error) {
      console.error('Delete expense error:', error);
      throw error;
    }
  }

  /**
   * Get expense analytics and statistics
   */
  async getExpenseAnalytics(filters: { startDate?: string; endDate?: string; period?: string } = {}): Promise<ExpenseAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/expenses/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.makeAuthRequest(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }

      return data;
    } catch (error) {
      console.error('Get expense analytics error:', error);
      throw error;
    }
  }

  /**
   * Get all pending approvals (admin)
   */
  async getPendingApprovals(): Promise<Expense[]> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/admin/pending-approvals`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pending approvals');
      }
      return data;
    } catch (error) {
      console.error('Get pending approvals error:', error);
      throw error;
    }
  }

  /**
   * Update approval status of an expense (admin)
   */
  async updateApprovalStatus(id: string, status: 'approved' | 'denied', description = ''): Promise<{ message: string; expense: Expense }> {
    try {
      const response = await this.makeAuthRequest(`${API_BASE_URL}/expenses/${id}` , {
        method: 'PUT',
        body: JSON.stringify({ approval: { status, description } })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update approval status');
      }
      return data;
    } catch (error) {
      console.error('Update approval status error:', error);
      throw error;
    }
  }

  /**
   * Get all expenses for admin with filters
   */
  async getAllExpensesAdmin(filters: any = {}): Promise<PaginatedResponse<Expense>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      const url = `${API_BASE_URL}/admin/all-expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeAuthRequest(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch all expenses');
      }
      return data;
    } catch (error) {
      console.error('Get all expenses (admin) error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const expenseService = new ExpenseService();
export default expenseService; 