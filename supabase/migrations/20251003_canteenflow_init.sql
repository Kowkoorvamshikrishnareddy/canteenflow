-- CanteenFlow Supabase PostgreSQL Initial Migration
-- Migration: 20251003_canteenflow_init.sql
-- Description: Multi-tenant database schema for campus canteen management & ordering

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TENANT & IDENTITY
-- ==============================================================================

-- Colleges (Tenants)
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    settings JSONB NOT NULL DEFAULT '{
        "currency": "INR",
        "currency_symbol": "₹",
        "tax_rate": 0.05,
        "allow_cash_on_counter": true,
        "advance_order_horizon_hours": 24,
        "cancellation_lead_minutes": 15
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Canteens
CREATE TABLE IF NOT EXISTS canteens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    operating_hours JSONB NOT NULL DEFAULT '{
        "open": "08:30",
        "close": "19:30",
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "pickup_slot_duration_minutes": 15,
        "max_orders_per_slot": 15,
        "auto_accept_orders": false,
        "is_counter_open": true
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- College Memberships (Role: student, staff, admin)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    canteen_id UUID REFERENCES canteens(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(college_id, user_id)
);

-- ==============================================================================
-- 2. MENU & INVENTORY
-- ==============================================================================

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canteen_id UUID NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canteen_id UUID NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_path TEXT,
    dietary_tags TEXT[] DEFAULT '{}', -- e.g. ['veg', 'jain', 'vegan', 'high-protein', 'gluten-free']
    preparation_minutes INTEGER NOT NULL DEFAULT 10 CHECK (preparation_minutes >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID UNIQUE NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    available_quantity INTEGER NOT NULL DEFAULT 50 CHECK (available_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
    tracking_mode TEXT NOT NULL DEFAULT 'EXACT' CHECK (tracking_mode IN ('EXACT', 'UNLIMITED', 'PREPARE_TO_ORDER')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('RESTOCK', 'RESERVE', 'RELEASE', 'SALE', 'ADJUSTMENT', 'WASTAGE')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. ORDERS & SCHEDULING
-- ==============================================================================

-- Pickup Slots (Capacity-aware scheduling)
CREATE TABLE IF NOT EXISTS pickup_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canteen_id UUID NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 15 CHECK (capacity > 0),
    reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT chk_slot_capacity CHECK (reserved_count <= capacity),
    CONSTRAINT chk_slot_time CHECK (ends_at > starts_at)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    canteen_id UUID NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL, -- e.g. CF-101
    order_type TEXT NOT NULL CHECK (order_type IN ('IMMEDIATE', 'SCHEDULED')),
    status TEXT NOT NULL DEFAULT 'PLACED' CHECK (status IN (
        'PENDING_PAYMENT',
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'COLLECTED',
        'CANCELLED',
        'REJECTED'
    )),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    taxes NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (taxes >= 0),
    fees NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (fees >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CASH_DUE')),
    pickup_slot_id UUID REFERENCES pickup_slots(id) ON DELETE SET NULL,
    requested_pickup_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    collected_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    item_name_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
    customization_data JSONB DEFAULT '{}'::jsonb
);

-- Order Events (Audit state machine trail)
CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. PAYMENTS & TRANSACTIONS
-- ==============================================================================

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('RAZORPAY', 'UPI_DIRECT', 'CASH_COUNTER', 'SIMULATOR')),
    provider_transaction_id TEXT,
    method TEXT NOT NULL, -- 'UPI', 'CARD', 'NETBANKING', 'CASH'
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payment Events & Webhook Reconciliation
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    provider_event_id TEXT UNIQUE,
    event_type TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    payload_reference JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. FEEDBACK & AUDIT LOGS
-- ==============================================================================

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    canteen_id UUID NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_canteens_college ON canteens(college_id);
CREATE INDEX IF NOT EXISTS idx_memberships_college_user ON memberships(college_id, user_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_canteen ON menu_items(canteen_id, is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_canteen_status ON orders(canteen_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_slots_canteen_time ON pickup_slots(canteen_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_college ON audit_logs(college_id, created_at DESC);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION current_user_role(p_college_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM memberships 
  WHERE user_id = auth.uid() AND college_id = p_college_id AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Public read for active colleges & canteens
CREATE POLICY colleges_public_read ON colleges FOR SELECT USING (true);
CREATE POLICY canteens_public_read ON canteens FOR SELECT USING (is_active = true);
CREATE POLICY menu_categories_read ON menu_categories FOR SELECT USING (is_active = true);
CREATE POLICY menu_items_read ON menu_items FOR SELECT USING (true);
CREATE POLICY pickup_slots_read ON pickup_slots FOR SELECT USING (is_active = true);

-- Profiles
CREATE POLICY profiles_user_read ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_user_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Student: Own orders & payments
CREATE POLICY orders_student_own ON orders FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM memberships m 
    WHERE m.user_id = auth.uid() 
      AND m.college_id = orders.college_id 
      AND m.role IN ('staff', 'admin')
  )
);

CREATE POLICY orders_student_insert ON orders FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY order_items_access ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (
      o.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM memberships m 
        WHERE m.user_id = auth.uid() 
          AND m.college_id = o.college_id 
          AND m.role IN ('staff', 'admin')
      )
    )
  )
);

CREATE POLICY payments_user_access ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o WHERE o.id = payments.order_id AND (
      o.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM memberships m 
        WHERE m.user_id = auth.uid() 
          AND m.college_id = o.college_id 
          AND m.role IN ('staff', 'admin')
      )
    )
  )
);

