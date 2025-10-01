import React from 'react';
import { Link } from 'react-router-dom';

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
        <Link to="/settings" style={{ textDecoration: 'none', color: '#6b7280' }}>Settings</Link>
        <Link to="/billing" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500' }}>Billing</Link>
      </div>
    </nav>
  );
}

function Billing() {
  const plans = [
    {
      name: 'Basic',
      price: '$12.99',
      features: ['100 items', 'Recall alerts', 'PDF export', 'Email support']
    },
    {
      name: 'Plus',
      price: '$22.99',
      popular: true,
      features: ['500 items', 'All Basic features', 'Priority support', 'CSV import/export']
    },
    {
      name: 'Family',
      price: '$40.99',
      features: ['Unlimited items', 'All Plus features', 'Multi-user access', 'Premium support']
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navigation />
      
      <main style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Choose Your Plan
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px' }}>
            Secure your home inventory with KeepSafe
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {plans.map(plan => (
              <div
                key={plan.name}
                style={{
                  border: plan.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '32px',
                  backgroundColor: 'white',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 4px 12px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                  {plan.name}
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#2563eb', marginBottom: '24px' }}>
                  {plan.price}
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>/mo</span>
                </div>
                
                <ul style={{ textAlign: 'left', marginBottom: '24px', listStyle: 'none', padding: 0 }}>
                  {plan.features.map(feature => (
                    <li key={feature} style={{ fontSize: '14px', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  style={{
                    width: '100%',
                    backgroundColor: plan.popular ? '#2563eb' : '#f3f4f6',
                    color: plan.popular ? 'white' : '#374151',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'not-allowed',
                    minHeight: '44px'
                  }}
                >
                  Subscribe (Coming Soon)
                </button>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  When will subscriptions be available?
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  We're currently in beta. Subscriptions will launch soon.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  Can I try before I buy?
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Yes! You can use KeepSafe for free during our beta period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Billing;