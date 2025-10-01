#!/usr/bin/env node
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'keepsafe',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading schema file...');
    const schema = fs.readFileSync('src/schema.sql', 'utf8');
    
    console.log('Executing schema...');
    await client.query(schema);
    
    console.log('✓ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
