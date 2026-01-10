# Supabase Database Setup Guide

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://vzyeplgnykmfppjanvaa.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Execute Database Schema

Copy and paste the following SQL code into the query editor and click **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create calculations table
CREATE TABLE IF NOT EXISTS calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculator_type TEXT NOT NULL,
  name TEXT,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comparison_groups table
CREATE TABLE IF NOT EXISTS comparison_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calculator_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comparison_items table  
CREATE TABLE IF NOT EXISTS comparison_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES comparison_groups(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES calculations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(calculator_type);
CREATE INDEX IF NOT EXISTS idx_calculations_favorite ON calculations(is_favorite);
CREATE INDEX IF NOT EXISTS idx_comparison_groups_user_id ON comparison_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_items_group_id ON comparison_items(group_id);

-- Enable Row Level Security (RLS)
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for calculations table

-- Users can view their own calculations
CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own calculations
CREATE POLICY "Users can insert own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own calculations
CREATE POLICY "Users can update own calculations"
  ON calculations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own calculations
CREATE POLICY "Users can delete own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for comparison_groups table

-- Users can view their own comparison groups
CREATE POLICY "Users can view own comparison groups"
  ON comparison_groups FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own comparison groups
CREATE POLICY "Users can insert own comparison groups"
  ON comparison_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comparison groups
CREATE POLICY "Users can update own comparison groups"
  ON comparison_groups FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comparison groups
CREATE POLICY "Users can delete own comparison groups"
  ON comparison_groups FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for comparison_items table

-- Users can view comparison items from their own groups
CREATE POLICY "Users can view own comparison items"
  ON comparison_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM comparison_groups
      WHERE comparison_groups.id = comparison_items.group_id
      AND comparison_groups.user_id = auth.uid()
    )
  );

-- Users can insert comparison items to their own groups
CREATE POLICY "Users can insert own comparison items"
  ON comparison_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comparison_groups
      WHERE comparison_groups.id = comparison_items.group_id
      AND comparison_groups.user_id = auth.uid()
    )
  );

-- Users can update comparison items in their own groups
CREATE POLICY "Users can update own comparison items"
  ON comparison_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM comparison_groups
      WHERE comparison_groups.id = comparison_items.group_id
      AND comparison_groups.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comparison_groups
      WHERE comparison_groups.id = comparison_items.group_id
      AND comparison_groups.user_id = auth.uid()
    )
  );

-- Users can delete comparison items from their own groups
CREATE POLICY "Users can delete own comparison items"
  ON comparison_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM comparison_groups
      WHERE comparison_groups.id = comparison_items.group_id
      AND comparison_groups.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculations table
CREATE TRIGGER update_calculations_updated_at
  BEFORE UPDATE ON calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Verify Tables Created

After running the query, verify the tables were created:

1. Go to **Table Editor** in the left sidebar
2. You should see three new tables:
   - `calculations`
   - `comparison_groups`
   - `comparison_items`

## Step 4: Enable Google OAuth (Optional)

1. Go to **Authentication** > **Providers**
2. Find **Google** and click **Enable**
3. Add your Google OAuth credentials
4. Add authorized redirect URL: `https://vzyeplgnykmfppjanvaa.supabase.co/auth/v1/callback`

## Step 5: Test the Setup

The database is now ready! You can test by:

1. Running `npm run dev` in your project
2. Visit http://localhost:3000/auth
3. Create a new account
4. Try saving a calculation from the mortgage calculator

## Database Schema Overview

### calculations table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `calculator_type`: TEXT (e.g., "mortgage", "401k")
- `name`: TEXT (Optional custom name)
- `inputs`: JSONB (All input values)
- `results`: JSONB (Calculated results)
- `is_favorite`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### comparison_groups table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `name`: TEXT (Name of comparison group)
- `calculator_type`: TEXT
- `created_at`: TIMESTAMP

### comparison_items table
- `id`: UUID (Primary Key)
- `group_id`: UUID (Foreign Key to comparison_groups)
- `calculation_id`: UUID (Foreign Key to calculations)
- `position`: INTEGER (Order in comparison)
- `created_at`: TIMESTAMP

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **RLS Policies**: Users can only access their own data
- **Foreign Keys**: Cascade deletes maintain data integrity
- **Indexes**: Optimized for common queries

## Next Steps

After setting up the database:
1. The authentication is already integrated
2. Save functionality will be added to calculators
3. Dashboard page will display saved calculations
4. Comparison feature will allow scenario analysis
