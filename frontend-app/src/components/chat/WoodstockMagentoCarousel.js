/**
 * Woodstock Magento Carousel - Product Carousel System
 * 
 * This class handles rendering of Magento product data into interactive carousels
 * using the Swiffy Slider library with proper initialization and responsive design.
 */
class WoodstockMagentoCarousel {
  constructor() {
    this.initialized = false;
    this.carouselCounter = 0;
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    // Load Swiffy Slider if not already loaded
    this.ensureSwiffySlider();
    this.initialized = true;
    console.log('🎠 WoodstockMagentoCarousel initialized');
  }

  /**
   * Ensure Swiffy Slider is loaded and available
   */
  async ensureSwiffySlider() {
    // Check if Swiffy Slider CSS is loaded
    if (!document.querySelector('link[href*="swiffy-slider"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/swiffy-slider@1.6.0/dist/css/swiffy-slider.min.css';
      cssLink.crossOrigin = 'anonymous';
      document.head.appendChild(cssLink);
    }

    // Check if Swiffy Slider JS is loaded
    if (!window.swiffyslider) {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiffy-slider@1.6.0/dist/js/swiffy-slider.min.js';
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-noinit', ''); // Prevent auto-init
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        console.log('📦 Swiffy Slider loaded successfully');
      } catch (error) {
        console.warn('Failed to load Swiffy Slider:', error);
      }
    }
  }

  /**
   * Create product carousel HTML
   * @param {Array} products - Array of product objects
   * @param {string} title - Carousel title
   * @returns {string} HTML string for the carousel
   */
  createProductCarousel(products, title = '🛒 Products') {
    if (!Array.isArray(products) || products.length === 0) {
      return this.createEmptyCarousel(title);
    }

    const carouselId = `carousel-${++this.carouselCounter}-${Date.now()}`;
    const productCards = products.map(product => this.createProductCard(product)).join('');

    return `
      <div class="function-result product-carousel-container">
        <div class="card-header">
          <i class="fas fa-shopping-cart"></i>
          <span>${title} (${products.length} items)</span>
        </div>
        <div class="card-body">
          <div id="${carouselId}" class="swiffy-slider slider-item-show4 slider-item-reveal slider-nav-outside slider-nav-round slider-nav-visible slider-indicators-outside slider-indicators-round slider-indicators-dark">
            <ul class="slider-container">
              ${productCards}
            </ul>
            
            <button type="button" class="slider-nav" aria-label="Previous slide">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button type="button" class="slider-nav" aria-label="Next slide">
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="slider-indicators">
              ${products.map((_, index) => `<button class="slider-indicator" data-slide-to="${index}" aria-label="Slide ${index + 1}"></button>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create individual product card
   * @param {Object} product - Product data
   * @returns {string} HTML string for product card
   */
  createProductCard(product) {
    const imageUrl = this.getProductImage(product);
    const price = this.formatPrice(product.price);
    const description = this.truncateText(product.description || '', 100);
    
    return `
      <li class="product-slide">
        <div class="product-card" onclick="window.open('${product.url || '#'}', '_blank')">
          <div class="product-image">
            <img src="${imageUrl}" alt="${product.name || 'Product'}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            ${product.status === 2 ? '<div class="product-badge">Available</div>' : ''}
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name || 'Unnamed Product'}</h3>
            <p class="product-price">${price}</p>
            ${product.sku ? `<p class="product-sku">SKU: ${product.sku}</p>` : ''}
            ${description ? `<p class="product-description">${description}</p>` : ''}
            <div class="product-actions">
              <button class="btn-primary product-btn" onclick="event.stopPropagation(); window.open('${product.url || '#'}', '_blank')">
                <i class="fas fa-eye"></i> View Details
              </button>
              ${product.price ? `
                <button class="btn-secondary product-btn" onclick="event.stopPropagation(); alert('Add to cart functionality would be implemented here')">
                  <i class="fas fa-cart-plus"></i> Quick Add
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </li>
    `;
  }

  /**
   * Get product image URL with fallback - MATCHES PYTHON BACKEND LOGIC
   */
  getProductImage(product) {
    // First check for direct image_url (Python backend provides this)
    if (product.image_url) {
      console.log('🖼️ Using direct image_url:', product.image_url);
      return product.image_url;
    }
    
    // Check media_gallery_entries (Magento format)
    if (product.media_gallery_entries && product.media_gallery_entries.length > 0) {
      const mediaEntry = product.media_gallery_entries[0];
      if (mediaEntry.file) {
        const imageUrl = `https://www.woodstockoutlet.com/media/catalog/product${mediaEntry.file}`;
        console.log('🖼️ Using media gallery:', imageUrl);
        return imageUrl;
      }
    }
    
