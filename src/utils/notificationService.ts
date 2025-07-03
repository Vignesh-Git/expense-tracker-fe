const API_BASE_URL = 'http://localhost:5000';

export interface NotificationMessage {
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
}

export interface Notification {
  _id: string;
  type: 'category' | 'expense';
  status: 'requested' | 'approved' | 'denied';
  user: { _id: string; name: string; email: string };
  admin?: { _id: string; name: string; email: string };
  relatedCategory?: any;
  relatedExpense?: any;
  messages: NotificationMessage[];
  createdAt: string;
  updatedAt: string;
}

class NotificationService {
  private getToken() {
    return localStorage.getItem('authToken');
  }
  private getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE_URL}/notification`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  }

  async getAllNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE_URL}/notification/admin`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch all notifications');
    return res.json();
  }
  async createNotification(data: {
    type: 'category' | 'expense';
    relatedCategory?: string;
    relatedExpense?: string;
    message: string;
  }): Promise<Notification> {
    const res = await fetch(`${API_BASE_URL}/notification`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create notification');
    return res.json();
  }
  async addReply(id: string, message: string): Promise<Notification> {
    const res = await fetch(`${API_BASE_URL}/notification/${id}/reply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to add reply');
    return res.json();
  }
  async updateStatus(id: string, status: 'approved' | 'denied', message: string): Promise<Notification> {
    const res = await fetch(`${API_BASE_URL}/notification/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, message }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  }
}

export const notificationService = new NotificationService(); 