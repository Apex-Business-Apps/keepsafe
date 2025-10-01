import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { z } from 'zod';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 8080;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'keepsafe',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Rate limiting (basic)
const requests = new Map();
const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const userRequests = requests.get(ip);
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  validRequests.push(now);
  requests.set(ip, validRequests);
  next();
};

app.use(rateLimit);

// Validation schemas
const itemSchema = z.object({
  name: z.string().trim().min(1).max(255),
  brand: z.string().trim().max(100).optional(),
  model: z.string().trim().max(100).optional(),
  serial: z.string().trim().max(100).optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().positive().optional(),
  barcode: z.string().trim().max(50).optional(),
  room: z.string().trim().max(50).optional(),
  category: z.string().trim().max(50).optional(),
  receipt_url: z.string().url().optional(),
  photos: z.array(z.string()).default([]),
  warranty_months: z.number().int().min(0).max(240).default(12)
});

// Auth middleware (demo stub)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Demo auth
app.post('/auth/demo', (req, res) => {
  const token = jwt.sign(
    { userId: 'demo-user', email: 'demo@example.com' }, 
    process.env.JWT_SECRET || 'demo-secret',
    { expiresIn: '7d' }
  );
  res.json({ token });
});

// Get items
app.get('/items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM items ORDER BY created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create item
app.post('/items', authenticateToken, async (req, res) => {
  try {
    const validatedData = itemSchema.parse(req.body);
    
    const result = await pool.query(`
      INSERT INTO items (
        name, brand, model, serial, purchase_date, purchase_price, 
        barcode, room, category, receipt_url, photos, warranty_months
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      validatedData.name,
      validatedData.brand || null,
      validatedData.model || null, 
      validatedData.serial || null,
      validatedData.purchase_date || null,
      validatedData.purchase_price || null,
      validatedData.barcode || null,
      validatedData.room || null,
      validatedData.category || null,
      validatedData.receipt_url || null,
      JSON.stringify(validatedData.photos),
      validatedData.warranty_months
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update item
app.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = itemSchema.partial().parse(req.body);
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'photos') {
          fields.push(`${key} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE items SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete item
app.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});