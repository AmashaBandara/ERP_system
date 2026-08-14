-- Daily sales summary per branch for a date range.
DROP PROCEDURE IF EXISTS sp_daily_sales_summary;
DELIMITER $$
CREATE PROCEDURE sp_daily_sales_summary(
  IN p_branch_id BIGINT,
  IN p_from_date DATE,
  IN p_to_date DATE
)
BEGIN
  SELECT
    DATE(o.created_at)                                        AS sales_date,
    COUNT(DISTINCT o.id)                                      AS order_count,
    COALESCE(SUM(o.subtotal), 0)                              AS subtotal,
    COALESCE(SUM(o.discount), 0)                              AS discount,
    COALESCE(SUM(o.tax), 0)                                   AS tax,
    COALESCE(SUM(o.grand_total), 0)                           AS grand_total,
    COALESCE(SUM(CASE WHEN o.payment_status = 'PAID' THEN o.grand_total ELSE 0 END), 0) AS collected
  FROM orders o
  WHERE o.branch_id = p_branch_id
    AND DATE(o.created_at) BETWEEN p_from_date AND p_to_date
    AND o.status <> 'CANCELLED'
  GROUP BY DATE(o.created_at)
  ORDER BY DATE(o.created_at);
END$$
DELIMITER ;