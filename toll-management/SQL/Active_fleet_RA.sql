SELECT DISTINCT ON (a.license_plate_number)
  a.id,
  a.license_plate_number,
  a.license_plate_state,
  a.checkout_datetime,
  a.estimated_checkin_datetime,
  a.checkin_datetime,
  a.agreement_status_id,
  a.created_at,
  a.updated_at
FROM "FleetAgency".agreements a
INNER JOIN "FleetAgency".fleet f 
  ON a.license_plate_number = f.license_plate_number
  AND a.license_plate_state = f.license_plate_state
LEFT JOIN "TollProcess".tolls t 
  ON a.license_plate_number = t.license_plate_number 
  AND a.license_plate_state = t.license_plate_state
WHERE f.is_active = TRUE
  AND t.license_plate_number IS NULL  -- Not in tolls table
  and a.estimated_checkin_datetime::date > CURRENT_DATE
  and a.checkin_datetime is null
  and f.fleet_end_date is null
ORDER BY a.license_plate_number ASC, a.created_at DESC;