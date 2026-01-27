
CREATE TABLE insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  título TEXT NOT NULL,
  descrição TEXT NOT NULL,
  impacto TEXT NOT NULL,
  ação_sugerida TEXT NOT NULL,
  economia_potencial REAL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  is_applied BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insights_created_at ON insights(created_at DESC);
CREATE INDEX idx_insights_tipo ON insights(tipo);
CREATE INDEX idx_insights_impacto ON insights(impacto);