    // Check custom_attributes for image fields
    if (product.custom_attributes) {
      const imageAttr = product.custom_attributes.find(attr => 
        attr.attribute_code === 'image' || 
        attr.attribute_code === 'small_image' ||
        attr.attribute_code === 'thumbnail'
      );
      if (imageAttr && imageAttr.value !== 'no_selection' && imageAttr.value) {
        const imageUrl = `https://www.woodstockoutlet.com/media/catalog/product${imageAttr.value}`;
        console.log('🖼️ Using custom attribute:', imageUrl);
        return imageUrl;
      }
    }
    
    console.log('🖼️ Using fallback placeholder for:', product.name || 'Unknown Product');
    return 'https://via.placeholder.com/300x200/002147/FFFFFF?text=Woodstock+Furniture';
  }

  /**
   * Format product price
   */
  formatPrice(price) {
    if (!price || isNaN(price)) return 'Price on request';
    return `$${parseFloat(price).toFixed(2)}`;
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Create empty carousel placeholder
   */
  createEmptyCarousel(title) {
    return `
      <div class="function-result product-carousel-container empty">
        <div class="card-header">
          <i class="fas fa-shopping-cart"></i>
          <span>${title}</span>
        </div>
        <div class="card-body">
          <div class="empty-carousel">
            <i class="fas fa-box-open fa-3x"></i>
            <p>No products available</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize carousel after DOM insertion
   * @param {string} carouselId - ID of the carousel element
   */
  initializeCarousel(carouselId) {
    if (!window.swiffyslider) {
      console.warn('Swiffy Slider not available for initialization');
      return false;
    }

    try {
      const carouselElement = document.getElementById(carouselId);
      if (!carouselElement) {
        console.warn(`Carousel element ${carouselId} not found`);
        return false;
      }

      // Initialize the specific carousel
      window.swiffyslider.initSlider(carouselElement);
      console.log(`🎠 Carousel ${carouselId} initialized successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to initialize carousel ${carouselId}:`, error);
      return false;
    }
  }

  /**
   * Initialize all carousels on the page
   */
  initializeAllCarousels() {
    if (!window.swiffyslider) {
      console.warn('Swiffy Slider not available');
      return;
    }

    try {
      window.swiffyslider.init();
      console.log('🎠 All carousels initialized');
    } catch (error) {
      console.error('Failed to initialize carousels:', error);
    }
  }

  /**
   * Create product grid (fallback for when carousel fails)
   */
  createProductGrid(products, title = '🛒 Products') {
    if (!Array.isArray(products) || products.length === 0) {
      return this.createEmptyCarousel(title);
    }

    const productCards = products.slice(0, 8).map(product => `
      <div class="product-grid-item">
        <div class="product-card" onclick="window.open('${product.url || '#'}', '_blank')">
          <img src="${this.getProductImage(product)}" alt="${product.name || 'Product'}" loading="lazy">
          <h4>${product.name || 'Unnamed Product'}</h4>
          <p class="price">${this.formatPrice(product.price)}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="function-result product-grid-container">
        <div class="card-header">
          <i class="fas fa-th"></i>
          <span>${title} (${products.length} items)</span>
        </div>
        <div class="card-body">
          <div class="product-grid">
            ${productCards}
          </div>
          ${products.length > 8 ? `<p class="more-products">+ ${products.length - 8} more products available</p>` : ''}
        </div>
      </div>
    `;
  }
}

// Initialize and make globally available
if (typeof window !== 'undefined') {
  window.WoodstockMagentoCarousel = new WoodstockMagentoCarousel();
  console.log('🎠 WoodstockMagentoCarousel available globally');
}

export default WoodstockMagentoCarousel;
