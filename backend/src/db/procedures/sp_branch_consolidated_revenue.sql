-- Branch consolidated revenue across POS, hotel and events for a date range.
DROP PROCEDURE IF EXISTS sp_branch_consolidated_revenue;
DELIMITER $$
CREATE PROCEDURE sp_branch_consolidated_revenue(
  IN p_branch_id BIGINT,
  IN p_from_date DATE,
  IN p_to_date DATE
)
BEGIN
  SELECT
    'POS'               AS stream,
    DATE(p.received_at) AS _date,
    COALESCE(SUM(p.amount), 0) AS revenue
  FROM payments p
  WHERE p.branch_id = p_branch_id
    AND p.order_id IS NOT NULL
    AND p.status = 'COMPLETED'
    AND DATE(p.received_at) BETWEEN p_from_date AND p_to_date
  GROUP BY DATE(p.received_at)

  UNION ALL

  SELECT
    'HOTEL'             AS stream,
    DATE(p.received_at) AS _date,
    COALESCE(SUM(p.amount), 0) AS revenue
  FROM payments p
  WHERE p.branch_id = p_branch_id
    AND p.checkin_id IS NOT NULL
    AND p.status = 'COMPLETED'
    AND DATE(p.received_at) BETWEEN p_from_date AND p_to_date
  GROUP BY DATE(p.received_at)

  UNION ALL

  SELECT
    'EVENTS'            AS stream,
    DATE(ep.paid_at)    AS _date,
    COALESCE(SUM(ep.amount), 0) AS revenue
  FROM event_payments ep
  JOIN events e ON e.id = ep.event_id
  WHERE e.branch_id = p_branch_id
    AND e.status <> 'CANCELLED'
    AND DATE(ep.paid_at) BETWEEN p_from_date AND p_to_date
  GROUP BY DATE(ep.paid_at)

  ORDER BY _date, stream;
END$$
DELIMITER ;