-- Occupancy report per branch for a date range.
DROP PROCEDURE IF EXISTS sp_occupancy_report;
DELIMITER $$
CREATE PROCEDURE sp_occupancy_report(
  IN p_branch_id BIGINT,
  IN p_from_date DATE,
  IN p_to_date DATE
)
BEGIN
  DECLARE v_total_rooms INT DEFAULT 0;
  SELECT COUNT(*) INTO v_total_rooms
  FROM rooms
  WHERE branch_id = p_branch_id AND is_active = 1;

  SELECT
    d.date AS d_date,
    COUNT(DISTINCT CASE
      WHEN (r.check_in_date <= d.date AND r.check_out_date > d.date AND r.status <> 'CANCELLED')
      THEN r.room_id END)                                   AS occupied_rooms,
    v_total_rooms                                            AS total_rooms,
    ROUND(
      COUNT(DISTINCT CASE
        WHEN (r.check_in_date <= d.date AND r.check_out_date > d.date AND r.status <> 'CANCELLED')
        THEN r.room_id END) / NULLIF(v_total_rooms, 0) * 100,
      2
    )                                                        AS occupancy_pct
  FROM (
    SELECT DATE_ADD(p_from_date, INTERVAL seq.seq DAY) AS date
    FROM (
      SELECT 0 AS seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
      UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17
      UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
      UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
      UNION SELECT 30
    ) seq
    WHERE DATE_ADD(p_from_date, INTERVAL seq.seq DAY) <= p_to_date
  ) d
  LEFT JOIN reservations r ON r.branch_id = p_branch_id
  GROUP BY d.date
  ORDER BY d.date;
END$$
DELIMITER ;