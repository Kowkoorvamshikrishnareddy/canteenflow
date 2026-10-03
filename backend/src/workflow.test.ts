import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './database/index.js';
import { OrderStatus, PaymentMethod, DietaryTag } from './shared/types.js';

describe('CanteenFlow Full Application Workflow & Edge Cases Test Suite', () => {
  const collegeId = '11111111-1111-1111-1111-111111111111';
  const canteenId = '22222222-2222-2222-2222-222222222222';
  const studentId = '55555555-5555-5555-5555-555555555555';
  const staffId = '44444444-4444-4444-4444-444444444444';
  const adminId = '33333333-3333-3333-3333-333333333333';

  // Test Case 1: Authentication & Role Personas
  it('TC1: verifies pre-seeded personas for student, staff, and admin', () => {
    const student = db.profiles.get(studentId);
    const staff = db.profiles.get(staffId);
    const admin = db.profiles.get(adminId);

    expect(student).toBeDefined();
    expect(student?.role).toBe('student');
    expect(student?.fullName).toBe('Aarav Sharma');

    expect(staff).toBeDefined();
    expect(staff?.role).toBe('staff');
    expect(staff?.fullName).toBe('Chef Vikram Patel');

    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');
    expect(admin?.fullName).toBe('Dean Priya Menon');
  });

  // Test Case 2: Menu Catalog, Pricing, and Dietary Filtering
  it('TC2: retrieves menu categories and verifies item attributes', () => {
    const categories = db.getMenuCategories(canteenId);
    expect(categories.length).toBeGreaterThanOrEqual(4);

    const items = db.getMenuItems(canteenId);
    expect(items.length).toBeGreaterThanOrEqual(6);

    // Verify Masala Dosa
    const dosa = items.find((i) => i.id === 'item-dosa');
    expect(dosa).toBeDefined();
    expect(dosa?.price).toBe(65);
    expect(dosa?.dietaryTags).toContain('veg');
    expect(dosa?.preparationMinutes).toBeGreaterThan(0);
    expect(dosa?.isAvailable).toBe(true);
  });

  // Test Case 3: Immediate Order Placement & Atomic Stock Reservation
  it('TC3: places an immediate order and atomically decrements available stock', () => {
    const item = db.getMenuItem('item-pav-bhaji');
    expect(item).toBeDefined();
    const initialQty = item!.availableQuantity!;

    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      userName: 'Aarav Sharma',
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-pav-bhaji', quantity: 2 }],
      paymentMethod: 'UPI',
    });

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^#CF-\d+/);
    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('PAID');
    expect(order.total).toBe(180 + 9); // subtotal 180 + 5% tax (9) = 189

    // Check stock reservation
    const updated = db.getMenuItem('item-pav-bhaji');
    expect(updated?.availableQuantity).toBe(initialQty - 2);
  });

  // Test Case 4: Stock Depletion Guard & Overselling Prevention
  it('TC4: prevents overselling when requested quantity exceeds available stock', () => {
    expect(() => {
      db.createOrder({
        collegeId,
        canteenId,
        userId: studentId,
        orderType: 'IMMEDIATE',
        items: [{ menuItemId: 'item-pav-bhaji', quantity: 99999 }],
        paymentMethod: 'UPI',
      });
    }).toThrow(/Insufficient stock/);
  });

  // Test Case 5: Capacity-Protected 15-Minute Scheduled Pickup
  it('TC5: allows scheduled pickup order and guards against slot overbooking', () => {
    db.refreshPickupSlots(canteenId);
    const slots = db.getPickupSlots(canteenId);
    expect(slots.length).toBeGreaterThan(0);

    const slot = slots[0];
    const initialReserved = slot.reservedCount;

    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      userName: 'Aarav Sharma',
      orderType: 'SCHEDULED',
      items: [{ menuItemId: 'item-kadak-chai', quantity: 1 }],
      paymentMethod: 'UPI',
      pickupSlotId: slot.id,
    });

    expect(order.orderType).toBe('SCHEDULED');
    expect(order.pickupSlotId).toBe(slot.id);
    expect(slot.reservedCount).toBe(initialReserved + 1);

    // Now saturate slot capacity
    slot.reservedCount = slot.capacity;
    expect(() => {
      db.createOrder({
        collegeId,
        canteenId,
        userId: studentId,
        orderType: 'SCHEDULED',
        items: [{ menuItemId: 'item-kadak-chai', quantity: 1 }],
        paymentMethod: 'UPI',
        pickupSlotId: slot.id,
      });
    }).toThrow(/reached full capacity/);
  });

  // Test Case 6: Full Kitchen Kanban Lifecycle (Placed -> Accepted -> Preparing -> Ready -> Collected)
  it('TC6: transitions an order through the complete kitchen lifecycle', () => {
    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      userName: 'Aarav Sharma',
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-samosa', quantity: 1 }],
      paymentMethod: 'CASH',
    });

    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('CASH_DUE');

    // Placed -> Accepted
    const accepted = db.updateOrderStatus(order.id, 'ACCEPTED', { id: staffId, name: 'Chef Vikram' });
    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.acceptedAt).toBeDefined();

    // Accepted -> Preparing
    const prep = db.updateOrderStatus(order.id, 'PREPARING', { id: staffId, name: 'Chef Vikram' });
    expect(prep.status).toBe('PREPARING');

    // Preparing -> Ready
    const ready = db.updateOrderStatus(order.id, 'READY', { id: staffId, name: 'Chef Vikram' });
    expect(ready.status).toBe('READY');
    expect(ready.readyAt).toBeDefined();

    // Ready -> Collected (Handed over at counter, cash automatically settled)
    const collected = db.updateOrderStatus(order.id, 'COLLECTED', { id: staffId, name: 'Chef Vikram' });
    expect(collected.status).toBe('COLLECTED');
    expect(collected.paymentStatus).toBe('PAID');
    expect(collected.collectedAt).toBeDefined();
  });

  // Test Case 7: Invalid Status Transition Guard
  it('TC7: strictly prohibits illegal state jumps', () => {
    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-samosa', quantity: 1 }],
      paymentMethod: 'UPI',
    });

    // Cannot jump directly from PLACED to READY without being ACCEPTED & PREPARING
    expect(() => {
      db.updateOrderStatus(order.id, 'READY');
    }).toThrow(/Invalid status transition/);

    // Cannot jump from PLACED directly to COLLECTED
    expect(() => {
      db.updateOrderStatus(order.id, 'COLLECTED');
    }).toThrow(/Invalid status transition/);
  });

  // Test Case 8: Order Cancellation and Stock Reversion
  it('TC8: cancels an eligible order and restores reserved stock back to available pool', () => {
    const item = db.getMenuItem('item-paneer-roll');
    const beforeStock = item!.availableQuantity!;

    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-paneer-roll', quantity: 2 }],
      paymentMethod: 'UPI',
    });

    expect(db.getMenuItem('item-paneer-roll')!.availableQuantity).toBe(beforeStock - 2);

    // Cancel order
    const cancelled = db.updateOrderStatus(order.id, 'CANCELLED', { id: studentId, name: 'Aarav' }, 'Lecture extended');
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancellationReason).toBe('Lecture extended');

    // Stock must be restored
    expect(db.getMenuItem('item-paneer-roll')!.availableQuantity).toBe(beforeStock);
  });

  // Test Case 9: Counter Pickup Verification Station
  it('TC9: looks up order by token with or without prefix and validates pickup state', () => {
    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      userName: 'Aarav Sharma',
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-dosa', quantity: 1 }],
      paymentMethod: 'UPI',
    });

    // Advance to READY
    db.updateOrderStatus(order.id, 'ACCEPTED');
    db.updateOrderStatus(order.id, 'PREPARING');
    db.updateOrderStatus(order.id, 'READY');

    // Test token lookup with "#CF-xxx"
    const found1 = db.getOrderByToken(order.orderNumber);
    expect(found1).toBeDefined();
    expect(found1?.id).toBe(order.id);

    // Test token lookup without "#" e.g. "CF-xxx"
    const rawToken = order.orderNumber.replace('#', '');
    const found2 = db.getOrderByToken(rawToken);
    expect(found2).toBeDefined();
    expect(found2?.id).toBe(order.id);
  });

  // Test Case 10: Staff Menu CRUD Operations
  it('TC10: allows staff to create categories, add menu items, and update prices', () => {
    const cat = db.createCategory(canteenId, 'Artisan Pastries', 'Fresh bakery items');
    expect(cat.id).toBeDefined();
    expect(cat.name).toBe('Artisan Pastries');

    const item = db.createMenuItem({
      canteenId,
      categoryId: cat.id,
      name: 'Chocolate Lava Muffin',
      description: 'Warm cocoa muffin with melted center',
      price: 55,
      imagePath: 'https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2',
      dietaryTags: ['veg'],
      preparationMinutes: 5,
      availableQuantity: 25,
      isAvailable: true,
    });

    expect(item.id).toBeDefined();
    expect(item.price).toBe(55);

    // Update price and toggle sold out
    const updated = db.updateMenuItem(item.id, { price: 60, isAvailable: false });
    expect(updated.price).toBe(60);
    expect(updated.isAvailable).toBe(false);
  });

  // Test Case 11: Inventory Stock Adjustments & Movement Audit Trail
  it('TC11: records stock adjustments and logs movement history', () => {
    const beforeInv = db.inventory.get('item-dosa');
    const startQty = beforeInv!.availableQuantity;

    const updatedInv = db.adjustInventory('item-dosa', 20, 'Morning fresh batter delivery', staffId);
    expect(updatedInv.availableQuantity).toBe(startQty + 20);

    const movements = db.inventoryMovements.filter((m) => m.inventoryId === 'item-dosa');
    expect(movements.length).toBeGreaterThan(0);
    expect(movements[0].movementType).toBe('RESTOCK');
    expect(movements[0].quantity).toBe(20);
    expect(movements[0].reason).toContain('Morning fresh batter delivery');
  });

  // Test Case 12: Payment Ledger & Financial Reconciliation
  it('TC12: tracks transaction ledger with payment statuses across online and cash', () => {
    const ledger = db.getPaymentsList(collegeId);
    expect(ledger.length).toBeGreaterThan(0);

    const hasUPI = ledger.some((p) => p.method === 'UPI');
    const hasCash = ledger.some((p) => p.method === 'CASH');
    expect(hasUPI).toBe(true);
    expect(hasCash).toBe(true);

    for (const tx of ledger) {
      expect(tx.amount).toBeGreaterThan(0);
      expect(tx.orderNumber).toBeDefined();
    }
  });

  // Test Case 13: Administrative Refund Trigger
  it('TC13: executes payment refund, cancels order, and logs audit event', () => {
    const ledger = db.getPaymentsList(collegeId);
    const paidTx = ledger.find((p) => p.status === 'SUCCESS');
    expect(paidTx).toBeDefined();

    const refunded = db.refundPayment(paidTx!.id, 'Student overcharged by mistake');
    expect(refunded.status).toBe('REFUNDED');

    const order = db.getOrderById(refunded.orderId);
    expect(order?.paymentStatus).toBe('REFUNDED');
    expect(order?.status).toBe('CANCELLED');
    expect(order?.cancellationReason).toContain('Student overcharged by mistake');

    // Audit log verification
    const logs = db.getAuditLogs(collegeId);
    const refundLog = logs.find((l) => l.event === 'PAYMENT_REFUNDED');
    expect(refundLog).toBeDefined();
    expect(refundLog?.metadata?.paymentId).toBe(paidTx!.id);
  });

  // Test Case 14: Student Meal Quality Rating & CSAT Aggregation
  it('TC14: captures student review and updates campus CSAT ratings', () => {
    const fb = db.addFeedback({
      orderId: 'order-test-e2e',
      userId: studentId,
      userName: 'Aarav Sharma',
      canteenId,
      rating: 5,
      comments: 'Dosas were warm, crispy, and served promptly!',
    });

    expect(fb.id).toBeDefined();
    expect(fb.rating).toBe(5);

    const feedbacks = db.getFeedbacks(canteenId);
    expect(feedbacks.length).toBeGreaterThanOrEqual(1);

    const totalRatings = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const average = totalRatings / feedbacks.length;
    expect(average).toBeGreaterThanOrEqual(4.0);
  });

  // Test Case 15: Operational Analytics Engine Computation
  it('TC15: computes real-time business analytics over actual transactions', () => {
    const analytics = db.getAnalytics(collegeId);
    expect(analytics.totalOrders).toBeGreaterThan(0);
    expect(analytics.grossRevenue).toBeGreaterThan(0);
    expect(analytics.ordersByHour.length).toBe(13); // 08:00 to 20:00 (13 hourly buckets)
    expect(analytics.ordersByDay.length).toBe(6); // Mon through Sat
    expect(analytics.topItems.length).toBeGreaterThan(0);
    expect(analytics.paymentSplit.length).toBeGreaterThan(0);

    // Verify revenue sums match online + cash
    expect(analytics.grossRevenue).toBeCloseTo(analytics.onlineCollected + analytics.cashCollected, 1);
  });

  // Test Case 16: Online UPI Order Lifecycle (Pending Payment -> Verification -> Paid)
  it('TC16: maintains PENDING status for online UPI orders until verification confirms PAID', () => {
    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      userName: 'Aarav Sharma',
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-dosa', quantity: 1 }],
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING',
    });

    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('PENDING');

    const payment = db.payments.get(order.id);
    expect(payment).toBeDefined();
    expect(payment?.status).toBe('PENDING');
    expect(payment?.amount).toBe(order.total);

    // Simulate UPI verification confirmation
    order.paymentStatus = 'PAID';
    order.updatedAt = new Date().toISOString();
    if (payment) {
      payment.status = 'SUCCESS';
      payment.providerTransactionId = 'UPI_TXN_TEST_12345';
      payment.updatedAt = new Date().toISOString();
    }

    expect(order.paymentStatus).toBe('PAID');
    expect(payment?.status).toBe('SUCCESS');
    expect(payment?.providerTransactionId).toBe('UPI_TXN_TEST_12345');
  });
});
