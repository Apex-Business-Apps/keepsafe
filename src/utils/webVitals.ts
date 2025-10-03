// Core Web Vitals logging for performance monitoring
// Thresholds: LCP < 2.5s (good), INP < 200ms (good), CLS < 0.1 (good)

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  if (name === 'LCP') {
    return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
  }
  if (name === 'INP') {
    return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
  }
  if (name === 'CLS') {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
  }
  return 'good';
}

function logMetric(metric: WebVitalsMetric) {
  const { name, value, rating } = metric;
  const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
  
  console.log(
    `%c[Web Vitals] ${name}: ${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'} (${rating})`,
    `color: ${color}; font-weight: bold;`
  );

  // Send to analytics (if in production)
  if (import.meta.env.PROD) {
    // Track metric via events endpoint
    fetch('https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'web_vitals',
        props: { metric: name, value, rating },
      }),
    }).catch(() => {
      // Silently fail - don't block UI
    });
  }
}

export function initWebVitals() {
  // Only run in browser and dev mode (for emphasis during development)
  if (typeof window === 'undefined' || !import.meta.env.DEV) {
    return;
  }

  console.log('%c[Web Vitals] Monitoring started', 'color: #8b5cf6; font-weight: bold;');
  console.log('%cTargets: LCP < 2.5s, INP < 200ms, CLS < 0.1', 'color: #8b5cf6;');

  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
    const value = lastEntry.renderTime || lastEntry.loadTime || 0;
    
    logMetric({
      name: 'LCP',
      value,
      rating: getRating('LCP', value),
    });
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observer not supported');
  }

  // Interaction to Next Paint (INP) - using first-input as proxy
  const inpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const fidEntry = entry as PerformanceEventTiming;
      const value = fidEntry.processingStart - fidEntry.startTime;
      
      logMetric({
        name: 'INP',
        value,
        rating: getRating('INP', value),
      });
    });
  });

  try {
    inpObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('INP observer not supported');
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value || 0;
      }
    });

    logMetric({
      name: 'CLS',
      value: clsValue,
      rating: getRating('CLS', clsValue),
    });
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS observer not supported');
  }
}
