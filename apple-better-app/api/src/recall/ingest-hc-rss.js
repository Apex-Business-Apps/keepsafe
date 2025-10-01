import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'keepsafe',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function ingestHealthCanadaRecalls() {
  try {
    console.log('Starting Health Canada recall ingestion...');
    
    // Health Canada Consumer Product Recalls RSS feed
    const hcUrl = 'https://recalls-rappels.canada.ca/en/feed/recalls-rappels';
    
    const response = await fetch(hcUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlData = await response.text();
    
    // Parse XML
    const recalls = await new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Extract recall data
    const recallItems = recalls?.rss?.channel?.[0]?.item || [];
    console.log(`HC: parsed ${recallItems.length} recalls`);
    
    // Get all items from database
    const itemsResult = await pool.query('SELECT id, name, brand, model FROM items');
    const items = itemsResult.rows;
    
    let matchesFound = 0;
    
    // Check each item against recalls
    for (const item of items) {
      for (const recall of recallItems) {
        const title = recall.title?.[0] || '';
        const description = recall.description?.[0] || '';
        const link = recall.link?.[0] || '';
        
        // Simple brand/title matching
        const itemBrand = item.brand?.toLowerCase() || '';
        const itemModel = item.model?.toLowerCase() || '';
        const itemName = item.name?.toLowerCase() || '';
        
        const titleLower = title.toLowerCase();
        const descLower = description.toLowerCase();
        
        let isMatch = false;
        
        // Check if brand is mentioned in recall title
        if (itemBrand && titleLower.includes(itemBrand)) {
          isMatch = true;
        }
        
        // Check if model is mentioned
        if (itemModel && (titleLower.includes(itemModel) || descLower.includes(itemModel))) {
          isMatch = true;
        }
        
        // Check if item name is mentioned
        if (itemName && (titleLower.includes(itemName) || descLower.includes(itemName))) {
          isMatch = true;
        }
        
        if (isMatch) {
          // Update item with recall match
          await pool.query(
            'UPDATE items SET recall_match = TRUE, recall_url = $1, updated_at = NOW() WHERE id = $2',
            [link, item.id]
          );
          
          console.log(`Match found for item ${item.id} (${item.name}) with HC recall: ${title}`);
          matchesFound++;
          break; // One recall match per item is enough
        }
      }
    }
    
    console.log(`HC: processed ${items.length} items, found ${matchesFound} matches`);
    
  } catch (error) {
    console.error('Error ingesting Health Canada recalls:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestHealthCanadaRecalls();
}

export default ingestHealthCanadaRecalls;