export type UserRole = 'student' | 'staff' | 'admin';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'REJECTED';

export type OrderType = 'IMMEDIATE' | 'SCHEDULED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CASH_DUE';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';

export type DietaryTag = 'veg' | 'jain' | 'vegan' | 'high-protein' | 'gluten-free' | 'egg';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  collegeId: string;
  canteenId?: string;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  settings: {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    allowCashOnCounter: boolean;
    advanceOrderHorizonHours: number;
    cancellationLeadMinutes: number;
  };
}

export interface Canteen {
  id: string;
  collegeId: string;
  name: string;
  description: string;
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  settings: {
    pickupSlotDurationMinutes: number;
    maxOrdersPerSlot: number;
    autoAcceptOrders: boolean;
    isCounterOpen: boolean;
  };
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  canteenId: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  canteenId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imagePath: string;
  dietaryTags: DietaryTag[];
  preparationMinutes: number;
  isAvailable: boolean;
  availableQuantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  trackingMode?: 'EXACT' | 'UNLIMITED' | 'PREPARE_TO_ORDER';
}

export interface InventoryItem {
  menuItemId: string;
  name: string;
  price: number;
  imagePath: string;
  dietaryTags: DietaryTag[];
  availableQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  trackingMode: 'EXACT' | 'UNLIMITED' | 'PREPARE_TO_ORDER';
  isLowStock: boolean;
}

export interface PickupSlot {
  id: string;
  canteenId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reservedCount: number;
  availableRemaining: number;
  isFull: boolean;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  customizationData?: Record<string, any>;
}

export interface Order {
  id: string;
  collegeId: string;
  canteenId: string;
  userId: string;
  userName?: string;
  orderNumber: string; // e.g. #CF-101
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  pickupSlotId?: string;
  requestedPickupAt?: string;
  acceptedAt?: string;
  readyAt?: string;
  collectedAt?: string;
  cancellationReason?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  customizationNote?: string;
}

export interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  grossRevenue: number;
  cashCollected: number;
  onlineCollected: number;
  averageOrderValue: number;
  ordersByHour: { hour: string; count: number }[];
  ordersByDay: { day: string; count: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  paymentSplit: { method: string; count: number; total: number }[];
}

export interface AuditLogItem {
  id: string;
  collegeId: string;
  actorId?: string;
  actorName?: string;
  event: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  canteenId: string;
  rating: number;
  comments: string;
  createdAt: string;
}

export interface FeedbackSummary {
  totalCount: number;
  averageRating: number;
  distribution: Record<number, number>;
  items: FeedbackItem[];
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  provider: string;
  providerTransactionId?: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLedgerSummary {
  totalCount: number;
  totalSuccessfulVolume: number;
  totalRefundedVolume: number;
  transactions: PaymentTransaction[];
}

