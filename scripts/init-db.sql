-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create widgets table for dashboard configuration
CREATE TABLE IF NOT EXISTS widgets (
  id SERIAL PRIMARY KEY,
  widget_type VARCHAR(50) NOT NULL,
  position INT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_widgets_position ON widgets(position);
