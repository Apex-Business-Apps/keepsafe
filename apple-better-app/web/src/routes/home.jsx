import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

// Navigation component
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
        <Link to="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500' }}>
          Home
        </Link>
        <Link to="/items" style={{ textDecoration: 'none', color: '#6b7280' }}>
          Items
        </Link>
        <Link to="/settings" style={{ textDecoration: 'none', color: '#6b7280' }}>
          Settings
        </Link>
        <Link to="/billing" style={{ textDecoration: 'none', color: '#6b7280' }}>
          Billing
        </Link>
      </div>
    </nav>
  );
}

// Empty state component with coaching
function EmptyState({ onAddItem }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: '#f3f4f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        fontSize: '32px'
      }}>
        📦
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#111827'
      }}>
        Let's add your first item
      </h2>
      
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '32px',
        lineHeight: '1.5'
      }}>
        Start building your home inventory to track warranties, store receipts, and get recall alerts.
      </p>
      
      {/* Benefits list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '32px',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ fontSize: '14px', color: '#374151' }}>Get alerts for product recalls</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <span style={{ fontSize: '14px', color: '#374151' }}>Track warranty expiration dates</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px' }}>📄</span>
          <span style={{ fontSize: '14px', color: '#374151' }}>Export insurance binder PDFs</span>
        </div>
      </div>
      
      {/* Primary CTA */}
      <button
        onClick={onAddItem}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          minHeight: '44px',
          minWidth: '44px',
          transition: 'background-color 0.15s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
      >
        Add Your First Item
      </button>
    </div>
  );
}

// Recent items list component
function RecentItems({ items, onSearch, searchTerm, onFilter, filters }) {
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRoom = !filters.room || item.room === filters.room;
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesRecall = !filters.recall || item.recall_match === true;
    
    return matchesSearch && matchesRoom && matchesCategory && matchesRecall;
  });

  const rooms = [...new Set(items.map(item => item.room).filter(Boolean))];
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
          Recent Items ({filteredItems.length})
        </h2>
        <Link 
          to="/items"
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Add Item
        </Link>
      </div>

      {/* Search and filters */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={filters.room}
            onChange={(e) => onFilter({ ...filters, room: e.target.value })}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">All Rooms</option>
            {rooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => onFilter({ ...filters, category: e.target.value })}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={filters.recall}
              onChange={(e) => onFilter({ ...filters, recall: e.target.checked })}
            />
            Recall alerts only
          </label>
        </div>
      </div>

      {/* Items grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {item.recall_match && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#dc2626'
              }}>
                ⚠️ Recall Alert
              </div>
            )}
            
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#111827'
            }}>
              {item.name}
            </h3>
            
            {item.brand && (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                Brand: {item.brand}
              </p>
            )}
            
            {item.room && (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                Room: {item.room}
              </p>
            )}
            
            {item.warranty_months && (() => {
              const warrantyStatus = getWarrantyStatus(item);
              if (!warrantyStatus) {
                return (
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                    Warranty: {item.warranty_months} months
                  </p>
                );
              }
              
              const statusColor = warrantyStatus.status === 'critical' ? '#dc2626' :
                                 warrantyStatus.status === 'warning' ? '#d97706' :
                                 warrantyStatus.status === 'expired' ? '#6b7280' : '#059669';
              
              return (
                <p style={{ fontSize: '14px', color: statusColor, margin: '4px 0', fontWeight: '500' }}>
                  {warrantyStatus.status === 'expired' ? 'Warranty expired' :
                   warrantyStatus.status === 'critical' ? `⚠️ Warranty expires in ${warrantyStatus.daysLeft} days` :
                   warrantyStatus.status === 'warning' ? `⚠️ Warranty expires in ${warrantyStatus.daysLeft} days` :
                   `Warranty: ${item.warranty_months} months`}
                </p>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    room: '',
    category: '',
    recall: false
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    window.location.href = '/items';
  };

  // Calculate warranty status
  const getWarrantyStatus = (item) => {
    if (!item.purchase_date || !item.warranty_months) return null;
    
    const purchaseDate = new Date(item.purchase_date);
    const warrantyEnd = new Date(purchaseDate);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + item.warranty_months);
    
    const now = new Date();
    const daysLeft = Math.ceil((warrantyEnd - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', daysLeft: 0 };
    if (daysLeft <= 7) return { status: 'critical', daysLeft };
    if (daysLeft <= 30) return { status: 'warning', daysLeft };
    return { status: 'active', daysLeft };
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navigation />
      
      <main>
        {items.length === 0 ? (
          <EmptyState onAddItem={handleAddItem} />
        ) : (
          <RecentItems
            items={items}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            onFilter={setFilters}
            filters={filters}
          />
        )}
      </main>
    </div>
  );
}

export default Home;