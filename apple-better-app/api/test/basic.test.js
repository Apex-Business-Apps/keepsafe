import fetch from 'node-fetch';
import assert from 'assert';

const API_BASE = 'http://localhost:8080';

async function runTests() {
  console.log('Running basic API tests...');
  
  try {
    // Test 1: Health check
    console.log('Test 1: Health check');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    assert.strictEqual(healthData.ok, true);
    console.log('✓ Health check passed');
    
    // Test 2: Demo auth
    console.log('Test 2: Demo authentication');
    const authResponse = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const authData = await authResponse.json();
    assert(authData.token, 'Token should be present');
    console.log('✓ Auth test passed');
    
    const token = authData.token;
    
    // Test 3: Create item
    console.log('Test 3: Create item');
    const createResponse = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Item',
        brand: 'Test Brand',
        category: 'Electronics',
        warranty_months: 24
      })
    });
    const createData = await createResponse.json();
    assert(createData.id, 'Item should have an ID');
    assert.strictEqual(createData.name, 'Test Item');
    console.log('✓ Create item test passed');
    
    const itemId = createData.id;
    
    // Test 4: Get items
    console.log('Test 4: Get items');
    const getResponse = await fetch(`${API_BASE}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const items = await getResponse.json();
    assert(Array.isArray(items), 'Should return array of items');
    assert(items.length > 0, 'Should have at least one item');
    console.log('✓ Get items test passed');
    
    // Test 5: Update item
    console.log('Test 5: Update item');
    const updateResponse = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        warranty_months: 12
      })
    });
    const updateData = await updateResponse.json();
    assert.strictEqual(updateData.warranty_months, 12);
    console.log('✓ Update item test passed');
    
    // Test 6: Delete item
    console.log('Test 6: Delete item');
    const deleteResponse = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.strictEqual(deleteResponse.status, 200);
    console.log('✓ Delete item test passed');
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export default runTests;