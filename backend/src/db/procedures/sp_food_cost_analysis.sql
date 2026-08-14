-- Food cost analysis: cost of goods sold vs sales revenue per product.
DROP PROCEDURE IF EXISTS sp_food_cost_analysis;
DELIMITER $$
CREATE PROCEDURE sp_food_cost_analysis(
  IN p_branch_id BIGINT,
  IN p_from_date DATE,
  IN p_to_date DATE
)
BEGIN
  SELECT
    p.id                                                        AS product_id,
    p.name                                                      AS product_name,
    SUM(oi.qty)                                                 AS qty_sold,
    COALESCE(SUM(oi.line_total), 0)                             AS revenue,
    COALESCE(SUM(oi.qty * p.cost), 0)                           AS food_cost,
    ROUND(
      COALESCE(SUM(oi.qty * p.cost), 0) / NULLIF(SUM(oi.line_total), 0) * 100,
      2
    ) AS food_cost_pct
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE o.branch_id = p_branch_id
    AND DATE(o.created_at) BETWEEN p_from_date AND p_to_date
    AND o.status <> 'CANCELLED'
    AND oi.status <> 'CANCELLED'
  GROUP BY p.id, p.name
  ORDER BY food_cost_pct DESC;
END$$
DELIMITER ;