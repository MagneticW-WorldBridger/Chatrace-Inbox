-- =====================================================
-- Woodstock Outlet Chatbot Database Schema
-- PostgreSQL Database for Proactive Customer Analytics
-- =====================================================

-- Create database (run this separately if needed)
-- CREATE DATABASE woodstock_outlet_chatbot;

-- Connect to database
-- \c woodstock_outlet_chatbot;

-- =====================================================
-- CORE TABLES (CSV Data Import)
-- =====================================================

-- Customers table (from loftcustomers_202507110919.csv)
CREATE TABLE customers (
    customerid VARCHAR(20) PRIMARY KEY,
    firstname VARCHAR(100),
    middlename VARCHAR(100),
    lastname VARCHAR(100),
    phonenumber VARCHAR(20),
    businessphone VARCHAR(20),
    extension VARCHAR(10),
    address1 VARCHAR(255),
    address2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(10),
    zipcode VARCHAR(20),
    countryid VARCHAR(10),
    email VARCHAR(255),
    shipemail VARCHAR(255),
    type VARCHAR(10),
    accountopendate TIMESTAMP,
    taxexemptionid VARCHAR(50),
    taxexemptionnumber VARCHAR(50),
    companyname VARCHAR(255),
    markerid VARCHAR(50),
    ssn VARCHAR(20),
    memo TEXT,
    noemail BOOLEAN DEFAULT FALSE,
    interfacedforsalescube BOOLEAN DEFAULT FALSE,
    interfacedforforecasting BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (from loftorders_202507110918.csv)
CREATE TABLE orders (
    orderid VARCHAR(20) PRIMARY KEY,
    type VARCHAR(10),
    orderdate TIMESTAMP,
    ordertime INTEGER,
    status VARCHAR(10),
    customerid VARCHAR(20) REFERENCES customers(customerid),
    ordersiteid VARCHAR(10),
    salesperson1 VARCHAR(50),
    salesperson2 VARCHAR(50),
    percentofsale1 DECIMAL(5,3),
    percentofsale2 DECIMAL(5,3),
    fromsiteid VARCHAR(10),
    deliverytype VARCHAR(10),
    deliverydate TIMESTAMP,
    closeddate TIMESTAMP,
    closedsiteid VARCHAR(10),
    promisedate TIMESTAMP,
    mainorderid VARCHAR(20),
    sequence VARCHAR(20),
    originalsaleid VARCHAR(20),
    adjustedorderid VARCHAR(20),
    adjustmentreasonid VARCHAR(20),
    autoadjustment BOOLEAN DEFAULT FALSE,
    autosequence VARCHAR(20),
    massclose BOOLEAN DEFAULT FALSE,
    discountid VARCHAR(20),
    setupcharge DECIMAL(10,2),
    tax DECIMAL(10,2),
    taxruleid VARCHAR(20),
    taxexemptionid VARCHAR(20),
    deliverycharge DECIMAL(10,2),
    shipfirstname VARCHAR(100),
    shiplastname VARCHAR(100),
    shipcompanyname VARCHAR(255),
    shipaddress1 VARCHAR(255),
    shipaddress2 VARCHAR(255),
    shipcity VARCHAR(100),
    shipstate VARCHAR(10),
    shipzipcode VARCHAR(20),
    shipcountryid VARCHAR(10),
    shipzoneid VARCHAR(20),
    shipphonenumber VARCHAR(20),
    shipbusinessphone VARCHAR(20),
    shipextension VARCHAR(10),
    shipemail VARCHAR(255),
    closedby VARCHAR(50),
    createdby VARCHAR(50),
    markerid VARCHAR(50),
    financecompanyid VARCHAR(50),
    layawaysale BOOLEAN DEFAULT FALSE,
    takewithsale BOOLEAN DEFAULT FALSE,
    tentativefinancedamount DECIMAL(10,2),
    requestedfinancedamount DECIMAL(10,2),
    approvalcode VARCHAR(50),
    approvaldate TIMESTAMP,
    printedby VARCHAR(50),
    printapprovedby VARCHAR(50),
    printedfrom VARCHAR(50),
    lastprinted TIMESTAMP,
    receiptprintcount INTEGER,
    printedbyscreen VARCHAR(50),
    reserveuntil TIMESTAMP,
    approvalcodesequence VARCHAR(20),
    voidreasonid VARCHAR(20),
    version VARCHAR(10),
    interfacedforsalescube BOOLEAN DEFAULT FALSE,
    interfacedforforecasting BOOLEAN DEFAULT FALSE,
    deleteorder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Details table (from loftorderdetails_202507110918.csv)
CREATE TABLE order_details (
    id SERIAL PRIMARY KEY,
    orderid VARCHAR(20) REFERENCES orders(orderid),
    lineid INTEGER,
    productid VARCHAR(50),
    qtyordered DECIMAL(10,2),
    itemprice DECIMAL(10,2),
    voided BOOLEAN DEFAULT FALSE,
    voiddate TIMESTAMP,
    fillsiteid VARCHAR(10),
    filllocationid VARCHAR(20),
    commissiontype VARCHAR(10),
    spiff DECIMAL(10,2),
    originalinventorycost DECIMAL(10,2),
    filldate TIMESTAMP,
    inventorycostdate TIMESTAMP,
    inventoryreceiptdate TIMESTAMP,
    addeddate TIMESTAMP,
    fillfromsiteid VARCHAR(10),
    fillfromlocationid VARCHAR(20),
    mainorderid VARCHAR(20),
    packageid VARCHAR(50),
    salesperson1 VARCHAR(50),
    salesperson2 VARCHAR(50),
    percentofsale1 DECIMAL(5,3),
    percentofsale2 DECIMAL(5,3),
    picked BOOLEAN DEFAULT FALSE,
    upcharge DECIMAL(10,2),
    discount DECIMAL(10,2),
    valueforproductid VARCHAR(50),
    valueforlineid INTEGER,
    valueproductid VARCHAR(50),
    valueproductlineid INTEGER,
    warrantyproductid VARCHAR(50),
    warrantyproductlineid INTEGER,
    deliverypoints INTEGER,
    takenwith BOOLEAN DEFAULT FALSE,
    setup BOOLEAN DEFAULT FALSE,
    pickupdiscount DECIMAL(10,2),
    setupcommission DECIMAL(10,2),
    deliverycommission DECIMAL(10,2),
    taxruleid VARCHAR(20),
    taxliability DECIMAL(10,2),
    taxbasis DECIMAL(10,2),
    customertax DECIMAL(10,2),
    retailertax DECIMAL(10,2),
    priceauthorizedby VARCHAR(50),
    leaveincarton BOOLEAN DEFAULT FALSE,
    outletid VARCHAR(50),
    outletstatusid VARCHAR(20),
    outletdate TIMESTAMP,
    serialnumber VARCHAR(100),
    outletcomment TEXT,
    originalprice DECIMAL(10,2),
    originalalacarteprice DECIMAL(10,2),
    originalregularprice DECIMAL(10,2),
    promotionid VARCHAR(50),
    adjustmentreasonid VARCHAR(20),
    autoadjusteduid VARCHAR(50),
    autoadjustedvoided BOOLEAN DEFAULT FALSE,
    storecardloaded BOOLEAN DEFAULT FALSE,
    addedbyapp BOOLEAN DEFAULT FALSE,
    interfacedforsalescube BOOLEAN DEFAULT FALSE,
    interfacedforforecasting BOOLEAN DEFAULT FALSE,
    auditaction VARCHAR(10),
    oldorderid VARCHAR(20),
    oldlineid INTEGER,
    priceoverridereason VARCHAR(100),
    lineadded BOOLEAN DEFAULT FALSE,
    totalothercost DECIMAL(10,2),
    deleteline BOOLEAN DEFAULT FALSE,
    returnlinematched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS TABLES (Derived Data)
-- =====================================================

-- Customer Analytics Summary
CREATE TABLE customer_analytics (
    customerid VARCHAR(20) PRIMARY KEY REFERENCES customers(customerid),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    first_order_date TIMESTAMP,
    last_order_date TIMESTAMP,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    favorite_product_category VARCHAR(100),
    loyalty_tier VARCHAR(20) DEFAULT 'BRONZE',
    days_since_last_order INTEGER,
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Analytics
CREATE TABLE product_analytics (
    productid VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255),
    total_orders INTEGER DEFAULT 0,
    total_quantity_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_price DECIMAL(10,2) DEFAULT 0,
    frequently_bought_with TEXT[], -- Array of product IDs
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Patterns
CREATE TABLE purchase_patterns (
    id SERIAL PRIMARY KEY,
    customerid VARCHAR(20) REFERENCES customers(customerid),
    productid VARCHAR(50),
    companion_productid VARCHAR(50),
    companion_product_name VARCHAR(255),
    frequency INTEGER DEFAULT 1,
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PROACTIVE TRIGGERS TABLES
-- =====================================================

-- Loyalty Tier Thresholds
CREATE TABLE loyalty_tiers (
    tier_name VARCHAR(20) PRIMARY KEY,
    min_spend DECIMAL(10,2),
    max_spend DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    benefits TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proactive Campaign Triggers
CREATE TABLE campaign_triggers (
    id SERIAL PRIMARY KEY,
    trigger_type VARCHAR(50), -- 'LOYALTY_UPGRADE', 'INACTIVITY', 'CROSS_SELL', 'DELIVERY_UPDATE'
    customerid VARCHAR(20) REFERENCES customers(customerid),
    orderid VARCHAR(20) REFERENCES orders(orderid),
    trigger_data JSONB, -- Flexible data storage
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Tracking
CREATE TABLE delivery_tracking (
    id SERIAL PRIMARY KEY,
    orderid VARCHAR(20) REFERENCES orders(orderid),
    customerid VARCHAR(20) REFERENCES customers(customerid),
    scheduled_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED'
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer indexes
CREATE INDEX idx_customers_phone ON customers(phonenumber);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_state ON customers(state);

-- Order indexes
CREATE INDEX idx_orders_customerid ON orders(customerid);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_orderdate ON orders(orderdate);
CREATE INDEX idx_orders_deliverydate ON orders(deliverydate);

-- Order details indexes
CREATE INDEX idx_order_details_orderid ON order_details(orderid);
CREATE INDEX idx_order_details_productid ON order_details(productid);
CREATE INDEX idx_order_details_price ON order_details(itemprice);

-- Analytics indexes
CREATE INDEX idx_customer_analytics_loyalty ON customer_analytics(loyalty_tier);
CREATE INDEX idx_customer_analytics_risk ON customer_analytics(risk_score);
CREATE INDEX idx_product_analytics_category ON product_analytics(category);

-- Campaign triggers indexes
CREATE INDEX idx_campaign_triggers_status ON campaign_triggers(status);
CREATE INDEX idx_campaign_triggers_type ON campaign_triggers(trigger_type);

-- =====================================================
-- FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to update customer analytics
CREATE OR REPLACE FUNCTION update_customer_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_analytics (
        customerid,
        total_orders,
        total_spent,
        first_order_date,
        last_order_date,
        average_order_value,
        loyalty_tier,
        days_since_last_order
    )
    SELECT 
        c.customerid,
        COUNT(o.orderid) as total_orders,
        COALESCE(SUM(o.sum::DECIMAL), 0) as total_spent,
        MIN(o.orderdate) as first_order_date,
        MAX(o.orderdate) as last_order_date,
        COALESCE(AVG(o.sum::DECIMAL), 0) as average_order_value,
        CASE 
            WHEN COALESCE(SUM(o.sum::DECIMAL), 0) >= 5000 THEN 'PLATINUM'
            WHEN COALESCE(SUM(o.sum::DECIMAL), 0) >= 2000 THEN 'GOLD'
            WHEN COALESCE(SUM(o.sum::DECIMAL), 0) >= 500 THEN 'SILVER'
            ELSE 'BRONZE'
        END as loyalty_tier,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MAX(o.orderdate))) as days_since_last_order
    FROM customers c
    LEFT JOIN orders o ON c.customerid = o.customerid
    WHERE c.customerid = NEW.customerid
    GROUP BY c.customerid
    ON CONFLICT (customerid) DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_spent = EXCLUDED.total_spent,
        last_order_date = EXCLUDED.last_order_date,
        average_order_value = EXCLUDED.average_order_value,
        loyalty_tier = EXCLUDED.loyalty_tier,
        days_since_last_order = EXCLUDED.days_since_last_order,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer analytics when orders change
CREATE TRIGGER trigger_update_customer_analytics
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_analytics();

-- Function to detect purchase patterns
CREATE OR REPLACE FUNCTION detect_purchase_patterns()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert companion product patterns
    INSERT INTO purchase_patterns (customerid, productid, companion_productid, companion_product_name, frequency, confidence_score)
    SELECT 
        od1.orderid,
        od1.productid,
        od2.productid as companion_productid,
        od2.description as companion_product_name,
        COUNT(*) as frequency,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM order_details WHERE orderid = od1.orderid)) as confidence_score
    FROM order_details od1
    JOIN order_details od2 ON od1.orderid = od2.orderid AND od1.productid != od2.productid
    WHERE od1.orderid = NEW.orderid
    GROUP BY od1.orderid, od1.productid, od2.productid, od2.description
    ON CONFLICT (customerid, productid, companion_productid) DO UPDATE SET
        frequency = EXCLUDED.frequency,
        confidence_score = EXCLUDED.confidence_score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to detect patterns when order details are added
CREATE TRIGGER trigger_detect_purchase_patterns
    AFTER INSERT ON order_details
    FOR EACH ROW
    EXECUTE FUNCTION detect_purchase_patterns();

-- =====================================================
-- SAMPLE DATA INSERTION (Loyalty Tiers)
-- =====================================================

INSERT INTO loyalty_tiers (tier_name, min_spend, max_spend, discount_percentage, benefits) VALUES
('BRONZE', 0, 499.99, 0, ARRAY['Standard shipping', 'Email support']),
('SILVER', 500, 1999.99, 5, ARRAY['Free shipping', 'Priority support', 'Early access to sales']),
('GOLD', 2000, 4999.99, 10, ARRAY['Free shipping', 'VIP support', 'Exclusive offers', 'Free delivery']),
('PLATINUM', 5000, 999999.99, 15, ARRAY['Free shipping', 'Concierge support', 'Exclusive events', 'Free delivery & setup']);

-- =====================================================
-- VIEWS FOR EASY QUERIES
-- =====================================================

-- Customer Summary View
CREATE VIEW customer_summary AS
SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    c.city,
    c.state,
    ca.total_orders,
    ca.total_spent,
    ca.loyalty_tier,
    ca.days_since_last_order,
    ca.last_order_date
FROM customers c
LEFT JOIN customer_analytics ca ON c.customerid = ca.customerid;

-- Product Recommendations View
CREATE VIEW product_recommendations AS
SELECT 
    productid,
    product_name,
    category,
    total_orders,
    total_revenue,
    frequently_bought_with
FROM product_analytics
WHERE total_orders > 0;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE customers IS 'Customer data imported from loftcustomers CSV';
COMMENT ON TABLE orders IS 'Order data imported from loftorders CSV';
COMMENT ON TABLE order_details IS 'Order line items imported from loftorderdetails CSV';
COMMENT ON TABLE customer_analytics IS 'Derived customer analytics for proactive engagement';
COMMENT ON TABLE product_analytics IS 'Product performance and recommendation data';
COMMENT ON TABLE purchase_patterns IS 'Customer purchase pattern analysis for cross-selling';
COMMENT ON TABLE campaign_triggers IS 'Proactive campaign triggers for chatbot engagement';
COMMENT ON TABLE delivery_tracking IS 'Delivery status tracking for proactive notifications';

-- =====================================================
-- DATABASE READY FOR CHATBOT INTEGRATION
-- ===================================================== 