import {
  UserProfile,
  College,
  Canteen,
  MenuCategory,
  MenuItem,
  InventoryItem,
  PickupSlot,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  AnalyticsData,
  AuditLogItem,
  FeedbackSummary,
  FeedbackItem,
  PaymentLedgerSummary,
  PaymentTransaction,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api'
    : 'http://localhost:5000/api');

class ApiService {
  private currentUserId: string = '55555555-5555-5555-5555-555555555555'; // default Aarav Sharma (Student)

  setUserId(id: string) {
    this.currentUserId = id;
    localStorage.setItem('canteenflow_user_id', id);
  }

  getUserId(): string {
    const saved = localStorage.getItem('canteenflow_user_id');
    if (saved) {
      this.currentUserId = saved;
    }
    return this.currentUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    headers.set('x-user-id', this.getUserId());

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const body = await res.json();
        errorMsg = body.message || body.error || errorMsg;
      } catch (e) {
        // use fallback errorMsg
      }
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // --- HEALTH & STATUS ---
  async getHealth() {
    return this.request<{
      status: string;
      platform: string;
      mode: string;
      supabaseConnected: boolean;
      razorpayConfigured: boolean;
      activeRealtimeConnections: number;
    }>('/health');
  }

  // --- AUTH ---
  async getMe() {
    return this.request<{ user: UserProfile; college: College; canteen: Canteen; demoMode: boolean }>('/auth/me');
  }

  async demoSwitchRole(role: 'student' | 'staff' | 'admin') {
    const res = await this.request<{ message: string; user: UserProfile; token: string }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setUserId(res.user.id);
    return res;
  }

  async login(email: string) {
    const res = await this.request<{ message: string; user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    this.setUserId(res.user.id);
    return res;
  }

  // --- COLLEGE & CANTEEN ---
  async getCurrentCollege() {
    return this.request<{ college: College; canteens: Canteen[]; activeCanteen: Canteen }>('/colleges/current');
  }

  async updateCollege(settings: any) {
    return this.request<{ message: string; college: College }>('/colleges/current', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async updateCanteen(id: string, updates: any) {
    return this.request<{ message: string; canteen: Canteen }>(`/colleges/canteen/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // --- MENU ---
  async getMenu(params?: { category?: string; q?: string; dietary?: string; available?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.q) query.set('q', params.q);
    if (params?.dietary) query.set('dietary', params.dietary);
    if (params?.available) query.set('available', 'true');

    return this.request<{ categories: MenuCategory[]; items: MenuItem[] }>(`/menu?${query.toString()}`);
  }

  async getMenuItem(id: string) {
    return this.request<MenuItem>(`/menu/${id}`);
  }

  async createMenuItem(data: Partial<MenuItem>) {
    return this.request<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>) {
    return this.request<MenuItem>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async createCategory(name: string, description?: string) {
    return this.request<MenuCategory>('/menu/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  // --- INVENTORY ---
  async getInventory() {
    return this.request<{ canteenId: string; inventory: InventoryItem[]; lowStockCount: number }>('/inventory');
  }

  async adjustStock(menuItemId: string, changeQty: number, reason: string) {
    return this.request<{ message: string; inventory: any }>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ menuItemId, changeQty, reason }),
    });
  }

  async getStockMovements() {
    return this.request<{ movements: any[] }>('/inventory/movements');
  }

  // --- SCHEDULING ---
  async getPickupSlots(canteenId?: string) {
    const query = canteenId ? `?canteenId=${canteenId}` : '';
    return this.request<{ canteenId: string; slots: PickupSlot[] }>(`/scheduling/slots${query}`);
  }

  // --- ORDERS ---
  async getOrders(status?: OrderStatus) {
    const query = status ? `?status=${status}` : '';
    return this.request<{ orders: Order[]; count: number }>(`/orders${query}`);
  }

  async getOrderById(id: string) {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(payload: {
    orderType: OrderType;
    items: { menuItemId: string; quantity: number }[];
    paymentMethod: PaymentMethod;
    pickupSlotId?: string;
  }) {
    return this.request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus, reason?: string) {
    return this.request<{ message: string; order: Order }>(`/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request<{ message: string; order: Order }>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // --- PICKUP STATION ---
  async verifyPickupToken(token: string) {
    return this.request<{ found: boolean; order: Order; isReady: boolean; isCollected: boolean }>(
      `/pickup/verify?token=${encodeURIComponent(token)}`
    );
  }

  async markOrderCollected(orderId: string) {
    return this.request<{ message: string; order: Order }>('/pickup/collect', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  // --- PAYMENTS ---
  async createPaymentIntent(orderId: string, amount: number, method: PaymentMethod) {
    return this.request<{
      provider: string;
      isLive: boolean;
      amount: number;
      currency: string;
      orderId: string;
      transactionId?: string;
      keyId?: string;
      razorpayOrderId?: string;
    }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, method }),
    });
  }

  async verifyPayment(orderId: string, paymentId?: string, signature?: string) {
    return this.request<{ verified: boolean; message: string; order: Order }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentId, signature }),
    });
  }

  // --- ANALYTICS ---
  async getAnalytics() {
    return this.request<{ collegeId: string; timestamp: string; isLiveMetrics: boolean; analytics: AnalyticsData }>(
      '/analytics'
    );
  }

  // --- USERS ---
  async getUsers() {
    return this.request<{ users: UserProfile[]; count: number }>('/users');
  }

  async updateUserRole(userId: string, role: string) {
    return this.request<{ message: string; user: UserProfile }>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // --- AUDIT ---
  async getAuditLogs() {
    return this.request<{ logs: AuditLogItem[]; count: number }>('/audit');
  }

  // --- FEEDBACK & REVIEWS ---
  async getFeedbacks(canteenId?: string): Promise<FeedbackSummary> {
    const query = canteenId ? `?canteenId=${canteenId}` : '';
    return this.request<FeedbackSummary>(`/feedback${query}`);
  }

  async submitFeedback(payload: { orderId: string; rating: number; comments: string }) {
    return this.request<{ message: string; feedback: FeedbackItem }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- PAYMENTS LEDGER & REFUNDS ---
  async getPaymentsLedger(): Promise<PaymentLedgerSummary> {
    return this.request<PaymentLedgerSummary>('/payments/ledger');
  }

  async refundPayment(paymentId: string, reason?: string) {
    return this.request<{ message: string; payment: PaymentTransaction }>(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

export const api = new ApiService();