-- ==============================================================================
-- 8. INITIAL SEED DATA (Apex Institute of Technology - Green Leaf Canteen)
-- ==============================================================================

DO $$
DECLARE
    v_college_id UUID := '11111111-1111-1111-1111-111111111111';
    v_canteen_id UUID := '22222222-2222-2222-2222-222222222222';
    v_admin_id UUID   := '33333333-3333-3333-3333-333333333333';
    v_staff_id UUID   := '44444444-4444-4444-4444-444444444444';
    v_student_id UUID := '55555555-5555-5555-5555-555555555555';
    
    v_cat_breakfast UUID := 'aaaaaaaa-1111-0000-0000-000000000001';
    v_cat_lunch UUID     := 'aaaaaaaa-1111-0000-0000-000000000002';
    v_cat_beverages UUID := 'aaaaaaaa-1111-0000-0000-000000000003';
    v_cat_snacks UUID    := 'aaaaaaaa-1111-0000-0000-000000000004';

    v_item_dosa UUID     := 'bbbbbbbb-1111-0000-0000-000000000001';
    v_item_thali UUID    := 'bbbbbbbb-1111-0000-0000-000000000002';
    v_item_paneer UUID   := 'bbbbbbbb-1111-0000-0000-000000000003';
    v_item_chai UUID     := 'bbbbbbbb-1111-0000-0000-000000000004';
    v_item_samosa UUID   := 'bbbbbbbb-1111-0000-0000-000000000005';
    v_item_coldcoffee UUID := 'bbbbbbbb-1111-0000-0000-000000000006';
