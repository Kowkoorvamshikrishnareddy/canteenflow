import { v4 as uuidv4 } from 'uuid';
import {
  College,
  Canteen,
  Profile,
  MenuCategory,
  MenuItem,
  InventoryItem,
  InventoryMovement,
  PickupSlot,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  Payment,
  PaymentStatus,
  AuditLog,
  Feedback,
  AnalyticsSummary,
} from '../shared/types.js';
import { realtimeHub } from '../modules/realtime/sse.js';

class DatabaseStore {
  public colleges: Map<string, College> = new Map();
  public canteens: Map<string, Canteen> = new Map();
  public profiles: Map<string, Profile> = new Map();
  public menuCategories: Map<string, MenuCategory> = new Map();
  public menuItems: Map<string, MenuItem> = new Map();
  public inventory: Map<string, InventoryItem> = new Map(); // key: menuItemId
  public inventoryMovements: InventoryMovement[] = [];
  public pickupSlots: Map<string, PickupSlot> = new Map();
  public orders: Map<string, Order> = new Map();
  public payments: Map<string, Payment> = new Map();
  public feedback: Feedback[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. College
    const collegeId = '11111111-1111-1111-1111-111111111111';
    const college: College = {
      id: collegeId,
      name: 'Apex Institute of Technology',
      slug: 'apex-tech',
      timezone: 'Asia/Kolkata',
      settings: {
        currency: 'INR',
        currencySymbol: '₹',
        taxRate: 0.05,
        allowCashOnCounter: true,
        advanceOrderHorizonHours: 24,
        cancellationLeadMinutes: 15,
      },
      createdAt: new Date().toISOString(),
    };
    this.colleges.set(collegeId, college);

    // 2. Canteen
    const canteenId = '22222222-2222-2222-2222-222222222222';
    const canteen: Canteen = {
      id: canteenId,
      collegeId,
      name: 'Green Leaf Central Canteen',
      description: 'Main campus dining hall serving fresh, hygienic meals, snacks, and artisan refreshments.',
      operatingHours: {
        open: '08:00',
        close: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      settings: {
        pickupSlotDurationMinutes: 15,
        maxOrdersPerSlot: 15,
        autoAcceptOrders: false,
        isCounterOpen: true,
      },
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.canteens.set(canteenId, canteen);

    // 3. User Personas
    const student: Profile = {
      id: '55555555-5555-5555-5555-555555555555',
      fullName: 'Aarav Sharma',
      email: 'student@apex.edu',
      phone: '+91 98765 43212',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
      role: 'student',
      collegeId,
      canteenId,
      createdAt: new Date().toISOString(),
    };
    const staff: Profile = {
      id: '44444444-4444-4444-4444-444444444444',
      fullName: 'Chef Vikram Patel',
      email: 'staff@apex.edu',
      phone: '+91 98765 43211',
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop',
      role: 'staff',
      collegeId,
      canteenId,
      createdAt: new Date().toISOString(),
    };
    const admin: Profile = {
      id: '33333333-3333-3333-3333-333333333333',
      fullName: 'Dean Priya Menon',
      email: 'admin@apex.edu',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
      role: 'admin',
      collegeId,
      canteenId,
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(student.id, student);
    this.profiles.set(staff.id, staff);
    this.profiles.set(admin.id, admin);

    // 4. Menu Categories
    const catBreakfast = { id: 'cat-breakfast', canteenId, name: 'Breakfast & South Indian', sortOrder: 1, isActive: true };
    const catLunch = { id: 'cat-lunch', canteenId, name: 'Lunch & Meals', sortOrder: 2, isActive: true };
    const catSnacks = { id: 'cat-snacks', canteenId, name: 'Snacks & Quick Bites', sortOrder: 3, isActive: true };
    const catBeverages = { id: 'cat-beverages', canteenId, name: 'Beverages & Coolers', sortOrder: 4, isActive: true };
    this.menuCategories.set(catBreakfast.id, catBreakfast);
    this.menuCategories.set(catLunch.id, catLunch);
    this.menuCategories.set(catSnacks.id, catSnacks);
    this.menuCategories.set(catBeverages.id, catBeverages);

    // 5. Menu Items with realistic images and dietary info
    const items: MenuItem[] = [
      {
        id: 'item-dosa',
        canteenId,
        categoryId: catBreakfast.id,
        name: 'Masala Dosa with Sambar & Chutney',
        description: 'Crispy golden fermented rice-lentil crepe filled with spiced tempered potatoes, served with aromatic vegetable sambar and fresh coconut dip.',
        price: 65,
        imagePath: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
        dietaryTags: ['veg', 'gluten-free'],
        preparationMinutes: 8,
        isAvailable: true,
        availableQuantity: 45,
        reservedQuantity: 0,
        lowStockThreshold: 10,
        trackingMode: 'PREPARE_TO_ORDER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-idli',
        canteenId,
        categoryId: catBreakfast.id,
        name: 'Steamed Idli Sambar Platter (3 pcs)',
        description: 'Ultra fluffy steamed rice cakes served hot with piping lentil sambar and tangy tomato-onion chutney.',
        price: 45,
        imagePath: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
        dietaryTags: ['veg', 'vegan', 'gluten-free'],
        preparationMinutes: 5,
        isAvailable: true,
        availableQuantity: 30,
        reservedQuantity: 0,
        lowStockThreshold: 8,
        trackingMode: 'EXACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-thali',
        canteenId,
        categoryId: catLunch.id,
        name: 'Campus Deluxe Thali',
        description: 'Wholesome balanced meal: 2 seasonal curries, Dal Tadka, fragrant Jeera Rice, 3 soft Phulkas, fresh kachumber salad, and warm Gulab Jamun.',
        price: 120,
        imagePath: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop',
        dietaryTags: ['veg', 'high-protein'],
        preparationMinutes: 12,
        isAvailable: true,
        availableQuantity: 28,
        reservedQuantity: 2,
        lowStockThreshold: 10,
        trackingMode: 'EXACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-paneer-roll',
        canteenId,
        categoryId: catLunch.id,
        name: 'Smoked Paneer Tikka Wrap',
        description: 'Char-grilled cottage cheese cubes tossed with bell peppers and layered in a whole-wheat paratha with cooling mint dressing.',
        price: 85,
        imagePath: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop',
        dietaryTags: ['veg', 'high-protein'],
        preparationMinutes: 10,
        isAvailable: true,
        availableQuantity: 22,
        reservedQuantity: 1,
        lowStockThreshold: 5,
        trackingMode: 'EXACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-samosa',
        canteenId,
        categoryId: catSnacks.id,
        name: 'Crispy Samosa Duo',
        description: '2 crisp golden pastry triangles stuffed with spiced potatoes and green peas, served with sweet date-tamarind and coriander chutneys.',
        price: 35,
        imagePath: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop',
        dietaryTags: ['veg', 'vegan'],
        preparationMinutes: 4,
        isAvailable: true,
        availableQuantity: 65,
        reservedQuantity: 3,
        lowStockThreshold: 15,
        trackingMode: 'EXACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-pav-bhaji',
        canteenId,
        categoryId: catSnacks.id,
        name: 'Butter Pav Bhaji Special',
        description: 'Mashed spiced mixed vegetable gravy generously topped with butter, served with two toasted soft pav buns and sliced lemon.',
        price: 90,
        imagePath: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop',
        dietaryTags: ['veg'],
        preparationMinutes: 10,
        isAvailable: true,
        availableQuantity: 18,
        reservedQuantity: 0,
        lowStockThreshold: 6,
        trackingMode: 'EXACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-kadak-chai',
        canteenId,
        categoryId: catBeverages.id,
        name: 'Masala Kadak Chai',
        description: 'Freshly crushed ginger and green cardamom simmered with strong Assam CTC black tea and dairy milk.',
        price: 20,
        imagePath: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop',
        dietaryTags: ['veg'],
        preparationMinutes: 4,
        isAvailable: true,
        availableQuantity: 120,
        reservedQuantity: 0,
        lowStockThreshold: 20,
        trackingMode: 'PREPARE_TO_ORDER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-cold-coffee',
        canteenId,
        categoryId: catBeverages.id,
        name: 'Iced Frappe Cold Coffee',
        description: 'Dark roasted espresso whipped with chilled creamy milk, chocolate drizzle, and topped with light cocoa foam.',
        price: 50,
        imagePath: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop',
        dietaryTags: ['veg'],
        preparationMinutes: 5,
        isAvailable: true,
        availableQuantity: 40,
        reservedQuantity: 0,
        lowStockThreshold: 10,
        trackingMode: 'EXACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const item of items) {
      this.menuItems.set(item.id, item);
      this.inventory.set(item.id, {
        id: `inv-${item.id}`,
        menuItemId: item.id,
        availableQuantity: item.availableQuantity || 30,
        reservedQuantity: item.reservedQuantity || 0,
        lowStockThreshold: item.lowStockThreshold || 10,
        trackingMode: item.trackingMode || 'EXACT',
        updatedAt: new Date().toISOString(),
      });
    }

    // 6. Generate Realistic Pickup Slots for Today
    this.refreshPickupSlots(canteenId);

    // 7. Seed Initial Orders to demonstrate live queues immediately
    this.seedInitialOrders(collegeId, canteenId, student);

    // 8. Initial Audit Log
    this.auditLogs.push({
      id: uuidv4(),
      collegeId,
      actorName: 'System Bootstrap',
      event: 'SYSTEM_INITIALIZED',
      metadata: { canteenName: canteen.name, version: '1.0.0' },
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    });
  }

  public refreshPickupSlots(canteenId: string) {
    const now = new Date();
    // Generate 15-minute slots for the next 4 hours
    for (let i = 1; i <= 10; i++) {
      const slotStart = new Date(now.getTime() + i * 15 * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);
      const slotId = `slot-${i}`;
      this.pickupSlots.set(slotId, {
        id: slotId,
        canteenId,
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        capacity: 15,
        reservedCount: i === 1 ? 5 : i === 2 ? 12 : 2, // some variation
        isActive: true,
      });
    }
  }

  private seedInitialOrders(collegeId: string, canteenId: string, student: Profile) {
    // Order 1: Active In-Preparation Order for student Aarav
    const order1Id = 'order-cf-101';
    const order1: Order = {
      id: order1Id,
      collegeId,
      canteenId,
      userId: student.id,
      userName: student.fullName,
      orderNumber: '#CF-101',
      orderType: 'IMMEDIATE',
      status: 'PREPARING',
      subtotal: 155,
      taxes: 7.75,
      fees: 0,
      total: 162.75,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      acceptedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      requestedPickupAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      items: [
        {
          id: uuidv4(),
          orderId: order1Id,
          menuItemId: 'item-dosa',
          itemNameSnapshot: 'Masala Dosa with Sambar & Chutney',
          unitPriceSnapshot: 65,
          quantity: 1,
          lineTotal: 65,
        },
        {
          id: uuidv4(),
          orderId: order1Id,
          menuItemId: 'item-pav-bhaji',
          itemNameSnapshot: 'Butter Pav Bhaji Special',
          unitPriceSnapshot: 90,
          quantity: 1,
          lineTotal: 90,
        },
      ],
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    };
    this.orders.set(order1.id, order1);
    this.payments.set(order1.id, {
      id: `pay-${order1Id}`,
      orderId: order1Id,
      provider: 'SIMULATOR',
      method: 'UPI',
      amount: order1.total,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: order1.createdAt,
      updatedAt: order1.createdAt,
    });

    // Order 2: Ready for collection order for another student
    const order2Id = 'order-cf-100';
    const order2: Order = {
      id: order2Id,
      collegeId,
      canteenId,
      userId: 'user-rohit-gupta',
      userName: 'Rohit Gupta (CS Dept)',
      orderNumber: '#CF-100',
      orderType: 'SCHEDULED',
      status: 'READY',
      subtotal: 120,
      taxes: 6,
      fees: 0,
      total: 126,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      acceptedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      readyAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [
        {
          id: uuidv4(),
          orderId: order2Id,
          menuItemId: 'item-thali',
          itemNameSnapshot: 'Campus Deluxe Thali',
          unitPriceSnapshot: 120,
          quantity: 1,
          lineTotal: 120,
        },
      ],
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
    this.orders.set(order2.id, order2);

    // Order 3: Incoming / Placed order waiting for staff action
    const order3Id = 'order-cf-102';
    const order3: Order = {
      id: order3Id,
      collegeId,
      canteenId,
      userId: 'user-ananya-sen',
      userName: 'Ananya Sen (Mech)',
      orderNumber: '#CF-102',
      orderType: 'IMMEDIATE',
      status: 'PLACED',
      subtotal: 85,
      taxes: 4.25,
      fees: 0,
      total: 89.25,
      paymentStatus: 'CASH_DUE',
      paymentMethod: 'CASH',
      items: [
        {
          id: uuidv4(),
          orderId: order3Id,
          menuItemId: 'item-paneer-roll',
          itemNameSnapshot: 'Smoked Paneer Tikka Wrap',
          unitPriceSnapshot: 85,
          quantity: 1,
          lineTotal: 85,
        },
      ],
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    };
    this.orders.set(order3.id, order3);

    // Order 4: Completed order in history
    const order4Id = 'order-cf-098';
    const order4: Order = {
      id: order4Id,
      collegeId,
      canteenId,
      userId: student.id,
      userName: student.fullName,
      orderNumber: '#CF-098',
      orderType: 'IMMEDIATE',
      status: 'COLLECTED',
      subtotal: 55,
      taxes: 2.75,
      fees: 0,
      total: 57.75,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      acceptedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      readyAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
      collectedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      items: [
        {
          id: uuidv4(),
          orderId: order4Id,
          menuItemId: 'item-samosa',
          itemNameSnapshot: 'Crispy Samosa Duo',
          unitPriceSnapshot: 35,
          quantity: 1,
          lineTotal: 35,
        },
        {
          id: uuidv4(),
          orderId: order4Id,
          menuItemId: 'item-kadak-chai',
          itemNameSnapshot: 'Masala Kadak Chai',
          unitPriceSnapshot: 20,
          quantity: 1,
          lineTotal: 20,
        },
      ],
      createdAt: new Date(Date.now() - 125 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    };
    this.orders.set(order4.id, order4);

    this.payments.set(order2.id, {
      id: `pay-${order2Id}`,
      orderId: order2Id,
      provider: 'SIMULATOR',
      method: 'UPI',
      amount: order2.total,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: order2.createdAt,
      updatedAt: order2.createdAt,
    });

    this.payments.set(order3.id, {
      id: `pay-${order3Id}`,
      orderId: order3Id,
      provider: 'CASH_COUNTER',
      method: 'CASH',
      amount: order3.total,
      currency: 'INR',
      status: 'PENDING',
      createdAt: order3.createdAt,
      updatedAt: order3.createdAt,
    });

    this.payments.set(order4.id, {
      id: `pay-${order4Id}`,
      orderId: order4Id,
      provider: 'SIMULATOR',
      method: 'UPI',
      amount: order4.total,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: order4.createdAt,
      updatedAt: order4.createdAt,
    });

    // Seed realistic student reviews & ratings
    this.feedback = [
      {
        id: uuidv4(),
        orderId: order4Id,
        userId: student.id,
        userName: student.fullName,
        canteenId,
        rating: 5,
        comments: 'Super crisp samosas and piping hot chai! Picked up at the counter in under 2 minutes.',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        orderId: 'order-cf-095',
        userId: 'user-rohit-gupta',
        userName: 'Rohit Gupta (CS Dept)',
        canteenId,
        rating: 4,
        comments: 'Deluxe Thali was really good and warm. The scheduled pickup slot saved 15 minutes of lunch rush queue!',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        orderId: 'order-cf-092',
        userId: 'user-ananya-sen',
        userName: 'Ananya Sen (Mech)',
        canteenId,
        rating: 5,
        comments: 'Smoked paneer wrap is the best item on campus. Fresh, flavorful, and great portion size.',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        orderId: 'order-cf-089',
        userId: 'user-kavya-nair',
        userName: 'Kavya Nair (BioTech)',
        canteenId,
        rating: 5,
        comments: 'Clean liquid-glass UI is so smooth on phone! Love the instant digital token and live tracker.',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        orderId: 'order-cf-085',
        userId: 'user-aditya-varma',
        userName: 'Aditya Varma (Civil)',
        canteenId,
        rating: 4,
        comments: 'Filter coffee was rich and strong. Masala dosa chutney was remarkably fresh.',
        createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      },
    ];
  }

  // --- QUERY & MUTATION METHODS ---

  getColleges(): College[] {
    return Array.from(this.colleges.values());
  }

  getCanteen(canteenId: string): Canteen | undefined {
    return this.canteens.get(canteenId);
  }

  getMenuCategories(canteenId: string): MenuCategory[] {
    return Array.from(this.menuCategories.values())
      .filter((c) => c.canteenId === canteenId && c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  createCategory(canteenId: string, name: string, description?: string): MenuCategory {
    const id = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const category: MenuCategory = {
      id,
      canteenId,
      name,
      description,
      sortOrder: this.menuCategories.size + 1,
      isActive: true,
    };
    this.menuCategories.set(id, category);
    return category;
  }

  getMenuItems(canteenId: string): MenuItem[] {
    return Array.from(this.menuItems.values())
      .filter((item) => item.canteenId === canteenId)
      .map((item) => {
        const inv = this.inventory.get(item.id);
        return {
          ...item,
          availableQuantity: inv?.availableQuantity ?? 0,
          reservedQuantity: inv?.reservedQuantity ?? 0,
          lowStockThreshold: inv?.lowStockThreshold ?? 10,
          trackingMode: inv?.trackingMode ?? 'EXACT',
        };
      });
  }

  getMenuItem(id: string): MenuItem | undefined {
    const item = this.menuItems.get(id);
    if (!item) return undefined;
    const inv = this.inventory.get(item.id);
    return {
      ...item,
      availableQuantity: inv?.availableQuantity ?? 0,
      reservedQuantity: inv?.reservedQuantity ?? 0,
      lowStockThreshold: inv?.lowStockThreshold ?? 10,
      trackingMode: inv?.trackingMode ?? 'EXACT',
    };
  }

  createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): MenuItem {
    const id = `item-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newItem: MenuItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.menuItems.set(id, newItem);
    this.inventory.set(id, {
      id: `inv-${id}`,
      menuItemId: id,
      availableQuantity: data.availableQuantity || 50,
      reservedQuantity: 0,
      lowStockThreshold: data.lowStockThreshold || 10,
      trackingMode: data.trackingMode || 'EXACT',
      updatedAt: now,
    });
    realtimeHub.broadcast('MENU_UPDATED', { itemId: id, action: 'CREATED' });
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem {
    const existing = this.menuItems.get(id);
    if (!existing) throw new Error(`Menu item ${id} not found`);
    const updated: MenuItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.menuItems.set(id, updated);
    if (updates.availableQuantity !== undefined) {
      const inv = this.inventory.get(id);
      if (inv) {
        inv.availableQuantity = updates.availableQuantity;
        inv.updatedAt = new Date().toISOString();
      }
    }
    realtimeHub.broadcast('MENU_UPDATED', { itemId: id, action: 'UPDATED' });
    return updated;
  }

  getInventory(canteenId: string) {
    const items = this.getMenuItems(canteenId);
    return items.map((item) => {
      const inv = this.inventory.get(item.id);
      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        imagePath: item.imagePath,
        dietaryTags: item.dietaryTags,
        availableQuantity: inv?.availableQuantity ?? 0,
        reservedQuantity: inv?.reservedQuantity ?? 0,
        lowStockThreshold: inv?.lowStockThreshold ?? 10,
        trackingMode: inv?.trackingMode ?? 'EXACT',
        isLowStock: (inv?.availableQuantity ?? 0) <= (inv?.lowStockThreshold ?? 10),
      };
    });
  }

  adjustInventory(menuItemId: string, changeQty: number, reason: string, actorId?: string) {
    const inv = this.inventory.get(menuItemId);
    if (!inv) throw new Error('Inventory record not found');
    const newQty = inv.availableQuantity + changeQty;
    if (newQty < 0) throw new Error('Cannot reduce stock below zero');
    inv.availableQuantity = newQty;
    inv.updatedAt = new Date().toISOString();

    const movement: InventoryMovement = {
      id: uuidv4(),
      inventoryId: menuItemId,
      movementType: changeQty >= 0 ? 'RESTOCK' : 'ADJUSTMENT',
      quantity: Math.abs(changeQty),
      reason,
      actorId,
      createdAt: new Date().toISOString(),
    };
    this.inventoryMovements.push(movement);
    realtimeHub.broadcast('INVENTORY_CHANGED', { menuItemId, availableQuantity: newQty });
    return inv;
  }

  getPickupSlots(canteenId: string): PickupSlot[] {
    return Array.from(this.pickupSlots.values())
      .filter((s) => s.canteenId === canteenId && s.isActive)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }

  // --- ORDER CREATION & CONCURRENCY-SAFE RESERVATION ---
  createOrder(params: {
    collegeId: string;
    canteenId: string;
    userId: string;
    userName?: string;
    orderType: OrderType;
    items: { menuItemId: string; quantity: number }[];
    paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
    paymentStatus?: PaymentStatus;
    pickupSlotId?: string;
  }): Order {
    const { collegeId, canteenId, userId, userName, orderType, items, paymentMethod, pickupSlotId } = params;

    // 1. Concurrency-safe pickup slot capacity validation
    if (orderType === 'SCHEDULED') {
      if (!pickupSlotId) {
        throw new Error('Pickup slot is required for scheduled orders');
      }
      const slot = this.pickupSlots.get(pickupSlotId);
      if (!slot || !slot.isActive) {
        throw new Error('Selected pickup slot is not available');
      }
      if (slot.reservedCount >= slot.capacity) {
        throw new Error('This pickup slot just reached full capacity. Please select an alternate slot.');
      }
      // Reserve slot count atomically
      slot.reservedCount += 1;
    }

    // 2. Validate items & Concurrency-safe inventory reservations
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    const orderId = `order-${uuidv4()}`;

    for (const requestedItem of items) {
      const menuItem = this.menuItems.get(requestedItem.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${requestedItem.menuItemId} does not exist`);
      }
      if (!menuItem.isAvailable) {
        throw new Error(`"${menuItem.name}" is currently marked unavailable`);
      }

      // Check stock
      const inv = this.inventory.get(menuItem.id);
      if (inv && inv.trackingMode === 'EXACT') {
        if (inv.availableQuantity < requestedItem.quantity) {
          throw new Error(`Insufficient stock for "${menuItem.name}". Only ${inv.availableQuantity} left.`);
        }
        // Deduct available, increment reserved
        inv.availableQuantity -= requestedItem.quantity;
        inv.reservedQuantity += requestedItem.quantity;
        inv.updatedAt = new Date().toISOString();
      }

      const lineTotal = menuItem.price * requestedItem.quantity;
      subtotal += lineTotal;

      orderItems.push({
        id: uuidv4(),
        orderId,
        menuItemId: menuItem.id,
        itemNameSnapshot: menuItem.name,
        unitPriceSnapshot: menuItem.price,
        quantity: requestedItem.quantity,
        lineTotal,
      });
    }

    // 3. Tax & Totals calculation
    const college = this.colleges.get(collegeId);
    const taxRate = college?.settings.taxRate ?? 0.05;
    const taxes = Math.round(subtotal * taxRate * 100) / 100;
    const fees = 0;
    const total = Math.round((subtotal + taxes + fees) * 100) / 100;

    // 4. Generate human-readable Token (e.g. #CF-103)
    const orderCount = this.orders.size + 101;
    const orderNumber = `#CF-${orderCount}`;

    const now = new Date().toISOString();
    const isCash = paymentMethod === 'CASH';
    const computedPaymentStatus = params.paymentStatus || (isCash ? 'CASH_DUE' : 'PAID');

    const order: Order = {
      id: orderId,
      collegeId,
      canteenId,
      userId,
      userName: userName || 'Student',
      orderNumber,
      orderType,
      status: 'PLACED',
      subtotal,
      taxes,
      fees,
      total,
      paymentStatus: computedPaymentStatus,
      paymentMethod,
      pickupSlotId,
      requestedPickupAt: pickupSlotId ? this.pickupSlots.get(pickupSlotId)?.startsAt : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      items: orderItems,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(orderId, order);

    // Create payment record
    this.payments.set(orderId, {
      id: `pay-${uuidv4()}`,
      orderId,
      provider: isCash ? 'CASH_COUNTER' : 'SIMULATOR',
      method: paymentMethod,
      amount: total,
      currency: 'INR',
      status: computedPaymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING',
      createdAt: now,
      updatedAt: now,
    });

    // Record Audit
    this.auditLogs.unshift({
      id: uuidv4(),
      collegeId,
      actorId: userId,
      actorName: userName,
      event: 'ORDER_PLACED',
      metadata: { orderNumber, total, orderType, paymentMethod },
      createdAt: now,
    });

    // Broadcast Realtime Event
    realtimeHub.broadcast('ORDER_CREATED', order);
    return order;
  }

  getOrders(filters?: { userId?: string; canteenId?: string; status?: OrderStatus }): Order[] {
    let list = Array.from(this.orders.values());
    if (filters?.userId) {
      list = list.filter((o) => o.userId === filters.userId);
    }
    if (filters?.canteenId) {
      list = list.filter((o) => o.canteenId === filters.canteenId);
    }
    if (filters?.status) {
      list = list.filter((o) => o.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrderByToken(token: string): Order | undefined {
    const cleaned = token.trim().toUpperCase();
    return Array.from(this.orders.values()).find(
      (o) => o.orderNumber.toUpperCase() === cleaned || o.orderNumber.toUpperCase() === `#${cleaned}`
    );
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, actor?: { id: string; name: string }, reason?: string): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const prevStatus = order.status;

    // Validate State Transitions
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING_PAYMENT: ['PLACED', 'CANCELLED'],
      PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY'],
      READY: ['COLLECTED'],
      COLLECTED: [],
      CANCELLED: [],
      REJECTED: [],
    };

    if (!allowedTransitions[prevStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${prevStatus} to ${newStatus}`);
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'ACCEPTED') {
      order.acceptedAt = new Date().toISOString();
    } else if (newStatus === 'READY') {
      order.readyAt = new Date().toISOString();
    } else if (newStatus === 'COLLECTED') {
      order.collectedAt = new Date().toISOString();
      if (order.paymentStatus === 'CASH_DUE') {
        order.paymentStatus = 'PAID';
        const pay = this.payments.get(orderId);
        if (pay) pay.status = 'SUCCESS';
      }
      // Release reserved inventory
      for (const item of order.items) {
        const inv = this.inventory.get(item.menuItemId);
        if (inv && inv.trackingMode === 'EXACT') {
          inv.reservedQuantity = Math.max(0, inv.reservedQuantity - item.quantity);
        }
      }
    } else if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      order.cancellationReason = reason;
      // Revert reserved inventory back to available
      for (const item of order.items) {
        const inv = this.inventory.get(item.menuItemId);
        if (inv && inv.trackingMode === 'EXACT') {
          inv.availableQuantity += item.quantity;
          inv.reservedQuantity = Math.max(0, inv.reservedQuantity - item.quantity);
        }
      }
    }

    this.auditLogs.unshift({
      id: uuidv4(),
      collegeId: order.collegeId,
      actorId: actor?.id,
      actorName: actor?.name,
      event: `ORDER_${newStatus}`,
      metadata: { orderId, orderNumber: order.orderNumber, prevStatus, newStatus, reason },
      createdAt: new Date().toISOString(),
    });

    realtimeHub.broadcast('ORDER_UPDATED', order);
    return order;
  }

  // --- ANALYTICS ENGINE (Calculated over real order data) ---
  getAnalytics(collegeId: string): AnalyticsSummary {
    const orders = Array.from(this.orders.values()).filter((o) => o.collegeId === collegeId);
    const completedOrders = orders.filter((o) => o.status === 'COLLECTED');
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED');

    let grossRevenue = 0;
    let cashCollected = 0;
    let onlineCollected = 0;

    const hourMap: Record<number, number> = {};
    for (let h = 8; h <= 20; h++) hourMap[h] = 0;

    const dayMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    const itemSales: Record<string, { quantity: number; revenue: number }> = {};
    const paymentMethods: Record<string, { count: number; total: number }> = {
      UPI: { count: 0, total: 0 },
      CARD: { count: 0, total: 0 },
      CASH: { count: 0, total: 0 },
    };

    for (const order of orders) {
      if (order.status !== 'CANCELLED' && order.status !== 'REJECTED') {
        grossRevenue += order.total;
        if (order.paymentMethod === 'CASH') {
          cashCollected += order.total;
        } else {
          onlineCollected += order.total;
        }

        const date = new Date(order.createdAt);
        const hour = date.getHours();
        if (hourMap[hour] !== undefined) {
          hourMap[hour] += 1;
        }

        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        if (dayMap[dayName] !== undefined) {
          dayMap[dayName] += 1;
        }

        const method = order.paymentMethod || 'UPI';
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, total: 0 };
        }
        paymentMethods[method].count += 1;
        paymentMethods[method].total += order.total;

        for (const item of order.items) {
          if (!itemSales[item.itemNameSnapshot]) {
            itemSales[item.itemNameSnapshot] = { quantity: 0, revenue: 0 };
          }
          itemSales[item.itemNameSnapshot].quantity += item.quantity;
          itemSales[item.itemNameSnapshot].revenue += item.lineTotal;
        }
      }
    }

    const ordersByHour = Object.entries(hourMap).map(([h, count]) => ({
      hour: `${h.padStart(2, '0')}:00`,
      count,
    }));

    const ordersByDay = Object.entries(dayMap).map(([day, count]) => ({
      day,
      count,
    }));

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const paymentSplit = Object.entries(paymentMethods).map(([method, data]) => ({
      method,
      count: data.count,
      total: Math.round(data.total * 100) / 100,
    }));

    const averageOrderValue = completedOrders.length > 0 ? Math.round((grossRevenue / orders.length) * 100) / 100 : 0;

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      cashCollected: Math.round(cashCollected * 100) / 100,
      onlineCollected: Math.round(onlineCollected * 100) / 100,
      averageOrderValue,
      ordersByHour,
      ordersByDay,
      topItems,
      paymentSplit,
    };
  }

  getAuditLogs(collegeId: string): AuditLog[] {
    return this.auditLogs.filter((l) => l.collegeId === collegeId).slice(0, 50);
  }

  // --- FEEDBACK METHODS ---
  getFeedbacks(canteenId?: string): Feedback[] {
    if (canteenId) {
      return this.feedback.filter((f) => f.canteenId === canteenId);
    }
    return [...this.feedback];
  }

  addFeedback(data: {
    orderId: string;
    userId: string;
    userName: string;
    canteenId: string;
    rating: number;
    comments: string;
  }): Feedback {
    const newFeedback: Feedback = {
      id: uuidv4(),
      orderId: data.orderId,
      userId: data.userId,
      userName: data.userName,
      canteenId: data.canteenId,
      rating: Math.max(1, Math.min(5, data.rating)),
      comments: data.comments,
      createdAt: new Date().toISOString(),
    };
    this.feedback.unshift(newFeedback);
    return newFeedback;
  }

  // --- PAYMENT LEDGER & REFUND METHODS ---
  getPaymentsList(collegeId?: string): (Payment & { orderNumber?: string; customerName?: string })[] {
    const result: (Payment & { orderNumber?: string; customerName?: string })[] = [];
    for (const payment of this.payments.values()) {
      const order = this.orders.get(payment.orderId);
      if (!collegeId || (order && order.collegeId === collegeId)) {
        result.push({
          ...payment,
          orderNumber: order?.orderNumber,
          customerName: order?.userName,
        });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  refundPayment(paymentId: string, reason?: string): Payment {
    let targetPayment: Payment | undefined;
    for (const p of this.payments.values()) {
      if (p.id === paymentId) {
        targetPayment = p;
        break;
      }
    }

    if (!targetPayment) {
      throw new Error(`Payment with ID ${paymentId} not found in system.`);
    }

    targetPayment.status = 'REFUNDED';
    targetPayment.updatedAt = new Date().toISOString();

    const order = this.orders.get(targetPayment.orderId);
    if (order) {
      order.paymentStatus = 'REFUNDED';
      order.status = 'CANCELLED';
      order.cancellationReason = reason || 'Payment refunded by administrator';
      order.updatedAt = new Date().toISOString();
    }

    this.auditLogs.unshift({
      id: uuidv4(),
      collegeId: order?.collegeId || '11111111-1111-1111-1111-111111111111',
      actorName: 'Administrator',
      event: 'PAYMENT_REFUNDED',
      metadata: { paymentId, orderId: targetPayment.orderId, amount: targetPayment.amount, reason },
      createdAt: new Date().toISOString(),
    });

    return targetPayment;
  }
}

export const db = new DatabaseStore();
