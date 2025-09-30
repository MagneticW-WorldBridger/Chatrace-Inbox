import React, { useState, useEffect } from 'react';
import MessageRenderer from './MessageRenderer';

/**
 * Test component for carousel rendering with Python backend data format
 */
const CarouselTestComponent = () => {
  const [testResults, setTestResults] = useState([]);

  // Sample message matching your Python backend format EXACTLY
  const pythonBackendMessage = {
    id: 'test-python-carousel',
    content: `🛒 Found 3 dining products for you!

1. Nature's Edge Live Edge Counter Height Dining/Sofa Table - $280.21
2. Bilboa Indigo/ Off White Slipcovered Dining Chair - $287.5
3. Belhaven Grey 9 Piece Dining Set w/Table & 8 Chairs - $1498

**CAROUSEL_DATA:** {"products": [{"name": "Nature's Edge Live Edge Counter Height Dining/Sofa Table", "sku": "533813235", "price": 280.21, "status": 2, "image_url": "https://www.woodstockoutlet.com/media/catalog/product/j/o/jofran-natures-edge-sofa-dining-table-1985-72-img1.jpg", "media_gallery_entries": [{"id": 30520, "media_type": "image", "label": null, "position": 0, "disabled": false, "types": ["small_image", "thumbnail", "swatch_image"], "file": "/j/o/jofran-natures-edge-sofa-dining-table-1985-72-img1.jpg"}], "custom_attributes": [{"attribute_code": "description", "value": "The Nature's Edge Live Edge Counter Height Dining Table by Jofran"}]}, {"name": "Bilboa Indigo/ Off White Slipcovered Dining Chair", "sku": "045969352", "price": 287.5, "status": 2, "image_url": "https://www.woodstockoutlet.com/media/catalog/product/b/r/bramble-bilboa-slipcover-side-dining-chair-indigo-off-white-27932-SF205-OFW-right1.jpg", "media_gallery_entries": [{"id": 15630, "media_type": "image", "label": null, "position": 0, "disabled": false, "types": ["small_image", "thumbnail", "swatch_image"], "file": "/b/r/bramble-bilboa-slipcover-side-dining-chair-indigo-off-white-27932-SF205-OFW-right1.jpg"}], "custom_attributes": []}, {"name": "Belhaven Grey 9 Piece Dining Set w/Table & 8 Chairs", "sku": "424380346", "price": 1498, "status": 2, "image_url": "https://www.woodstockoutlet.com/media/catalog/product/l/e/legacy-belhaven-grey-9pc-dining-table-chairs-set-img1.jpg", "media_gallery_entries": [{"id": 57909, "media_type": "image", "label": null, "position": 0, "disabled": false, "types": ["small_image", "thumbnail", "swatch_image"], "file": "/l/e/legacy-belhaven-grey-9pc-dining-table-chairs-set-img1.jpg"}], "custom_attributes": []}]}`,
    timestamp: new Date(),
    isOwn: false,
    status: 'read'
  };

  const runTests = () => {
    const results = [];
    
    // Test 1: Check if components are available
    results.push({
      test: 'Components Available',
      passed: !!(window.WoodstockComponents && window.WoodstockMagentoCarousel),
      details: `WoodstockComponents: ${!!window.WoodstockComponents}, WoodstockMagentoCarousel: ${!!window.WoodstockMagentoCarousel}`
    });

    // Test 2: Check if Swiffy Slider is loaded
    results.push({
      test: 'Swiffy Slider Available',
      passed: !!window.swiffyslider,
      details: `swiffyslider: ${!!window.swiffyslider}`
    });

    // Test 3: Test carousel data extraction
    try {
      const carouselMatch = pythonBackendMessage.content.match(/\*\*CAROUSEL_DATA:\*\*\s*({.*})/s);
      const carouselData = carouselMatch ? JSON.parse(carouselMatch[1]) : null;
      results.push({
        test: 'Carousel Data Extraction',
        passed: !!(carouselData && carouselData.products && carouselData.products.length > 0),
        details: `Found ${carouselData?.products?.length || 0} products`
      });
    } catch (error) {
      results.push({
        test: 'Carousel Data Extraction',
        passed: false,
        details: `Error: ${error.message}`
      });
    }

    // Test 4: Test carousel HTML generation
    try {
      if (window.WoodstockMagentoCarousel) {
        const carouselMatch = pythonBackendMessage.content.match(/\*\*CAROUSEL_DATA:\*\*\s*({.*})/s);
        const carouselData = JSON.parse(carouselMatch[1]);
        const html = window.WoodstockMagentoCarousel.createProductCarousel(carouselData.products, 'Test Carousel');
        results.push({
          test: 'Carousel HTML Generation',
          passed: html && html.length > 100,
          details: `Generated ${html?.length || 0} characters of HTML`
        });
      } else {
        results.push({
          test: 'Carousel HTML Generation',
          passed: false,
          details: 'WoodstockMagentoCarousel not available'
        });
      }
    } catch (error) {
      results.push({
        test: 'Carousel HTML Generation',
        passed: false,
        details: `Error: ${error.message}`
      });
    }

    setTestResults(results);
  };

  useEffect(() => {
    // Run tests after a short delay to ensure components are loaded
    const timer = setTimeout(runTests, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="carousel-test-component p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🎠 Carousel System Test</h2>
      
      {/* Test Results */}
      <div className="test-results mb-8">
        <h3 className="text-lg font-semibold mb-4">System Tests:</h3>
        <div className="grid gap-2">
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded flex items-center justify-between ${
              result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            } border`}>
              <span className="font-medium">
                {result.passed ? '✅' : '❌'} {result.test}
              </span>
              <span className="text-sm text-gray-600">{result.details}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={runTests}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Re-run Tests
        </button>
      </div>

      {/* Live Test */}
      <div className="live-test">
        <h3 className="text-lg font-semibold mb-4">Live Carousel Test:</h3>
        <p className="text-sm text-gray-600 mb-4">
          This should render the carousel using the exact same data format your Python backend sends:
        </p>
        
        <div className="test-message bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
          <MessageRenderer 
            message={pythonBackendMessage}
            fallback={
              <div className="fallback-content p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-medium text-yellow-800">Fallback Rendered:</p>
                <pre className="text-xs mt-2 whitespace-pre-wrap">{pythonBackendMessage.content}</pre>
              </div>
            }
          />
        </div>
      </div>

      {/* Debug Info */}
      <div className="debug-info mt-8 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Debug Information:</h4>
        <div className="text-sm space-y-1">
          <div>window.WoodstockComponents: {window.WoodstockComponents ? '✅ Available' : '❌ Missing'}</div>
          <div>window.WoodstockMagentoCarousel: {window.WoodstockMagentoCarousel ? '✅ Available' : '❌ Missing'}</div>
          <div>window.swiffyslider: {window.swiffyslider ? '✅ Available' : '❌ Missing'}</div>
          <div>Font Awesome: {document.querySelector('link[href*="font-awesome"]') ? '✅ Loaded' : '❌ Missing'}</div>
          <div>Swiffy Slider CSS: {document.querySelector('link[href*="swiffy-slider"]') ? '✅ Loaded' : '❌ Missing'}</div>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="raw-data mt-8">
        <h4 className="font-semibold mb-2">Raw Python Backend Message:</h4>
        <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
          {JSON.stringify(pythonBackendMessage, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CarouselTestComponent;
