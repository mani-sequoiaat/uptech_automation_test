SELECT DISTINCT ON (f.license_plate_number, f.license_plate_state)
    sf.brand,
    sf.make,
    sf.model,
    f.license_plate_number,
    f.license_plate_state,
    l.location_group,
    l.location_code,
    l.location_name,
    ad.address_1,
    ad.address_2,
    ad.city,
    s.state_code,
    ad.zip
FROM "FleetAgency".fleet f
JOIN "FleetAgency".location l 
    ON f.location_id = l.id
JOIN "MasterData".address ad 
    ON l.address_id = ad.id
JOIN "MasterData".state s 
    ON ad.state_id = s.id
JOIN "FleetAgency".s_fleet sf
    ON f.license_plate_number = sf.license_plate_number
   AND f.license_plate_state = sf.license_plate_state
WHERE f.is_active = TRUE
  AND f.fleet_end_date IS NULL
  AND f.registration_end_date IS NULL  
  AND sf.fleet_as_of_date = CURRENT_DATE - 4
  AND NOT EXISTS (
      SELECT 1
      FROM "FleetAgency".agreements a
      WHERE a.license_plate_number = f.license_plate_number
        AND a.license_plate_state = f.license_plate_state
  )
ORDER BY f.license_plate_number, f.license_plate_state, sf.brand;