# Yacht Management Dashboard Implementation Plan

## Project Overview
Create an admin dashboard for managing yachts (add, remove, edit) using Supabase as the backend.

## Supabase Configuration
- **Project Name**: zestsite-admin
- **Project ID**: ixfaxsfjbdxqirybwwtu
- **Region**: eu-central-1
- **Publishable Key**: sb_publishable_fKSUFSQvMTpYd6ZepSM1jQ_rVbyRpgT
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZmF4c2ZqYmR4cWlyeWJ3d3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDk1MTIsImV4cCI6MjA5NjU4NTUxMn0.ZVIBqKTslZvSuHWIk0RxNcAe5DvOXISiZpkCQaHkxZQ

## Phase 1: Database Schema Setup

### 1.1 Create Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  TO anon, authenticated
  USING (auth.uid()::text = id::text);

-- Policy for admin to read all users
CREATE POLICY "Admin can read all users" ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Policy for admin to insert users
CREATE POLICY "Admin can insert users" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Policy for admin to update users
CREATE POLICY "Admin can update users" ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Policy for admin to delete users
CREATE POLICY "Admin can delete users" ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );
```

### 1.2 Create Yachts Table
```sql
CREATE TABLE yachts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT,
  capacity INTEGER NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  minimum_booking_hours INTEGER DEFAULT 2,
  offers TEXT[] DEFAULT '{}',
  location TEXT DEFAULT 'Dubai Harbour',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON yachts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for authenticated write access (admin only)
CREATE POLICY "Admin write access" ON yachts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );
```

### 1.3 Create Add-ons Table
```sql
CREATE TABLE add_ons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON add_ons
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated write access (admin only)
CREATE POLICY "Admin write access" ON add_ons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );
```

### 1.4 Create Updated_at Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_yachts_updated_at
  BEFORE UPDATE ON yachts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Phase 2: Supabase Client Setup

### 2.1 Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2.2 Create Supabase Client
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2.3 Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ixfaxsfjbdxqirybwwtu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZmF4c2ZqYmR4cWlyeWJ3d3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDk1MTIsImV4cCI6MjA5NjU4NTUxMn0.ZVIBqKTslZvSuHWIk0RxNcAe5DvOXISiZpkCQaHkxZQ
```

## Phase 3: Dashboard UI Components

### 3.1 Dashboard Layout
Create `app/dashboard/page.tsx`:
- Sidebar navigation
- Main content area
- Header with user info
- Protected route (requires admin authentication)

### 3.2 Yachts List View
Create `components/dashboard/yachts-list.tsx`:
- Table view of all yachts
- Search and filter functionality
- Actions: Edit, Delete
- Pagination

### 3.3 Yacht Form (Add/Edit)
Create `components/dashboard/yacht-form.tsx`:
- Form fields matching database schema
- Image upload (URL input or file upload)
- Offers management (add/remove offers)
- Features management (add/remove features)
- Validation

### 3.4 Add-ons Management
Create `components/dashboard/add-ons-manager.tsx`:
- List view of add-ons
- Add/Edit add-on form
- Delete functionality

## Phase 4: CRUD Operations

### 4.1 Yacht Operations
Create `lib/yachts.ts`:
```typescript
// Fetch all yachts
export async function getYachts() {
  const { data, error } = await supabase.from('yachts').select('*')
  return { data, error }
}

// Fetch single yacht
export async function getYacht(id: string) {
  const { data, error } = await supabase.from('yachts').select('*').eq('id', id).single()
  return { data, error }
}

// Create yacht
export async function createYacht(yacht: YachtInput) {
  const { data, error } = await supabase.from('yachts').insert(yacht).select().single()
  return { data, error }
}

// Update yacht
export async function updateYacht(id: string, yacht: Partial<YachtInput>) {
  const { data, error } = await supabase.from('yachts').update(yacht).eq('id', id).select().single()
  return { data, error }
}

// Delete yacht
export async function deleteYacht(id: string) {
  const { error } = await supabase.from('yachts').delete().eq('id', id)
  return { error }
}
```

### 4.2 Add-on Operations
Create `lib/add-ons.ts`:
```typescript
// Fetch all add-ons
export async function getAddOns() {
  const { data, error } = await supabase.from('add_ons').select('*')
  return { data, error }
}

// Create add-on
export async function createAddOn(addOn: AddOnInput) {
  const { data, error } = await supabase.from('add_ons').insert(addOn).select().single()
  return { data, error }
}

// Update add-on
export async function updateAddOn(id: string, addOn: Partial<AddOnInput>) {
  const { data, error } = await supabase.from('add_ons').update(addOn).eq('id', id).select().single()
  return { data, error }
}

// Delete add-on
export async function deleteAddOn(id: string) {
  const { error } = await supabase.from('add_ons').delete().eq('id', id)
  return { error }
}
```

