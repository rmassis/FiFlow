
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  confidence REAL DEFAULT 0,
  needs_review BOOLEAN DEFAULT 0,
  imported_from TEXT,
  imported_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
