import React from 'react';

/**
 * Demo component to showcase HTML rendering capabilities
 * This can be used for testing the new HTML rendering system
 */
const HTMLRenderingDemo = () => {
  // Sample carousel data matching the Woodstock format
  const sampleCarouselMessage = {
    id: 'demo-carousel-1',
    content: `🛒 Found 3 dining products for you!

1. Nature's Edge Live Edge Counter Height Dining/Sofa Table - $280.21
2. Bilboa Indigo/ Off White Slipcovered Dining Chair - $287.5
3. Belhaven Grey 9 Piece Dining Set w/Table & 8 Chairs - $1498

**CAROUSEL_DATA:** {"products": [{"name": "Nature's Edge Live Edge Counter Height Dining/Sofa Table", "sku": "533813235", "price": 280.21, "status": 2, "image_url": "https://www.woodstockoutlet.com/media/catalog/product/j/o/jofran-natures-edge-sofa-dining-table-1985-72-img1.jpg", "url": "https://www.woodstockoutlet.com/natures-edge-live-edge-counter-height-dining-sofa-table"}, {"name": "Bilboa Indigo/ Off White Slipcovered Dining Chair", "sku": "045969352", "price": 287.5, "status": 2, "image_url": "https://www.woodstockoutlet.com/media/catalog/product/b/r/bramble-bilboa-slipcover-side-dining-chair-indigo-off-white-27932-SF205-OFW-right1.jpg", "url": "https://www.woodstockoutlet.com/bilboa-indigo-off-white-slipcovered-dining-chair"}, {"name": "Belhaven Grey 9 Piece Dining Set w/Table & 8 Chairs", "sku": "424380346", "price": 1498, "status": 2, "image_url": "https://www.woodstockoutlet.com/media/catalog/product/l/e/legacy-belhaven-grey-9pc-dining-table-chairs-set-img1.jpg", "url": "https://www.woodstockoutlet.com/belhaven-grey-9-piece-dining-set-with-table-8-chairs"}]}`,
    timestamp: new Date(),
    isOwn: false,
    status: 'read'
  };

  // Sample function result message
  const sampleFunctionMessage = {
    id: 'demo-function-1',
    content: `**Function Result (get_customer_by_phone):**
{"customer": {"name": "John Smith", "email": "john.smith@email.com", "phone": "+1-555-0123", "loyalty_status": "Gold Member", "last_order": {"order_number": "WO-12345", "total": "299.99"}}}`,
    timestamp: new Date(),
    isOwn: false,
    status: 'read'
  };

  // Sample enhanced markdown message
  const sampleMarkdownMessage = {
    id: 'demo-markdown-1',
    content: `# Product Recommendation

We found **3 great options** for your dining room:

## Featured Items:
- **Nature's Edge Table**: Perfect for *modern farmhouse* style
- **Bilboa Dining Chair**: Comfortable and stylish seating
- **9-Piece Dining Set**: Complete solution for large families

### **FEATURES:**
- ✅ **Free Shipping** on orders over $299
- ✅ **30-Day Returns** on all furniture
- ✅ **Expert Assembly** available

> *"Transform your dining space with quality furniture that lasts."*

**Ready to order?** Call us at **(555) 123-4567** or visit our showroom!`,
    timestamp: new Date(),
    isOwn: false,
    status: 'read'
  };

  return (
    <div className="html-rendering-demo p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">HTML Rendering Demo</h2>
      
      <div className="demo-section">
        <h3 className="text-lg font-semibold mb-2">1. Product Carousel</h3>
        <p className="text-sm text-gray-600 mb-2">
          This message contains carousel data and should render an interactive product slider:
        </p>
        <div className="demo-message bg-gray-100 p-3 rounded">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(sampleCarouselMessage, null, 2)}
          </pre>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="text-lg font-semibold mb-2">2. Function Result</h3>
        <p className="text-sm text-gray-600 mb-2">
          This message contains function result data and should render a customer card:
        </p>
        <div className="demo-message bg-gray-100 p-3 rounded">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(sampleFunctionMessage, null, 2)}
          </pre>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="text-lg font-semibold mb-2">3. Enhanced Markdown</h3>
        <p className="text-sm text-gray-600 mb-2">
          This message contains enhanced markdown and should render with rich formatting:
        </p>
        <div className="demo-message bg-gray-100 p-3 rounded">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(sampleMarkdownMessage, null, 2)}
          </pre>
        </div>
      </div>

      <div className="demo-instructions bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>Send any of these sample messages through your chat system</li>
          <li>The MessageRenderer will detect the content patterns</li>
          <li>Enhanced messages will render with HTML components</li>
          <li>If rendering fails, messages will fallback to plain text</li>
          <li>Check browser console for initialization logs</li>
        </ol>
      </div>

      <div className="demo-status bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">System Status:</h4>
        <div className="space-y-1 text-sm text-green-700">
          <div>✅ MessageRenderer: Available</div>
          <div>✅ WoodstockComponents: {typeof window !== 'undefined' && window.WoodstockComponents ? 'Loaded' : 'Loading...'}</div>
          <div>✅ WoodstockMagentoCarousel: {typeof window !== 'undefined' && window.WoodstockMagentoCarousel ? 'Loaded' : 'Loading...'}</div>
          <div>✅ Swiffy Slider: {typeof window !== 'undefined' && window.swiffyslider ? 'Loaded' : 'Loading...'}</div>
          <div>✅ Font Awesome: Available</div>
          <div>✅ CSS Enhancements: Applied</div>
        </div>
      </div>
    </div>
  );
};

export default HTMLRenderingDemo;
