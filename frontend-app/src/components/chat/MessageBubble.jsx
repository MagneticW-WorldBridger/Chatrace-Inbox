import { FiCheck } from 'react-icons/fi';
import { formatTime } from '../../utils/formatters';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import CallRecordingPlayer from './CallRecordingPlayer';
import MessageRenderer from './MessageRenderer';
import { useEffect, useState } from 'react';

// Helper function to extract recording URL from message content
const extractRecordingUrl = (content) => {
  if (!content) return null;
  
  // Look for recording URL patterns
  const patterns = [
    /🎵 Recording:\s*(https?:\/\/[^\s]+)/i,
    /Recording:\s*(https?:\/\/[^\s]+)/i,
    /recording_url['":\s]*(https?:\/\/[^\s'"]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * DIRECT CAROUSEL RENDERER - NO BULLSHIT, JUST WORKS
 */
const DirectCarouselRenderer = ({ content }) => {
  const [carouselHTML, setCarouselHTML] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      console.log('🔥 DIRECT CAROUSEL RENDERER - Processing:', content.substring(0, 100));
      
      // Extract carousel data - MULTIPLE PATTERNS
      let carouselData = null;
      
      // Pattern 1: **CAROUSEL_DATA:** {json}
      const pattern1 = content.match(/\*\*CAROUSEL_DATA:\*\*\s*({.*})/s);
      if (pattern1) {
        console.log('🎠 Pattern 1 match:', pattern1[1].substring(0, 100));
        carouselData = JSON.parse(pattern1[1]);
      }
      
      // Pattern 2: CAROUSEL_DATA: {json}  
      if (!carouselData) {
        const pattern2 = content.match(/CAROUSEL_DATA:\s*({.*})/s);
        if (pattern2) {
          console.log('🎠 Pattern 2 match:', pattern2[1].substring(0, 100));
          carouselData = JSON.parse(pattern2[1]);
        }
      }
      
      // Pattern 3: Any {"products": in the message
      if (!carouselData) {
        const pattern3 = content.match(/({\"products\":\s*\[.*?\]})/s);
        if (pattern3) {
          console.log('🎠 Pattern 3 match:', pattern3[1].substring(0, 100));
          carouselData = JSON.parse(pattern3[1]);
        }
      }

      if (!carouselData || !carouselData.products) {
        console.error('❌ No carousel data found');
        setError(true);
        return;
      }

      console.log('🎠 Found products:', carouselData.products.length);

      // Generate HTML directly - FUCK THE COMPLEX SYSTEM
      const products = carouselData.products;
      const carouselId = `direct-carousel-${Date.now()}`;
      
      const productCards = products.map((product, index) => {
        const imageUrl = product.image_url || 'https://via.placeholder.com/300x200/002147/FFFFFF?text=Woodstock+Furniture';
        const price = product.price ? `$${product.price}` : 'Price on request';
        
        return `
          <div class="product-card" style="
            background: rgba(248, 249, 250, 0.9);
            border: 1px solid rgba(222, 226, 230, 0.5);
            border-radius: 12px;
            overflow: hidden;
            margin: 0.5rem;
            cursor: pointer;
            transition: transform 0.3s ease;
            min-width: 250px;
            max-width: 280px;
          " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div class="product-image" style="height: 180px; overflow: hidden;">
              <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" 
                   onerror="this.src='https://via.placeholder.com/300x200/002147/FFFFFF?text=Woodstock+Furniture'">
            </div>
            <div class="product-info" style="padding: 1rem;">
              <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600; color: #002147; line-height: 1.3;">
                ${product.name || 'Product'}
              </h3>
              <p style="margin: 0 0 0.75rem 0; font-size: 1.1rem; font-weight: 700; color: #d32535;">
                ${price}
              </p>
              ${product.sku ? `<p style="margin: 0; font-size: 0.75rem; color: #6c757d;">SKU: ${product.sku}</p>` : ''}
            </div>
          </div>
        `;
      }).join('');

      const html = `
        <div class="direct-carousel-container" style="margin: 1rem 0;">
          <div class="carousel-header" style="
            background: linear-gradient(135deg, #002147, #1a365d);
            color: white;
            padding: 1rem;
            border-radius: 12px 12px 0 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
          ">
            <i class="fas fa-shopping-cart"></i>
            <span>🛒 Found ${products.length} Products</span>
          </div>
          <div class="carousel-content" style="
            background: rgba(248, 249, 250, 0.8);
            border: 1px solid rgba(222, 226, 230, 0.5);
            border-top: none;
            border-radius: 0 0 12px 12px;
            padding: 1rem;
          ">
            <div class="products-scroll" style="
              display: flex;
              gap: 1rem;
              overflow-x: auto;
              padding: 0.5rem 0;
              scrollbar-width: thin;
            ">
              ${productCards}
            </div>
          </div>
        </div>
      `;

      console.log('🎠 Generated HTML length:', html.length);
      setCarouselHTML(html);
      
    } catch (error) {
      console.error('❌ Direct carousel error:', error);
      setError(true);
    }
  }, [content]);

  if (error) {
    return (
      <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '8px' }}>
        <p>❌ Carousel rendering failed</p>
        <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{content}</pre>
      </div>
    );
  }

  if (!carouselHTML) {
    return (
      <div style={{ padding: '1rem', background: '#fff3cd', color: '#856404', borderRadius: '8px' }}>
        <p>🎠 Loading carousel...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Show text content above carousel */}
      <div style={{ marginBottom: '1rem' }}>
        {content.split('**CAROUSEL_DATA:**')[0]?.trim() && (
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {content.split('**CAROUSEL_DATA:**')[0].trim()}
          </p>
        )}
      </div>
      
      {/* Render carousel */}
      <div dangerouslySetInnerHTML={{ __html: carouselHTML }} />
    </div>
  );
};

/**
 * Individual message bubble component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data
 * @param {Object} props.contact - Contact data for avatar
 * @param {string} props.agentAvatar - Agent avatar URL
 * @param {boolean} props.isOwn - Whether this is the agent's message
 * @returns {JSX.Element} Message bubble component
 */
const MessageBubble = ({ 
  message, 
  contact, 
  agentAvatar, 
  isOwn 
}) => {
  const { content, timestamp, status } = message;
  
  // DIRECT CAROUSEL DETECTION - BYPASS MessageRenderer COMPLEXITY
  const hasCarouselData = content && (
    content.includes('**CAROUSEL_DATA:**') || 
    content.includes('CAROUSEL_DATA:') ||
    content.includes('{"products"')
  );
  
  // Check if this is a call recording message - ENHANCED DETECTION
  const isCallRecording = (
    // Direct call indicators
    message.message_type === 'call' ||
    (message.function_data && message.function_data.call_id) ||
    (message.function_data && message.function_data.recording_url) ||
    (message.function_data && message.function_data.call_duration !== null) ||
    // CRITICAL: System role messages are VAPI calls
    (message.role === 'system' || message.message_role === 'system') ||
    // Content pattern detection for all call types
    content.includes('📞 VAPI Call') ||
    content.includes('🎵 Recording:') ||
    content.includes('📞 Phone call') ||
    content.includes('📋 Call Summary:') ||
    // Rural King specific patterns
    content.includes('AI: Hi, this is Rural King') ||
    content.includes("AI: Hi. This is Rural King's automated system") ||
    (content.length > 200 && content.includes('User:') && content.includes('AI:')) ||
    // VAPI call status patterns
    content.includes('VAPI Call - No transcript available')
  );
  
  console.log('🔍 Call Detection:', {
    content: content.substring(0, 50),
    isCallRecording,
    message_type: message.message_type,
    has_call_id: !!(message.function_data && message.function_data.call_id),
    content_patterns: {
      vapi_call: content.includes('📞 VAPI Call'),
      rural_king_ai: content.includes('AI: Hi, this is Rural King'),
      long_conversation: content.length > 200 && content.includes('User:') && content.includes('AI:')
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return <IoCheckmarkDoneSharp className="w-3 h-3 text-blue-600" />;
      case 'delivered':
        return <IoCheckmarkDoneSharp className="w-3 h-3 text-gray-600" />;
      case 'sent':
        return <FiCheck className="w-3 h-3 text-gray-600" />;
      default:
        return null;
    }
  };

  // Render call recording player for call messages
  if (isCallRecording) {
    return (
      <div className={`flex gap-4 ${isOwn ? 'justify-end' : 'justify-start'} items-start`}>
        {/* Contact Avatar (for received messages) */}
        {!isOwn && (
          <img 
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
            src={contact?.avatar} 
            alt={contact?.name} 
          />
        )}
        
        {/* Call Recording Player */}
        <div className="max-w-[85%] sm:max-w-[90%] lg:max-w-[80%] min-w-0">
          <CallRecordingPlayer
            recordingUrl={message.function_data?.recording_url || extractRecordingUrl(content)}
            transcript={message.function_data?.transcript || message.function_data?.message_content || content}
            summary={message.function_data?.call_summary || message.function_data?.summary}
            duration={message.function_data?.call_duration || message.function_data?.duration_seconds}
            callId={message.function_data?.call_id}
            orderContext={{
              order_number: message.function_data?.order_context || message.function_data?.order_number,
              store_name: message.function_data?.store_context || message.function_data?.store_name,
              order_status: message.function_data?.order_status
            }}
            customerName={contact?.name || message.function_data?.customer_name}
            isOwn={isOwn}
            messageContent={content}
          />
          
          {/* Message Meta for Call */}
          <div className={`flex items-center gap-2 mt-2 text-xs text-gray-600 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span>{formatTime(timestamp)}</span>
            {isOwn && status && getStatusIcon(status)}
          </div>
        </div>
        
        {/* Agent Avatar (for sent messages) */}
        {isOwn && (
          <img 
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
            src={agentAvatar} 
            alt="Agent" 
          />
        )}
      </div>
    );
  }

  // Standard message bubble for non-call messages
  return (
    <div className={`flex gap-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Contact Avatar (for received messages) */}
      {!isOwn && (
        <img 
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
          src={contact?.avatar} 
          alt={contact?.name} 
        />
      )}
      
      {/* Message Content */}
      <div className="max-w-[75%] sm:max-w-[80%] lg:max-w-[70%] min-w-0">
        <div className={`rounded-2xl px-4 py-3 text-sm break-words ${
          isOwn 
            ? 'bg-[#05a6f4]/80 text-white' 
            : 'bg-gray-100 text-black'
        }`}>
          {hasCarouselData ? (
            <DirectCarouselRenderer content={content} />
          ) : (
            <MessageRenderer 
              message={message}
              fallback={<p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>}
            />
          )}
        </div>
        
        {/* Message Meta */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-600 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(timestamp)}</span>
          {isOwn && status && getStatusIcon(status)}
        </div>
      </div>
      
      {/* Agent Avatar (for sent messages) */}
      {isOwn && (
        <img 
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
          src={agentAvatar} 
          alt="Agent" 
        />
      )}
    </div>
  );
};

export default MessageBubble;