/**
 * Scroll lock utilities for managing body scroll and scrollbar compensation
 * Prevents layout shifts when modals are opened/closed
 */

let originalBodyPadding = '';
let originalBodyOverflow = '';
let scrollbarWidth = 0;

/**
 * Calculate scrollbar width for compensation
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
 * Lock body scroll and compensate for scrollbar disappearance
 */
export function lockBodyScroll() {
  if (document.body.style.overflow === 'hidden') return; // Already locked
  
  // Store original values
  originalBodyPadding = document.body.style.paddingRight;
  originalBodyOverflow = document.body.style.overflow;
  
  // Calculate and apply scrollbar compensation
  const scrollbarWidthPx = getScrollbarWidth();
  if (scrollbarWidthPx > 0) {
    const currentPadding = parseInt(window.getComputedStyle(document.body).paddingRight, 10) || 0;
    document.body.style.paddingRight = `${currentPadding + scrollbarWidthPx}px`;
  }
  
  // Lock scroll
  document.body.style.overflow = 'hidden';
  document.body.classList.add('modal-open');
}

/**
 * Unlock body scroll and restore original padding
 */
export function unlockBodyScroll() {
  // Restore original styles
  document.body.style.paddingRight = originalBodyPadding;
  document.body.style.overflow = originalBodyOverflow;
  document.body.classList.remove('modal-open');
}

/**
 * Initialize scrollbar compensation system
 * Call this once when the app starts
 */
export function initScrollbarCompensation() {
  // Pre-calculate scrollbar width
  getScrollbarWidth();
  
  // Add CSS variables for scrollbar width
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  
  // Ensure body has initial styles
  if (!document.body.style.paddingRight) {
    document.body.style.paddingRight = '0px';
  }
  
  console.log('Scrollbar compensation initialized. Scrollbar width:', scrollbarWidth);
}

/**
 * Check if body scroll is currently locked
 * @returns {boolean} True if scroll is locked
 */
export function isBodyScrollLocked() {
  return document.body.style.overflow === 'hidden' || document.body.classList.contains('modal-open');
}

/**
 * Toggle body scroll lock
 * @param {boolean} lock - Whether to lock (true) or unlock (false) scroll
 */
export function toggleBodyScrollLock(lock) {
  if (lock) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
  }
}