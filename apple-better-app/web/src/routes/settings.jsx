import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

function Navigation() {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '700',
        fontSize: '18px',
        color: '#2563eb'
      }}>
        🛡️ KeepSafe
      </div>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#6b7280' }}>Home</Link>
        <Link to="/items" style={{ textDecoration: 'none', color: '#6b7280' }}>Items</Link>
        <Link to="/settings" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500' }}>Settings</Link>
        <Link to="/billing" style={{ textDecoration: 'none', color: '#6b7280' }}>Billing</Link>
      </div>
    </nav>
  );
}

function Settings({ onLogout }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [euSafetyEnabled, setEuSafetyEnabled] = useState(false);

  const handleExportCSV = async () => {
    try {
      const items = await api.getItems();
      const csv = [
        'Name,Brand,Model,Serial,Room,Category,Purchase Date,Price,Warranty (months)',
        ...items.map(item => 
          `"${item.name}","${item.brand || ''}","${item.model || ''}","${item.serial || ''}","${item.room || ''}","${item.category || ''}","${item.purchase_date || ''}","${item.purchase_price || ''}","${item.warranty_months || ''}"`
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keepsafe-items-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportBinder = async () => {
    try {
      const items = await api.getItems();
      
      // Group items by room
      const itemsByRoom = items.reduce((acc, item) => {
        const room = item.room || 'Uncategorized';
        if (!acc[room]) acc[room] = [];
        acc[room].push(item);
        return acc;
      }, {});

      // Create PDF content
      let pdfContent = `KeepSafe - Household Inventory Binder\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
      
      Object.entries(itemsByRoom).forEach(([room, roomItems]) => {
        pdfContent += `\n=== ${room} (${roomItems.length} items) ===\n\n`;
        roomItems.forEach(item => {
          pdfContent += `${item.name}\n`;
          if (item.brand) pdfContent += `  Brand: ${item.brand}\n`;
          if (item.model) pdfContent += `  Model: ${item.model}\n`;
          if (item.serial) pdfContent += `  Serial: ${item.serial}\n`;
          if (item.purchase_date) pdfContent += `  Purchase Date: ${item.purchase_date}\n`;
          if (item.purchase_price) pdfContent += `  Price: $${item.purchase_price}\n`;
          if (item.warranty_months) pdfContent += `  Warranty: ${item.warranty_months} months\n`;
          if (item.recall_match) pdfContent += `  ⚠️ RECALL ALERT\n`;
          pdfContent += '\n';
        });
      });

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keepsafe-binder-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
    } catch (error) {
      console.error('Binder export failed:', error);
    }
  };

  const handleExportAllData = async () => {
    try {
      const items = await api.getItems();
      const dataExport = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        itemCount: items.length,
        items: items
      };
      
      const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keepsafe-full-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Full export failed:', error);
    }
  };

  const handleDeleteAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      const items = await api.getItems();
      for (const item of items) {
        await api.deleteItem(item.id);
      }
      setShowDeleteConfirm(false);
      alert('All data has been deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete all data');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navigation />
      
      <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Settings</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Data Export</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              Export your inventory data in various formats
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportCSV}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Export CSV
              </button>
              <button
                onClick={handleExportBinder}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Export Binder
              </button>
              <button
                onClick={handleExportAllData}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Export All Data (JSON)
              </button>
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Data Management</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              Delete all your data permanently
            </p>
            <button
              onClick={handleDeleteAllData}
              style={{
                backgroundColor: showDeleteConfirm ? '#dc2626' : '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete All Data'}
            </button>
            {showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>EU Safety Gate</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              Enable EU Safety Gate recall checking (currently disabled by default)
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={euSafetyEnabled}
                onChange={(e) => setEuSafetyEnabled(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>Enable EU Safety Gate (Currently display-only)</span>
            </label>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>About</h3>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <p><strong>Data Sources:</strong></p>
              <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                <li><a href="https://www.cpsc.gov/Recalls" target="_blank" rel="noopener noreferrer">CPSC Recalls</a></li>
                <li><a href="https://recalls-rappels.canada.ca" target="_blank" rel="noopener noreferrer">Health Canada Recalls</a></li>
                <li><a href="https://ec.europa.eu/safety-gate-alerts" target="_blank" rel="noopener noreferrer">EU Safety Gate</a></li>
              </ul>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default Settings;