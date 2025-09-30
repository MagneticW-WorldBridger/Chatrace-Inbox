import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'

// Import and initialize Woodstock components IMMEDIATELY
import WoodstockComponents from './components/chat/WoodstockComponents.js'
import WoodstockMagentoCarousel from './components/chat/WoodstockMagentoCarousel.js'

// CRITICAL: Initialize components IMMEDIATELY - don't wait for DOM
console.log('🔥 INITIALIZING WOODSTOCK COMPONENTS NOW...');

// Force initialization
if (typeof window !== 'undefined') {
  // Initialize WoodstockComponents
  if (!window.WoodstockComponents) {
    window.WoodstockComponents = new WoodstockComponents();
    console.log('✅ WoodstockComponents initialized and available globally');
  }
  
  // Initialize WoodstockMagentoCarousel
  if (!window.WoodstockMagentoCarousel) {
    window.WoodstockMagentoCarousel = new WoodstockMagentoCarousel();
    console.log('✅ WoodstockMagentoCarousel initialized and available globally');
  }
  
  // Ensure Swiffy Slider is loaded
  window.addEventListener('load', () => {
    if (window.swiffyslider) {
      console.log('✅ Swiffy Slider is available');
    } else {
      console.warn('⚠️ Swiffy Slider not loaded, carousels may not work');
    }
  });
}

console.log('🎨 Woodstock HTML Enhancement System Ready - Components Available Immediately');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)