## Phase 5: Authentication (Required)

### 5.1 Login Page
Create `app/login/page.tsx`:
- Login form with email and password
- Authenticate against users table
- Error handling
- Redirect to /dashboard on success
- Link to register page (shows "Coming Soon")

### 5.2 Register Page
Create `app/register/page.tsx`:
- Simple page showing "Registration Coming Soon"
- Link back to login page

### 5.3 Auth Context
Create `lib/auth-context.tsx`:
- Manage user authentication state
- Store user session
- Provide login/logout functions
- Check admin role

### 5.4 Dashboard Protection
Create middleware or layout to protect /dashboard:
- Check if user is authenticated
- Check if user has admin role
- Redirect to login if not authenticated or not admin

## Phase 6: Integration with Existing Frontend

### 6.1 Update Main App
Replace mock data in `app/page.tsx` with Supabase fetch:
```typescript
const { data: yachts } = await getYachts()
```

### 6.2 Update Types
Update TypeScript interfaces to match database schema:
```typescript
interface Yacht {
  id: string
  name: string
  type: string
  image: string | null
  capacity: number
  hourly_rate: number
  rating: number
  reviews: number
  minimum_booking_hours: number
  offers: string[]
  location: string
  features: string[]
  created_at: string
  updated_at: string
}
```

## Phase 7: Testing & Deployment

### 7.1 Testing
- Test CRUD operations
- Test form validation
- Test error handling
- Test authentication flow

### 7.2 Deployment
- Deploy to Vercel
- Set environment variables
- Test production database connection

## Implementation Order

1. **Phase 1**: Database Schema Setup (use Supabase MCP to apply migrations)
   - Create users table with RLS policies
   - Create yachts table with admin-only write access
   - Create add-ons table with admin-only write access
   - Create updated_at trigger
2. **Phase 2**: Supabase Client Setup (install dependencies, create client)
3. **Phase 3**: Dashboard UI Components (create layout, list view, forms)
   - Create protected /dashboard route
4. **Phase 4**: CRUD Operations (create API functions)
5. **Phase 5**: Authentication (required)
   - Create login page (authenticate against users table)
   - Create register page (shows "Coming Soon")
   - Create auth context
   - Protect dashboard routes with admin check
6. **Phase 6**: Integration with Existing Frontend (replace mock data)
7. **Phase 7**: Testing & Deployment

## Notes

- Use Supabase MCP server to apply migrations and manage database
- Keep the dashboard simple and focused on yacht management
- Reuse existing UI components from the main app where possible
- Implement proper error handling throughout
- Consider adding image upload functionality (using Supabase Storage)
- Add loading states for better UX
- Implement confirmation dialogs for delete operations

## Data Migration

### Migrate Existing Mock Data
Create a migration script to insert the 6 existing yachts from mock data into Supabase:
```sql
INSERT INTO yachts (name, type, capacity, hourly_rate, rating, reviews, minimum_booking_hours, offers) VALUES
('GHOST 72ft', 'Luxury Yacht', 35, 435, 4.9, 128, 2, ARRAY['Free 1 Hour Jet Ski Ride']),
('Infinity Catamaran 60ft', 'Catamaran', 15, 1088, 4.8, 95, 2, ARRAY[]::text[]),
('Majesty 56ft', 'Luxury Yacht', 22, 408, 4.7, 67, 3, ARRAY[]::text[]),
('Kona 110 ft', 'Luxury Yacht', 80, 1306, 4.9, 112, 2, ARRAY[]::text[]),
('48 Feet Majesty', 'Luxury Yacht', 12, 190, 5.0, 156, 2, ARRAY[]::text[]),
('Astra 76ft', 'Luxury Yacht', 45, 680, 4.6, 78, 3, ARRAY[]::text[]);
```

### Migrate Add-ons
```sql
INSERT INTO add_ons (name, price, description) VALUES
('Catering Package', 150, 'Premium catering service'),
('Jet Ski Extension', 100, 'Additional jet ski rental'),
('Fishing Equipment', 50, 'Full fishing gear set'),
('Photography Service', 200, 'Professional photographer');
```
