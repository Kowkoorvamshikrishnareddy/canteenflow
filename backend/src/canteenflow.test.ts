import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './database/index.js';

describe('CanteenFlow Core Business Logic', () => {
  const collegeId = '11111111-1111-1111-1111-111111111111';
  const canteenId = '22222222-2222-2222-2222-222222222222';
  const studentId = '55555555-5555-5555-5555-555555555555';

  it('retrieves canteen and menu categories', () => {
    const canteen = db.getCanteen(canteenId);
    expect(canteen).toBeDefined();
    expect(canteen?.name).toContain('Green Leaf');

    const categories = db.getMenuCategories(canteenId);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('creates an immediate order and atomically reserves stock', () => {
    const item = db.getMenuItem('item-thali');
    expect(item).toBeDefined();
    const initialAvailable = item!.availableQuantity!;

    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      userName: 'Aarav Sharma',
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-thali', quantity: 2 }],
      paymentMethod: 'UPI',
    });

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^#CF-\d+/);
    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('PAID');
    expect(order.items.length).toBe(1);

    // Verify stock deduction
    const updatedItem = db.getMenuItem('item-thali');
    expect(updatedItem?.availableQuantity).toBe(initialAvailable - 2);
  });

  it('prevents overselling when stock is insufficient', () => {
    expect(() => {
      db.createOrder({
        collegeId,
        canteenId,
        userId: studentId,
        orderType: 'IMMEDIATE',
        items: [{ menuItemId: 'item-thali', quantity: 9999 }],
        paymentMethod: 'UPI',
      });
    }).toThrow(/Insufficient stock/);
  });

  it('validates scheduled ordering and prevents slot overbooking', () => {
    db.refreshPickupSlots(canteenId);
    const slots = db.getPickupSlots(canteenId);
    expect(slots.length).toBeGreaterThan(0);

    const slot = slots[0];
    // Artificially fill the slot to capacity
    slot.reservedCount = slot.capacity;

    expect(() => {
      db.createOrder({
        collegeId,
        canteenId,
        userId: studentId,
        orderType: 'SCHEDULED',
        items: [{ menuItemId: 'item-dosa', quantity: 1 }],
        paymentMethod: 'UPI',
        pickupSlotId: slot.id,
      });
    }).toThrow(/reached full capacity/);
  });

  it('enforces valid order state transitions and audit logging', () => {
    const order = db.createOrder({
      collegeId,
      canteenId,
      userId: studentId,
      orderType: 'IMMEDIATE',
      items: [{ menuItemId: 'item-dosa', quantity: 1 }],
      paymentMethod: 'CASH',
    });

    expect(order.status).toBe('PLACED');
    expect(order.paymentStatus).toBe('CASH_DUE');

    // PLACED -> ACCEPTED
    const accepted = db.updateOrderStatus(order.id, 'ACCEPTED', { id: 'staff-1', name: 'Chef' });
    expect(accepted.status).toBe('ACCEPTED');

    // ACCEPTED -> PREPARING
    const preparing = db.updateOrderStatus(order.id, 'PREPARING', { id: 'staff-1', name: 'Chef' });
    expect(preparing.status).toBe('PREPARING');

    // PREPARING -> READY
    const ready = db.updateOrderStatus(order.id, 'READY', { id: 'staff-1', name: 'Chef' });
    expect(ready.status).toBe('READY');

    // READY -> COLLECTED
    const collected = db.updateOrderStatus(order.id, 'COLLECTED', { id: 'staff-1', name: 'Chef' });
    expect(collected.status).toBe('COLLECTED');
    expect(collected.paymentStatus).toBe('PAID'); // Cash settled upon collection

    // Invalid transition: COLLECTED -> CANCELLED should fail
    expect(() => {
      db.updateOrderStatus(order.id, 'CANCELLED');
    }).toThrow(/Invalid status transition/);
  });

  it('calculates operational analytics from real database orders', () => {
    const analytics = db.getAnalytics(collegeId);
    expect(analytics.totalOrders).toBeGreaterThan(0);
    expect(analytics.grossRevenue).toBeGreaterThan(0);
    expect(analytics.ordersByHour.length).toBeGreaterThan(0);
    expect(analytics.topItems.length).toBeGreaterThan(0);
    expect(analytics.paymentSplit.length).toBeGreaterThan(0);
  });

  it('records student meal feedback and calculates satisfaction metrics', () => {
    const feedback = db.addFeedback({
      orderId: 'order-test-feedback',
      userId: studentId,
      userName: 'Aarav Sharma',
      canteenId,
      rating: 5,
      comments: 'Crisp hot dosas and great sambar!',
    });

    expect(feedback.id).toBeDefined();
    expect(feedback.rating).toBe(5);

    const feedbacks = db.getFeedbacks(canteenId);
    expect(feedbacks.length).toBeGreaterThan(0);
    expect(feedbacks[0].comments).toContain('Crisp hot dosas');
  });

  it('retrieves payment ledger and processes payment refund', () => {
    const list = db.getPaymentsList(collegeId);
    expect(list.length).toBeGreaterThan(0);

    const successfulPayment = list.find((p) => p.status === 'SUCCESS');
    expect(successfulPayment).toBeDefined();

    const refunded = db.refundPayment(successfulPayment!.id, 'Order cancelled by admin test');
    expect(refunded.status).toBe('REFUNDED');

    // Confirm associated order is cancelled & refunded
    const order = db.getOrderById(refunded.orderId);
    expect(order?.paymentStatus).toBe('REFUNDED');
    expect(order?.status).toBe('CANCELLED');
  });
});
