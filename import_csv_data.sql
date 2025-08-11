-- =====================================================
-- CSV Data Import Script for Woodstock Outlet Database
-- =====================================================

-- Make sure you're connected to the database
-- \c woodstock_outlet_chatbot;

-- =====================================================
-- IMPORT CUSTOMERS DATA
-- =====================================================

-- Import customers from loftcustomers_202507110919.csv
COPY customers (
    customerid, firstname, middlename, lastname, phonenumber, 
    businessphone, extension, address1, address2, city, state, 
    zipcode, countryid, email, shipemail, type, accountopendate, 
    taxexemptionid, taxexemptionnumber, companyname, markerid, 
    ssn, memo, noemail, interfacedforsalescube, interfacedforforecasting
) FROM '/path/to/your/loftcustomers_202507110919.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- =====================================================
-- IMPORT ORDERS DATA
-- =====================================================

-- Import orders from loftorders_202507110918.csv
COPY orders (
    orderid, type, orderdate, ordertime, status, customerid, 
    ordersiteid, salesperson1, salesperson2, percentofsale1, 
    percentofsale2, fromsiteid, deliverytype, deliverydate, 
    closeddate, closedsiteid, promisedate, mainorderid, sequence, 
    originalsaleid, adjustedorderid, adjustmentreasonid, autoadjustment, 
    autosequence, massclose, discountid, setupcharge, tax, taxruleid, 
    taxexemptionid, deliverycharge, shipfirstname, shiplastname, 
    shipcompanyname, shipaddress1, shipaddress2, shipcity, shipstate, 
    shipzipcode, shipcountryid, shipzoneid, shipphonenumber, 
    shipbusinessphone, shipextension, shipemail, closedby, createdby, 
    markerid, financecompanyid, layawaysale, takewithsale, 
    tentativefinancedamount, requestedfinancedamount, approvalcode, 
    approvaldate, printedby, printapprovedby, printedfrom, lastprinted, 
    receiptprintcount, printedbyscreen, reserveuntil, approvalcodesequence, 
    voidreasonid, version, interfacedforsalescube, interfacedforforecasting, 
    deleteorder
) FROM '/path/to/your/loftorders_202507110918.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- =====================================================
-- IMPORT ORDER DETAILS DATA
-- =====================================================

-- Import order details from loftorderdetails_202507110918.csv
COPY order_details (
    orderid, lineid, productid, qtyordered, itemprice, voided, 
    voiddate, fillsiteid, filllocationid, commissiontype, spiff, 
    originalinventorycost, filldate, inventorycostdate, inventoryreceiptdate, 
    addeddate, fillfromsiteid, fillfromlocationid, mainorderid, packageid, 
    salesperson1, salesperson2, percentofsale1, percentofsale2, picked, 
    upcharge, discount, valueforproductid, valueforlineid, valueproductid, 
    valueproductlineid, warrantyproductid, warrantyproductlineid, deliverypoints, 
    takenwith, setup, pickupdiscount, setupcommission, deliverycommission, 
    taxruleid, taxliability, taxbasis, customertax, retailertax, priceauthorizedby, 
    leaveincarton, outletid, outletstatusid, outletdate, serialnumber, outletcomment, 
    originalprice, originalalacarteprice, originalregularprice, promotionid, 
    adjustmentreasonid, autoadjusteduid, autoadjustedvoided, storecardloaded, 
    addedbyapp, interfacedforsalescube, interfacedforforecasting, auditaction, 
    oldorderid, oldlineid, priceoverridereason, lineadded, totalothercost, 
    deleteline, returnlinematched
) FROM '/path/to/your/loftorderdetails_202507110918.csv' 
WITH (FORMAT csv, HEADER true, NULL '');

-- =====================================================
-- POPULATE ANALYTICS TABLES
-- =====================================================

-- Populate customer analytics
INSERT INTO customer_analytics (
    customerid, total_orders, total_spent, first_order_date, 
    last_order_date, average_order_value, loyalty_tier, days_since_last_order
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
GROUP BY c.customerid;

-- Populate product analytics
INSERT INTO product_analytics (
    productid, product_name, total_orders, total_quantity_sold, 
    total_revenue, average_price, category
)
SELECT 
    od.productid,
    od.description as product_name,
    COUNT(DISTINCT od.orderid) as total_orders,
    SUM(od.qtyordered) as total_quantity_sold,
    SUM(od.itemprice * od.qtyordered) as total_revenue,
    AVG(od.itemprice) as average_price,
    CASE 
        WHEN od.description ILIKE '%sofa%' OR od.description ILIKE '%sectional%' THEN 'Sofas'
        WHEN od.description ILIKE '%mattress%' OR od.description ILIKE '%bed%' THEN 'Mattresses'
        WHEN od.description ILIKE '%chair%' OR od.description ILIKE '%recliner%' THEN 'Chairs'
        WHEN od.description ILIKE '%table%' OR od.description ILIKE '%desk%' THEN 'Tables'
        ELSE 'Other'
    END as category
FROM order_details od
WHERE od.voided = FALSE
GROUP BY od.productid, od.description;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check import results
SELECT 'Customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'Order Details' as table_name, COUNT(*) as record_count FROM order_details
UNION ALL
SELECT 'Customer Analytics' as table_name, COUNT(*) as record_count FROM customer_analytics
UNION ALL
SELECT 'Product Analytics' as table_name, COUNT(*) as record_count FROM product_analytics;

-- Sample customer data
SELECT 
    c.firstname, 
    c.lastname, 
    c.email, 
    ca.total_orders, 
    ca.total_spent, 
    ca.loyalty_tier
FROM customers c
JOIN customer_analytics ca ON c.customerid = ca.customerid
LIMIT 10;

-- Sample product data
SELECT 
    productid, 
    product_name, 
    total_orders, 
    total_revenue, 
    category
FROM product_analytics
WHERE total_orders > 0
ORDER BY total_revenue DESC
LIMIT 10;

-- =====================================================
-- DATABASE READY FOR CHATBOT QUERIES
-- ===================================================== 