
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT,
  recurrence TEXT NOT NULL,
  notify_at_50 BOOLEAN DEFAULT 0,
  notify_at_75 BOOLEAN DEFAULT 0,
  notify_at_90 BOOLEAN DEFAULT 0,
  notify_on_exceed BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_type ON goals(type);
CREATE INDEX idx_goals_dates ON goals(start_date, end_date);
