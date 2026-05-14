const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Product endpoints
  async getProducts(page = 1, limit = 20, category?: string, condition?: string) {
    let url = `/products?page=${page}&limit=${limit}`;
    if (category && category !== 'Todos') url += `&category=${category}`;
    if (condition && condition !== 'Todos') url += `&condition=${condition}`;
    return this.request(url);
  }

  async searchProducts(searchTerm: string, page = 1, limit = 20) {
    return this.request(`/products/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async generateProductDescription(productName: string, category: string, condition: string, price: number) {
    return this.request(`/products/generate-description`, {
      method: 'POST',
      body: JSON.stringify({ productName, category, condition, price }),
    });
  }

  async getSellerProducts(sellerId: string) {
    return this.request(`/products/seller/${sellerId}`);
  }

  // User endpoints
  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleFavorite(userId: string, productId: string) {
    return this.request(`/users/${userId}/favorites/${productId}`, {
      method: 'POST',
    });
  }

  async getFavorites(userId: string) {
    return this.request(`/users/${userId}/favorites`);
  }

  // Chat endpoints
  async createOrGetChat(productId: string, buyerId: string, sellerId: string) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ productId, buyerId, sellerId }),
    });
  }

  async getUserChats(userId: string) {
    return this.request(`/chats/user/${userId}`);
  }

  async getChatMessages(chatId: string) {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId: string, text: string) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getChatSuggestion(chatId: string) {
    return this.request(`/chats/${chatId}/suggestion`);
  }

  // Rating endpoints
  async createRating(productId: string, sellerId: string, rating: number, comment: string) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify({ productId, sellerId, rating, comment }),
    });
  }

  async getSellerRatings(sellerId: string) {
    return this.request(`/ratings/seller/${sellerId}`);
  }

  async getProductRatings(productId: string) {
    return this.request(`/ratings/product/${productId}`);
  }

  async getUserRatings(userId: string) {
    return this.request(`/ratings/user/${userId}`);
  }

  // Report endpoints
  async createReport(itemId: string, itemType: 'product' | 'user', category: string, reason: string, description: string) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType, category, reason, description }),
    });
  }

  async getAllReports(status?: string, itemType?: string) {
    let url = '/reports';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (itemType) params.append('itemType', itemType);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request(url);
  }

  async resolveReport(id: string, resolution: string, notes?: string) {
    return this.request(`/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, notes }),
    });
  }

  async dismissReport(id: string) {
    return this.request(`/reports/${id}/dismiss`, {
      method: 'POST',
    });
  }

  async getPendingReportsCount() {
    return this.request('/reports/pending-count');
  }
}

export const apiClient = new ApiClient();
