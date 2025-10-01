// API client for KeepSafe

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/health');
  }

  // Auth
  async demoLogin() {
    return this.request('/auth/demo', { method: 'POST' });
  }

  // Items CRUD
  async getItems() {
    return this.request('/items');
  }

  async createItem(item) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id, updates) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
