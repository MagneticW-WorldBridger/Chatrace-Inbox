/**
 * Woodstock Components - Function Result Rendering System
 * 
 * This class handles rendering of function results from the Woodstock chatbot system
 * into rich HTML components with proper styling and interactivity.
 */
class WoodstockComponents {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    // Ensure CSS variables are available
    this.ensureCSSVariables();
    this.initialized = true;
    console.log('🎨 WoodstockComponents initialized');
  }

  ensureCSSVariables() {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    // Check if our CSS variables exist, if not set defaults
    if (!style.getPropertyValue('--woodstock-navy')) {
      root.style.setProperty('--woodstock-navy', '#002147');
      root.style.setProperty('--woodstock-red', '#d32535');
      root.style.setProperty('--woodstock-white', '#ffffff');
      root.style.setProperty('--primary-orange', '#ff6b35');
    }
  }

  /**
   * Main function result renderer
   * @param {string} functionName - Name of the executed function
   * @param {any} data - Function result data
   * @returns {string} HTML string for the component
   */
  renderFunctionResult(functionName, data) {
    try {
      // Parse data if it's a string
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { raw: data };
        }
      }

      switch (functionName.toLowerCase()) {
        case 'get_customer_by_phone':
        case 'getcustomerbyphone':
          return this.createCustomerCard(parsedData);
        
        case 'get_orders_by_customer':
        case 'getordersbycustomer':
          return this.createOrdersList(parsedData);
        
        case 'search_magento_products':
        case 'get_product_recommendations':
          return this.createRecommendationsCard(parsedData);
        
        case 'get_order_details':
        case 'getorderdetails':
          return this.createOrderDetailsCard(parsedData);
        
        case 'get_customer_patterns':
        case 'getcustomerpatterns':
          return this.createCustomerPatternsCard(parsedData);
        
        case 'create_support_ticket':
        case 'createsupportticket':
          return this.createSupportTicketCard(parsedData);
        
        case 'connect_to_human':
        case 'connecttohuman':
          return this.createSupportConnectionCard(parsedData);
        
        case 'get_store_directions':
        case 'getstoredirections':
          return this.createDirectionsCard(parsedData);
        
        case 'upgrade_loyalty_status':
        case 'upgradeloyaltystatus':
          return this.createLoyaltyUpgradeCard(parsedData);
        
        case 'schedule_appointment':
        case 'scheduleappointment':
          return this.createCalendarEventCard(parsedData);
        
        case 'get_customer_analytics':
        case 'getcustomeranalytics':
          return this.createCustomerAnalyticsCard(parsedData);
        
        case 'create_cross_sell':
        case 'createcrosssell':
          return this.createCrossSellCard(parsedData);
        
        case 'get_customer_journey':
        case 'getcustomerjourney':
          return this.createCustomerJourneyCard(parsedData);
        
        default:
          return this.createGenericCard(functionName, parsedData);
      }
    } catch (error) {
      console.error('Error rendering function result:', error);
      return this.createErrorCard(functionName, error.message);
    }
  }

  /**
   * Create customer profile card
   */
  createCustomerCard(data) {
    const customer = data.customer || data;
    return `
      <div class="function-result customer-card">
        <div class="card-header">
          <i class="fas fa-user"></i>
          <span>Customer Profile</span>
        </div>
        <div class="card-body">
          <div class="customer-info">
            <div class="customer-avatar">
              <i class="fas fa-user-circle fa-3x"></i>
            </div>
            <div class="customer-details">
              <h3>${customer.name || 'Unknown Customer'}</h3>
              <p class="customer-email">${customer.email || 'No email provided'}</p>
              <p class="customer-phone">${customer.phone || 'No phone provided'}</p>
              ${customer.loyalty_status ? `<span class="loyalty-badge">${customer.loyalty_status}</span>` : ''}
            </div>
          </div>
          ${customer.last_order ? `
            <div class="last-order-info">
              <h4>Last Order</h4>
              <p>Order #${customer.last_order.order_number}</p>
              <p>$${customer.last_order.total}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create orders list component
   */
  createOrdersList(data) {
    const orders = data.orders || data.data || [];
    if (!Array.isArray(orders)) return this.createGenericCard('Orders', data);

    const orderItems = orders.slice(0, 5).map(order => `
      <div class="order-item">
        <div class="order-header">
          <span class="order-number">#${order.order_number || order.id}</span>
          <span class="order-status status-${(order.status || 'pending').toLowerCase()}">${order.status || 'Pending'}</span>
        </div>
        <div class="order-details">
          <p class="order-total">$${order.total || '0.00'}</p>
          <p class="order-date">${new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="function-result orders-list">
        <div class="card-header">
          <i class="fas fa-shopping-cart"></i>
          <span>Recent Orders (${orders.length})</span>
        </div>
        <div class="card-body">
          <div class="orders-container">
            ${orderItems}
          </div>
          ${orders.length > 5 ? `<p class="more-orders">+ ${orders.length - 5} more orders</p>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create product recommendations with carousel
   */
  createRecommendationsCard(data) {
    const products = data.products || data.data || [];
    if (!Array.isArray(products)) return this.createGenericCard('Recommendations', data);

    // This will be enhanced by the carousel system
    return `
      <div class="function-result recommendations-card">
        <div class="card-header">
          <i class="fas fa-star"></i>
          <span>Product Recommendations</span>
        </div>
        <div class="card-body">
          <p>Found ${products.length} recommended products</p>
          <div class="products-preview">
            ${products.slice(0, 3).map(product => `
              <div class="product-preview">
                <h4>${product.name}</h4>
                <p class="product-price">$${product.price}</p>
              </div>
            `).join('')}
          </div>
          ${products.length > 3 ? `<p class="more-products">+ ${products.length - 3} more products</p>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create order details card
   */
  createOrderDetailsCard(data) {
    const order = data.order || data;
    const items = order.items || [];

    return `
      <div class="function-result order-details">
        <div class="card-header">
          <i class="fas fa-receipt"></i>
          <span>Order Details</span>
        </div>
        <div class="card-body">
          <div class="order-summary">
            <h3>Order #${order.order_number || order.id}</h3>
            <p class="order-status status-${(order.status || 'pending').toLowerCase()}">${order.status || 'Pending'}</p>
            <p class="order-total">Total: $${order.total || '0.00'}</p>
          </div>
          ${items.length > 0 ? `
            <div class="order-items">
              <h4>Items (${items.length})</h4>
              ${items.map(item => `
                <div class="order-item-detail">
                  <span class="item-name">${item.name}</span>
                  <span class="item-quantity">x${item.quantity}</span>
                  <span class="item-price">$${item.price}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create support ticket card
   */
  createSupportTicketCard(data) {
    const ticket = data.ticket || data;
    return `
      <div class="function-result support-ticket">
        <div class="card-header">
          <i class="fas fa-life-ring"></i>
          <span>Support Ticket Created</span>
        </div>
        <div class="card-body">
          <div class="ticket-info">
            <h3>Ticket #${ticket.ticket_id || ticket.id}</h3>
            <p class="ticket-priority priority-${(ticket.priority || 'medium').toLowerCase()}">${ticket.priority || 'Medium'} Priority</p>
            <p class="ticket-subject">${ticket.subject || 'Support Request'}</p>
            <p class="ticket-status">Status: ${ticket.status || 'Open'}</p>
          </div>
          <div class="ticket-actions">
            <button class="btn-secondary" onclick="window.open('${ticket.url || '#'}', '_blank')">
              <i class="fas fa-external-link-alt"></i> View Ticket
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create human support connection card
   */
  createSupportConnectionCard(data) {
    return `
      <div class="function-result support-connection">
        <div class="card-header">
          <i class="fas fa-headset"></i>
          <span>Connecting to Human Support</span>
        </div>
        <div class="card-body">
          <div class="connection-status">
            <div class="loading-spinner"></div>
            <p>Connecting you with a human agent...</p>
            <p class="wait-time">Estimated wait time: ${data.wait_time || '2-3 minutes'}</p>
          </div>
          <div class="connection-info">
            <p>Queue position: ${data.queue_position || 'Next in line'}</p>
            <p>Support hours: ${data.support_hours || '9 AM - 6 PM EST'}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create generic card for unknown function types
   */
  createGenericCard(functionName, data) {
    let displayData;
    try {
      displayData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    } catch (e) {
      displayData = String(data);
    }

    return `
      <div class="function-result generic-card">
        <div class="card-header">
          <i class="fas fa-cog"></i>
          <span>Function: ${functionName}</span>
        </div>
        <div class="card-body">
          <pre class="function-data">${displayData}</pre>
        </div>
      </div>
    `;
  }

  /**
   * Create error card for failed function results
   */
  createErrorCard(functionName, error) {
    return `
      <div class="function-result error-card">
        <div class="card-header">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Function Error: ${functionName}</span>
        </div>
        <div class="card-body">
          <p class="error-message">Failed to render function result</p>
          <p class="error-details">${error}</p>
        </div>
      </div>
    `;
  }

  // Additional component methods can be added here for other function types
  createCustomerPatternsCard(data) { return this.createGenericCard('Customer Patterns', data); }
  createDirectionsCard(data) { return this.createGenericCard('Directions', data); }
  createLoyaltyUpgradeCard(data) { return this.createGenericCard('Loyalty Upgrade', data); }
  createCalendarEventCard(data) { return this.createGenericCard('Calendar Event', data); }
  createCustomerAnalyticsCard(data) { return this.createGenericCard('Customer Analytics', data); }
  createCrossSellCard(data) { return this.createGenericCard('Cross-sell', data); }
  createCustomerJourneyCard(data) { return this.createGenericCard('Customer Journey', data); }
}

// Initialize and make globally available
if (typeof window !== 'undefined') {
  window.WoodstockComponents = new WoodstockComponents();
  console.log('🎨 WoodstockComponents available globally');
}

export default WoodstockComponents;
