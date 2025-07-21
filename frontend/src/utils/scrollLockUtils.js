/**
 * Scroll utilities for basic scrollbar width calculation
 * Used for responsive design calculations
 */

let scrollbarWidth = 0;

/**
 * Calculate scrollbar width for responsive design
 * @returns {number} Scrollbar width in pixels
 */
function getScrollbarWidth() {
  if (scrollbarWidth !== 0) return scrollbarWidth;
  
  // Create a temporary div to measure scrollbar width
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar'; // Needed for WinJS apps
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  
  return scrollbarWidth;
}

/**
 * Initialize scrollbar width calculation
 * Call this once when the app starts
 */
export function initScrollbarCompensation() {
  // Pre-calculate scrollbar width
  getScrollbarWidth();
  
  // Add CSS variables for scrollbar width (for future use)
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  
  console.log('Scrollbar width calculated:', scrollbarWidth);
}