import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'keepsafe',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Rate limiting helper - 1 request per second
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ingestEUSafetyGateRecalls() {
  console.log('Starting EU Safety Gate recall ingestion...');

  // Check if EU Safety Gate is enabled
  const euSafetyEnabled = process.env.EU_SAFETY === 'true';
  
  if (!euSafetyEnabled) {
    console.log('EU Safety Gate ingestion is disabled (EU_SAFETY=false)');
    console.log('To enable, set EU_SAFETY=true in your .env file');
    return;
  }

  try {
    // EU Safety Gate official alerts feed
    const EU_SAFETY_GATE_URL = 'https://ec.europa.eu/consumers/consumers_safety/safety_products/rapex/alerts/repository/content/pages/rapex/reports/rss.xml';
    
    console.log('Fetching EU Safety Gate alerts...');
    
    // Fetch with rate limiting
    const response = await fetch(EU_SAFETY_GATE_URL, {
      headers: {
        'User-Agent': 'KeepSafe-Recall-Checker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`EU Safety Gate API returned ${response.status}`);
    }

    const xmlData = await response.text();
    const parsed = await parseStringPromise(xmlData);

    const alerts = parsed?.rss?.channel?.[0]?.item || [];
    console.log(`EU: Fetched ${alerts.length} alerts`);

    // Get existing items to check for matches
    const itemsResult = await pool.query('SELECT id, brand, model, name FROM items WHERE brand IS NOT NULL');
    const items = itemsResult.rows;

    let matchCount = 0;

    // Process each alert with rate limiting
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];
      
      // Extract alert details
      const title = alert.title?.[0] || '';
      const description = alert.description?.[0] || '';
      const link = alert.link?.[0] || '';
      const pubDate = alert.pubDate?.[0] || '';

      // Simple brand/product matching logic
      // Look for brand and model mentions in title and description
      const alertText = `${title} ${description}`.toLowerCase();

      for (const item of items) {
        const brand = item.brand?.toLowerCase() || '';
        const model = item.model?.toLowerCase() || '';
        const name = item.name?.toLowerCase() || '';

        // Check if brand and model appear in alert
        const brandMatch = brand && alertText.includes(brand);
        const modelMatch = model && alertText.includes(model);
        const nameMatch = name && alertText.includes(name);

        if ((brandMatch && modelMatch) || (brandMatch && nameMatch)) {
          console.log(`  ⚠️  Match found: ${item.name} (${item.brand} ${item.model})`);
          console.log(`      Alert: ${title}`);
          console.log(`      Link: ${link}`);

          // Update item with recall information
          await pool.query(
            'UPDATE items SET recall_match = true, recall_url = $1 WHERE id = $2',
            [link, item.id]
          );

          matchCount++;
        }
      }

      // Rate limiting: 1 request per second
      if (i < alerts.length - 1) {
        await delay(1000);
      }
    }

    console.log(`EU Safety Gate ingestion complete. ${matchCount} matches found.`);

  } catch (error) {
    console.error('EU Safety Gate ingestion error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestEUSafetyGateRecalls().catch(console.error);
}

export default ingestEUSafetyGateRecalls;
