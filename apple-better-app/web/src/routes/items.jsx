import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

// Check for BarcodeDetector support
const hasBarcodeDetector = 'BarcodeDetector' in window;
console.log('BarcodeDetector support:', hasBarcodeDetector ? 'Available' : 'Not available - will use ZXing fallback');

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
        <Link to="/" style={{ textDecoration: 'none', color: '#6b7280' }}>
          Home
        </Link>
        <Link to="/items" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500' }}>
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

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '16px',
      backgroundColor: type === 'error' ? '#dc2626' : '#059669',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '400px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            marginLeft: '12px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Scanner component with fallback
function Scanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (hasBarcodeDetector) {
        startBarcodeDetection(stream);
      } else {
        // Use ZXing fallback
        console.log('Using ZXing fallback for barcode detection');
        startZXingDetection(stream);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access required for scanning. Please type the barcode manually.');
      setShowManualInput(true);
    }
  };

  const startBarcodeDetection = (stream) => {
    const detector = new BarcodeDetector();
    const video = videoRef.current;
    
    const detectBarcodes = async () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0) {
            onResult(barcodes[0].rawValue);
            return;
          }
        } catch (err) {
          console.error('Barcode detection error:', err);
        }
      }
      requestAnimationFrame(detectBarcodes);
    };

    video.addEventListener('loadedmetadata', () => {
      detectBarcodes();
    });
  };

  const startZXingDetection = async (stream) => {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      const codeReader = new BrowserMultiFormatReader();
      const video = videoRef.current;

      const detectCode = async () => {
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          try {
            const result = await codeReader.decodeFromVideoElement(video);
            if (result) {
              console.log('ZXing detected:', result.getText());
              onResult(result.getText());
              return;
            }
          } catch (err) {
            // No code found in this frame, continue scanning
          }
        }
        requestAnimationFrame(detectCode);
      };

      video.addEventListener('loadedmetadata', () => {
        detectCode();
      });
    } catch (error) {
      console.error('ZXing initialization failed:', error);
      setError('Barcode scanning not available. Please type the barcode manually.');
      setShowManualInput(true);
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onResult(manualCode.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Scan Barcode</h3>
        
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {!showManualInput && (
          <>
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '16px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid #2563eb',
                width: '200px',
                height: '100px',
                borderRadius: '8px'
              }} />
            </div>
            
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Position the barcode within the frame
            </p>
          </>
        )}

        {showManualInput && (
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Enter barcode manually"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            />
            <button
              onClick={handleManualSubmit}
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
              Use This Code
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {!showManualInput && (
            <button
              onClick={() => setShowManualInput(true)}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Type code instead
            </button>
          )}
          
          <button
            onClick={onClose}
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Form field component with inline validation
function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '4px'
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{
          color: '#dc2626',
          fontSize: '12px',
          marginTop: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

// Item form component with progressive disclosure
function ItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serial: '',
    purchase_date: '',
    purchase_price: '',
    barcode: '',
    room: '',
    category: '',
    receipt_url: '',
    warranty_months: 12,
    ...item
  });
  
  const [errors, setErrors] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [saving, setSaving] = useState(false);

  // Predefined options
  const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Garage', 'Office', 'Bathroom'];
  const categories = ['Electronics', 'Appliances', 'Furniture', 'Clothing', 'Tools', 'Other'];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.length > 255) {
          newErrors.name = 'Name must be less than 255 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'purchase_price':
        if (value && (isNaN(value) || parseFloat(value) <= 0)) {
          newErrors.purchase_price = 'Price must be a positive number';
        } else {
          delete newErrors.purchase_price;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleScanResult = (barcode) => {
    setFormData(prev => ({ ...prev, barcode }));
    setShowScanner(false);
    
    // In a real app, you'd look up product details by barcode here
    console.log('Scanned barcode:', barcode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    validateField('name', formData.name);
    
    if (Object.keys(errors).length > 0 || !formData.name.trim()) {
      return;
    }

    setSaving(true);
    
    try {
      const submitData = { ...formData };
      if (submitData.purchase_price) {
        submitData.purchase_price = parseFloat(submitData.purchase_price);
      }
      
      await onSave(submitData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Progressive disclosure: Start with just name and photo/scan */}
            <FormField label="Item Name *" error={errors.name}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={(e) => validateField('name', e.target.value)}
                placeholder="e.g., Samsung TV"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </FormField>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                📷 Scan Barcode
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                📸 Add Photo
              </button>
            </div>

            {/* Show "More details" link */}
            {!showDetails && (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                style={{
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  textDecoration: 'underline'
                }}
              >
                + More details
              </button>
            )}

            {/* Progressive disclosure: Additional fields */}
            {showDetails && (
              <>
                <FormField label="Brand">
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="e.g., Samsung"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </FormField>

                <FormField label="Model">
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="e.g., UN55TU8000"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </FormField>

                <FormField label="Serial Number">
                  <input
                    type="text"
                    value={formData.serial}
                    onChange={(e) => handleChange('serial', e.target.value)}
                    placeholder="Serial number"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </FormField>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <FormField label="Room">
                    <select
                      value={formData.room}
                      onChange={(e) => handleChange('room', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select room</option>
                      {rooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Category">
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <FormField label="Purchase Date">
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleChange('purchase_date', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </FormField>

                  <FormField label="Purchase Price" error={errors.purchase_price}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchase_price}
                      onChange={(e) => handleChange('purchase_price', e.target.value)}
                      onBlur={(e) => validateField('purchase_price', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.purchase_price ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </FormField>
                </div>

                <FormField label="Warranty (months)">
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={formData.warranty_months}
                    onChange={(e) => handleChange('warranty_months', parseInt(e.target.value) || 12)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </FormField>

                {formData.barcode && (
                  <FormField label="Barcode">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => handleChange('barcode', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </FormField>
                )}
              </>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  minHeight: '44px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || Object.keys(errors).length > 0 || !formData.name.trim()}
                style={{
                  flex: 1,
                  backgroundColor: saving ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  minHeight: '44px'
                }}
              >
                {saving ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showScanner && (
        <Scanner
          onResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (error) {
      showToast('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem) {
        await api.updateItem(editingItem.id, itemData);
        showToast('Item updated successfully');
      } else {
        await api.createItem(itemData);
        showToast('Item added successfully');
      }
      
      setShowForm(false);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      showToast(error.message || 'Failed to save item', 'error');
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      await api.deleteItem(item.id);
      setLastDeleted(item);
      showToast(
        <div>
          Item deleted successfully.{' '}
          <button
            onClick={() => handleUndoDelete(item)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Undo
          </button>
        </div>
      );
      loadItems();
    } catch (error) {
      showToast(error.message || 'Failed to delete item', 'error');
    }
  };

  const handleUndoDelete = async (item) => {
    try {
      const { id, created_at, updated_at, ...itemData } = item;
      await api.createItem(itemData);
      setToast(null);
      showToast('Item restored successfully');
      loadItems();
    } catch (error) {
      showToast('Failed to restore item', 'error');
    }
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
        <div style={{ padding: '48px', textAlign: 'center' }}>Loading items...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navigation />
      
      <main style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Items ({items.length})
          </h1>
          
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#6b7280'
          }}>
            <p>No items yet. Add your first item to get started!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '16px'
          }}>
            {items.map(item => {
              const warranty = getWarrantyStatus(item);
              
              return (
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
                  {/* Recall alert */}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚠️</span>
                        <span style={{ fontWeight: '600' }}>Recall Alert</span>
                      </div>
                      {item.recall_url && (
                        <div style={{ marginTop: '4px' }}>
                          <a
                            href={item.recall_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#dc2626', textDecoration: 'underline' }}
                          >
                            View official notice
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warranty status */}
                  {warranty && (
                    <div style={{
                      backgroundColor: warranty.status === 'critical' ? '#fef2f2' : 
                                      warranty.status === 'warning' ? '#fef3c7' : '#f0fdf4',
                      border: `1px solid ${warranty.status === 'critical' ? '#fecaca' : 
                                           warranty.status === 'warning' ? '#fcd34d' : '#bbf7d0'}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: warranty.status === 'critical' ? '#dc2626' : 
                             warranty.status === 'warning' ? '#d97706' : '#059669'
                    }}>
                      {warranty.status === 'expired' ? 'Warranty expired' :
                       `Warranty expires in ${warranty.daysLeft} days`}
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

                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    {item.brand && <div>Brand: {item.brand}</div>}
                    {item.model && <div>Model: {item.model}</div>}
                    {item.room && <div>Room: {item.room}</div>}
                    {item.category && <div>Category: {item.category}</div>}
                    {item.purchase_price && <div>Price: ${item.purchase_price}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showForm && (
        <ItemForm
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Items;