BEGIN
    -- College
    INSERT INTO colleges (id, name, slug, timezone)
    VALUES (v_college_id, 'Apex Institute of Technology', 'apex-tech', 'Asia/Kolkata')
    ON CONFLICT (id) DO NOTHING;

    -- Canteen
    INSERT INTO canteens (id, college_id, name, description)
    VALUES (v_canteen_id, v_college_id, 'Green Leaf Central Canteen', 'Main campus dining facility serving fresh, hygienic breakfast, lunch, and refreshments.')
    ON CONFLICT (id) DO NOTHING;

    -- Profiles
    INSERT INTO profiles (id, full_name, email, phone)
    VALUES 
        (v_admin_id, 'Dean Priya Menon', 'admin@apex.edu', '+91 98765 43210'),
        (v_staff_id, 'Chef Vikram Patel', 'staff@apex.edu', '+91 98765 43211'),
        (v_student_id, 'Aarav Sharma', 'student@apex.edu', '+91 98765 43212')
    ON CONFLICT (id) DO NOTHING;

    -- Memberships
    INSERT INTO memberships (college_id, user_id, canteen_id, role, status)
    VALUES 
        (v_college_id, v_admin_id, v_canteen_id, 'admin', 'active'),
        (v_college_id, v_staff_id, v_canteen_id, 'staff', 'active'),
        (v_college_id, v_student_id, v_canteen_id, 'student', 'active')
    ON CONFLICT (college_id, user_id) DO NOTHING;

    -- Menu Categories
    INSERT INTO menu_categories (id, canteen_id, name, description, sort_order)
    VALUES
        (v_cat_breakfast, v_canteen_id, 'Breakfast & South Indian', 'Fresh morning specials and griddled delicacies', 1),
        (v_cat_lunch, v_canteen_id, 'Lunch & Meals', 'Wholesome balanced campus meals and thalis', 2),
        (v_cat_snacks, v_canteen_id, 'Snacks & Quick Bites', 'Crispy, savory snacks for quick breaks', 3),
        (v_cat_beverages, v_canteen_id, 'Beverages & Coolers', 'Brewed tea, artisan coffee, and chilled refreshments', 4)
    ON CONFLICT (id) DO NOTHING;

    -- Menu Items
    INSERT INTO menu_items (id, canteen_id, category_id, name, description, price, image_path, dietary_tags, preparation_minutes, is_available)
    VALUES
        (v_item_dosa, v_canteen_id, v_cat_breakfast, 'Masala Dosa with Sambar & Chutney', 'Crispy golden crepe with spiced potato filling, served with piping hot lentil stew and coconut dip.', 65.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop', ARRAY['veg', 'gluten-free'], 8, true),
        (v_item_thali, v_canteen_id, v_cat_lunch, 'Campus Deluxe Thali', '2 Seasonal curries, Dal Tadka, Jeera Rice, 3 Phulkas, Salad, and Gulab Jamun.', 120.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop', ARRAY['veg', 'high-protein'], 12, true),
        (v_item_paneer, v_canteen_id, v_cat_lunch, 'Paneer Tikka Roll', 'Grilled cottage cheese wrapped in whole wheat flatbread with mint mayo and crisp onions.', 85.00, 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop', ARRAY['veg', 'high-protein'], 10, true),
        (v_item_samosa, v_canteen_id, v_cat_snacks, 'Crispy Samosa Duo', '2 Flaky golden pastry pockets stuffed with spiced peas and potatoes, served with tamarind chutney.', 35.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop', ARRAY['veg', 'vegan'], 5, true),
        (v_item_chai, v_canteen_id, v_cat_beverages, 'Masala Kadak Chai', 'Freshly brewed Assam tea leaves simmered with ginger, cardamom, and whole milk.', 20.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop', ARRAY['veg'], 4, true),
        (v_item_coldcoffee, v_canteen_id, v_cat_beverages, 'Signature Iced Frappe Cold Coffee', 'Rich dark roasted espresso blended with chilled milk and premium dark cocoa.', 50.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop', ARRAY['veg'], 5, true)
    ON CONFLICT (id) DO NOTHING;

    -- Inventory Records
    INSERT INTO inventory (menu_item_id, available_quantity, reserved_quantity, low_stock_threshold, tracking_mode)
    VALUES
        (v_item_dosa, 45, 0, 10, 'PREPARE_TO_ORDER'),
        (v_item_thali, 30, 2, 8, 'EXACT'),
        (v_item_paneer, 25, 1, 5, 'EXACT'),
        (v_item_samosa, 80, 4, 15, 'EXACT'),
        (v_item_chai, 150, 0, 20, 'PREPARE_TO_ORDER'),
        (v_item_coldcoffee, 60, 0, 10, 'EXACT')
    ON CONFLICT (menu_item_id) DO NOTHING;

END $$;
