-- =====================================================
-- Chatbot SQL Queries for Proactive Analytics
-- =====================================================

-- =====================================================
-- CUSTOMER IDENTIFICATION QUERIES
-- =====================================================

-- Get customer by phone number
SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    c.address1,
    c.city,
    c.state,
    c.zipcode,
    ca.total_orders,
    ca.total_spent,
    ca.loyalty_tier,
    ca.days_since_last_order
FROM customers c
LEFT JOIN customer_analytics ca ON c.customerid = ca.customerid
WHERE c.phonenumber = '407-288-6040';

-- Get customer by email
SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    c.address1,
    c.city,
    c.state,
    c.zipcode,
    ca.total_orders,
    ca.total_spent,
    ca.loyalty_tier,
    ca.days_since_last_order
FROM customers c
LEFT JOIN customer_analytics ca ON c.customerid = ca.customerid
WHERE c.email = 'jdan4sure@yahoo.com';

-- =====================================================
-- ORDER HISTORY QUERIES
-- =====================================================

-- Get customer's order history
SELECT 
    o.orderid,
    o.orderdate,
    o.status,
    o.sum,
    o.deliverydate,
    o.deliverytype,
    COUNT(od.id) as item_count
FROM orders o
LEFT JOIN order_details od ON o.orderid = od.orderid
WHERE o.customerid = '9318667506'
GROUP BY o.orderid, o.orderdate, o.status, o.sum, o.deliverydate, o.deliverytype
ORDER BY o.orderdate DESC;

-- Get detailed order information
SELECT 
    od.orderid,
    od.lineid,
    od.productid,
    od.description,
    od.qtyordered,
    od.itemprice,
    od.delivereditemprice,
    o.deliverydate,
    o.status
FROM order_details od
JOIN orders o ON od.orderid = o.orderid
WHERE od.orderid = '0710544II27'
ORDER BY od.lineid;

-- =====================================================
-- LOYALTY PROGRAM QUERIES
-- =====================================================

-- Check if customer qualifies for loyalty upgrade
SELECT 
    c.firstname,
    c.lastname,
    ca.total_spent,
    ca.loyalty_tier,
    lt.tier_name as next_tier,
    lt.min_spend as next_tier_min,
    (lt.min_spend - ca.total_spent) as amount_needed
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
JOIN loyalty_tiers lt ON lt.tier_name = 
    CASE 
        WHEN ca.total_spent >= 5000 THEN 'PLATINUM'
        WHEN ca.total_spent >= 2000 THEN 'GOLD'
        WHEN ca.total_spent >= 500 THEN 'SILVER'
        ELSE 'BRONZE'
    END
WHERE c.customerid = '9318667506';

-- Get customers at risk of churning (no orders in 90+ days)
SELECT 
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    ca.days_since_last_order,
    ca.total_spent,
    ca.loyalty_tier
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
WHERE ca.days_since_last_order >= 90
ORDER BY ca.days_since_last_order DESC;

-- =====================================================
-- PRODUCT RECOMMENDATION QUERIES
-- =====================================================

-- Get products frequently bought together
SELECT 
    od1.productid as main_product,
    od1.description as main_product_name,
    od2.productid as companion_product,
    od2.description as companion_product_name,
    COUNT(*) as frequency,
    (COUNT(*) * 100.0 / total_orders.total_count) as confidence_percentage
FROM order_details od1
JOIN order_details od2 ON od1.orderid = od2.orderid 
    AND od1.productid != od2.productid
JOIN (
    SELECT productid, COUNT(DISTINCT orderid) as total_count
    FROM order_details
    WHERE productid = '353192023'
    GROUP BY productid
) total_orders ON od1.productid = total_orders.productid
WHERE od1.productid = '353192023'
GROUP BY od1.productid, od1.description, od2.productid, od2.description, total_orders.total_count
ORDER BY frequency DESC
LIMIT 5;

-- Get customer's favorite product categories
SELECT 
    pa.category,
    COUNT(*) as purchase_count,
    SUM(od.itemprice * od.qtyordered) as total_spent
FROM order_details od
JOIN orders o ON od.orderid = o.orderid
JOIN product_analytics pa ON od.productid = pa.productid
WHERE o.customerid = '9318667506'
GROUP BY pa.category
ORDER BY total_spent DESC;

-- =====================================================
-- DELIVERY TRACKING QUERIES
-- =====================================================

-- Get upcoming deliveries
SELECT 
    c.firstname,
    c.lastname,
    c.phonenumber,
    o.orderid,
    o.deliverydate,
    o.status,
    COUNT(od.id) as item_count,
    o.sum as total_amount
FROM orders o
JOIN customers c ON o.customerid = c.customerid
LEFT JOIN order_details od ON o.orderid = od.orderid
WHERE o.deliverydate >= CURRENT_DATE
    AND o.deliverydate <= CURRENT_DATE + INTERVAL '7 days'
    AND o.status IN ('O', 'F')
