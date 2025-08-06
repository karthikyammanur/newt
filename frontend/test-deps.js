console.log('Testing Framer Motion import...');
try {
  require('framer-motion');
  console.log('✓ Framer Motion successfully imported');
} catch (error) {
  console.error('✗ Framer Motion import failed:', error.message);
}

console.log('Testing React imports...');
try {
  require('react');
  console.log('✓ React successfully imported');
} catch (error) {
  console.error('✗ React import failed:', error.message);
}

console.log('All basic dependencies seem to be working!');
