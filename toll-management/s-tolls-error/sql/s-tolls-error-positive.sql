SELECT * FROM "FleetAgency".s_tolls_error ste, "FleetAgency".fleet_agency_brand fab
WHERE ste.batch_id = $1 AND (
    ste.license_plate_number IS NULL OR
    ste.license_plate_state IS NULL OR
    ste.license_plate_number <> TRIM(ste.license_plate_number) OR
    ste.license_plate_state <> TRIM(ste.license_plate_state) OR
    ste.license_plate_number !~ '^[A-Za-z0-9 \\-]*$' OR
    ste.license_plate_state !~ '^[A-Za-z]*$' OR
    LENGTH(ste.license_plate_number) >= 12 OR
    LENGTH(ste.license_plate_state) <> 2 OR
    (ste.license_plate_state, ste.license_plate_number, ste.batch_id) IN (
    SELECT license_plate_state, license_plate_number, batch_id
    FROM "FleetAgency".s_tolls_error
    GROUP BY license_plate_state, license_plate_number, batch_id)
)