GROUP BY c.firstname, c.lastname, c.phonenumber, o.orderid, o.deliverydate, o.status, o.sum
ORDER BY o.deliverydate;

-- Get delayed deliveries
SELECT 
    c.firstname,
    c.lastname,
    c.phonenumber,
    o.orderid,
    o.deliverydate,
    o.status,
    (CURRENT_DATE - o.deliverydate) as days_delayed
FROM orders o
JOIN customers c ON o.customerid = c.customerid
WHERE o.deliverydate < CURRENT_DATE
    AND o.status IN ('O', 'F')
ORDER BY days_delayed DESC;

-- =====================================================
-- CROSS-SELLING QUERIES
-- =====================================================

-- Get customers who bought specific product and suggest companions
SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    od1.description as purchased_product,
    od2.description as suggested_product,
    pp.confidence_score
FROM customers c
JOIN orders o ON c.customerid = o.customerid
JOIN order_details od1 ON o.orderid = od1.orderid
JOIN purchase_patterns pp ON od1.productid = pp.productid
JOIN order_details od2 ON pp.companion_productid = od2.productid
WHERE od1.productid = '353192023'  -- Repose Avenue Sectional
    AND pp.confidence_score > 50
ORDER BY pp.confidence_score DESC;

-- =====================================================
-- RETENTION QUERIES
-- =====================================================

-- Get customers who haven't ordered recently
SELECT 
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    ca.days_since_last_order,
    ca.total_spent,
    ca.loyalty_tier,
    ca.favorite_product_category
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
WHERE ca.days_since_last_order BETWEEN 30 AND 90
    AND ca.total_spent > 100
ORDER BY ca.total_spent DESC;

-- =====================================================
-- REVENUE ANALYTICS QUERIES
-- =====================================================

-- Get top customers by revenue
SELECT 
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    ca.total_spent,
    ca.total_orders,
    ca.loyalty_tier,
    ca.average_order_value
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
WHERE ca.total_spent > 0
ORDER BY ca.total_spent DESC
LIMIT 20;

-- Get customers who recently upgraded loyalty tier
SELECT 
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    ca.loyalty_tier,
    ca.total_spent,
    ca.last_order_date
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
WHERE ca.loyalty_tier IN ('GOLD', 'PLATINUM')
    AND ca.last_order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY ca.total_spent DESC;

-- =====================================================
-- PRODUCT PERFORMANCE QUERIES
-- =====================================================

-- Get best selling products
SELECT 
    productid,
    product_name,
    category,
    total_orders,
    total_revenue,
    average_price
FROM product_analytics
WHERE total_orders > 0
ORDER BY total_revenue DESC
LIMIT 20;

-- Get products with high cross-sell potential
SELECT 
    pp.productid,
    pa.product_name,
    pa.category,
    COUNT(DISTINCT pp.companion_productid) as companion_count,
    AVG(pp.confidence_score) as avg_confidence
FROM purchase_patterns pp
JOIN product_analytics pa ON pp.productid = pa.productid
WHERE pp.confidence_score > 30
GROUP BY pp.productid, pa.product_name, pa.category
ORDER BY avg_confidence DESC
LIMIT 20;

-- =====================================================
-- CAMPAIGN TRIGGER QUERIES
-- =====================================================

-- Get customers eligible for loyalty upgrade campaign
SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    ca.total_spent,
    ca.loyalty_tier,
    lt.next_tier,
    (lt.min_spend - ca.total_spent) as amount_needed
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
JOIN (
    SELECT 
        tier_name,
        LEAD(tier_name) OVER (ORDER BY min_spend) as next_tier,
        LEAD(min_spend) OVER (ORDER BY min_spend) as min_spend
    FROM loyalty_tiers
) lt ON ca.loyalty_tier = lt.tier_name
WHERE ca.total_spent >= (lt.min_spend * 0.8)  -- Within 20% of next tier
    AND ca.last_order_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY amount_needed;

-- Get customers for cross-selling campaign
SELECT 
    c.customerid,
    c.firstname,
    c.lastname,
    c.email,
    c.phonenumber,
    od.description as purchased_product,
    pp.companion_product_name,
    pp.confidence_score
FROM customers c
JOIN orders o ON c.customerid = o.customerid
JOIN order_details od ON o.orderid = od.orderid
JOIN purchase_patterns pp ON od.productid = pp.productid
WHERE o.orderdate >= CURRENT_DATE - INTERVAL '30 days'
    AND pp.confidence_score > 60
    AND NOT EXISTS (
        SELECT 1 FROM order_details od2 
        JOIN orders o2 ON od2.orderid = o2.orderid
        WHERE o2.customerid = c.customerid 
            AND od2.productid = pp.companion_productid
    )
ORDER BY pp.confidence_score DESC;

-- =====================================================
-- DATABASE READY FOR CHATBOT INTEGRATION
-- ===================================================== 