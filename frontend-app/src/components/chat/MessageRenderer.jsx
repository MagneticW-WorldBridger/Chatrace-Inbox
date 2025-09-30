import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

/**
 * Enhanced Message Renderer with HTML support and fallback safety
 * 
 * This component provides production-safe HTML rendering for chat messages
 * with multiple layers of error protection and fallback mechanisms.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data
 * @param {React.ReactNode} props.fallback - Fallback component for errors
 * @returns {JSX.Element} Enhanced or fallback message content
 */
const MessageRenderer = ({ message, fallback }) => {
  const [enhancementError, setEnhancementError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset error state when message changes
  useEffect(() => {
    setEnhancementError(false);
    setIsProcessing(false);
  }, [message.id]);

  /**
   * Detect if message should be enhanced with HTML rendering
   * Multiple pattern detection for redundancy
   */
  const shouldEnhanceMessage = (content) => {
    if (!content || typeof content !== 'string') return false;
    
    // Pattern 1: Carousel data detection
    const hasCarouselData = content.includes('**CAROUSEL_DATA:**') || 
                           content.includes('CAROUSEL_DATA:');
    
    // Pattern 2: Function result detection  
    const hasFunctionResult = /\*\*Function Result \(([^)]+)\):\*\*/.test(content);
    
    // Pattern 3: HTML-like content detection
    const hasHtmlContent = /<[^>]+>/.test(content) && 
                           (content.includes('<div') || 
                            content.includes('<span') || 
                            content.includes('<p') ||
                            content.includes('<ul') ||
                            content.includes('<li'));
    
    // Pattern 4: Enhanced markdown detection
    const hasEnhancedMarkdown = content.includes('🛒') || 
                               content.includes('**FEATURES:**') ||
                               content.includes('**Function Call:');
    
    return hasCarouselData || hasFunctionResult || hasHtmlContent || hasEnhancedMarkdown;
  };

  /**
   * Extract carousel data from message content - FIXED FOR PYTHON BACKEND
   */
  const extractCarouselData = (content) => {
    try {
      console.log('🎠 Extracting carousel data from:', content.substring(0, 200));
      
      // Pattern 1: **CAROUSEL_DATA:** {json} (Python backend format)
      const carouselMatch = content.match(/\*\*CAROUSEL_DATA:\*\*\s*({.*})/s);
      if (carouselMatch) {
        console.log('🎠 Found carousel data (pattern 1):', carouselMatch[1].substring(0, 100));
        return JSON.parse(carouselMatch[1]);
      }
      
      // Pattern 2: CAROUSEL_DATA: {json} (alternative format)
      const altCarouselMatch = content.match(/CAROUSEL_DATA:\s*({.*})/s);
      if (altCarouselMatch) {
        console.log('🎠 Found carousel data (pattern 2):', altCarouselMatch[1].substring(0, 100));
        return JSON.parse(altCarouselMatch[1]);
      }
      
      // Pattern 3: Look for {"products": anywhere in the message
      const jsonMatch = content.match(/({\"products\":\s*\[.*?\]})/s);
      if (jsonMatch) {
        console.log('🎠 Found carousel data (pattern 3):', jsonMatch[1].substring(0, 100));
        return JSON.parse(jsonMatch[1]);
      }
      
    } catch (error) {
      console.error('❌ Failed to parse carousel data:', error);
      console.log('Content that failed:', content);
    }
    return null;
  };

  /**
   * Extract function result data from message content
   */
  const extractFunctionResult = (content) => {
    const functionResultMatch = content.match(/\*\*Function Result \(([^)]+)\):\*\*\s*\n([\s\S]*?)(?=\n\n|\*\*Function|$)/);
    if (functionResultMatch) {
      return {
        functionName: functionResultMatch[1],
        data: functionResultMatch[2]
      };
    }
    return null;
  };

  /**
   * Enhanced Message Content Component
   */
  const EnhancedMessageContent = ({ content }) => {
    const [carouselInitialized, setCarouselInitialized] = useState(false);
    
    // Extract special data
    const carouselData = extractCarouselData(content);
    const functionResult = extractFunctionResult(content);
    
    // Initialize carousel if needed
    useEffect(() => {
      if (carouselData && !carouselInitialized && window.swiffyslider) {
        const timer = setTimeout(() => {
          try {
            window.swiffyslider.init();
            setCarouselInitialized(true);
            console.log('🎠 Carousel initialized successfully');
          } catch (error) {
            console.warn('Carousel initialization failed:', error);
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, [carouselData, carouselInitialized]);

    // Render carousel if data exists - FIXED FOR PYTHON BACKEND
    if (carouselData) {
      console.log('🎠 Rendering carousel with data:', carouselData);
      
      try {
        // Ensure WoodstockMagentoCarousel is available
        if (!window.WoodstockMagentoCarousel) {
          console.warn('⚠️ WoodstockMagentoCarousel not available, loading...');
          // Try to initialize it
          if (typeof WoodstockMagentoCarousel !== 'undefined') {
            window.WoodstockMagentoCarousel = new WoodstockMagentoCarousel();
          } else {
            console.error('❌ WoodstockMagentoCarousel class not found');
            setEnhancementError(true);
            return null;
          }
        }
        
        const products = carouselData.products || (Array.isArray(carouselData) ? carouselData : []);
        console.log('🎠 Products to render:', products.length);
        
        if (!products || products.length === 0) {
          console.warn('⚠️ No products found in carousel data');
          setEnhancementError(true);
          return null;
        }
        
        const carouselHTML = window.WoodstockMagentoCarousel.createProductCarousel(
          products,
          '🛒 Product Recommendations'
        );
        
        console.log('🎠 Generated carousel HTML length:', carouselHTML.length);
        
        // Split content to show text above carousel
        const textContent = content.split('**CAROUSEL_DATA:**')[0] || content.split('CAROUSEL_DATA:')[0] || '';
        
        return (
          <div className="enhanced-message-content">
            {/* Regular content above carousel */}
            {textContent.trim() && (
              <Markdown rehypePlugins={[rehypeRaw]}>
                {textContent.trim()}
              </Markdown>
            )}
            
            {/* Carousel content */}
            <div 
              dangerouslySetInnerHTML={{ __html: carouselHTML }}
              className="carousel-container"
            />
          </div>
        );
      } catch (error) {
        console.error('❌ Carousel rendering failed:', error);
        setEnhancementError(true);
        return null;
      }
    }

    // Render function result if data exists
    if (functionResult && window.WoodstockComponents) {
      try {
        const componentHTML = window.WoodstockComponents.renderFunctionResult(
          functionResult.functionName,
          functionResult.data
        );
        
        if (componentHTML) {
          return (
            <div className="enhanced-message-content">
              <div 
                dangerouslySetInnerHTML={{ __html: componentHTML }}
                className="function-result-container"
              />
            </div>
          );
        }
      } catch (error) {
        console.warn('Function result rendering failed, using fallback:', error);
        setEnhancementError(true);
        return null;
      }
    }

    // Default enhanced markdown rendering
    try {
      return (
        <div className="enhanced-message-content">
          <Markdown 
            rehypePlugins={[rehypeRaw]}
            components={{
              // Custom component mappings for safety
              script: () => null, // Block script tags
              iframe: () => null, // Block iframe tags
              object: () => null, // Block object tags
              embed: () => null,  // Block embed tags
            }}
          >
            {content}
          </Markdown>
        </div>
      );
    } catch (error) {
      console.warn('Enhanced markdown rendering failed:', error);
      setEnhancementError(true);
      return null;
    }
  };

  // Error Boundary Component
  class EnhancementErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      console.warn('Enhancement error caught by boundary:', error);
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.warn('Enhancement error details:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return this.props.fallback;
      }

      return this.props.children;
    }
  }

  // Main rendering logic
  const content = message.content || '';
  
  // Return fallback immediately if no enhancement needed
  if (!shouldEnhanceMessage(content)) {
    return fallback;
  }

  // Return fallback if enhancement error occurred
  if (enhancementError) {
    return fallback;
  }

  // Return enhanced content with error boundary
  return (
    <EnhancementErrorBoundary fallback={fallback}>
      <EnhancedMessageContent content={content} />
    </EnhancementErrorBoundary>
  );
};

export default MessageRenderer;
