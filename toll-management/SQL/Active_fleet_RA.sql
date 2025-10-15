SELECT 
  a.id AS agreement_id,
  a.license_plate_number,
  a.license_plate_state,
  a.checkout_datetime,
  a.estimated_checkin_datetime,
  a.checkin_datetime
FROM "FleetAgency".agreements a
INNER JOIN "FleetAgency".fleet f
  ON a.license_plate_number = f.license_plate_number
 AND a.license_plate_state = f.license_plate_state
WHERE f.is_active = TRUE
  AND f.fleet_end_date IS NULL
  AND f.registration_end_date IS NULL
ORDER BY a.id asc;
