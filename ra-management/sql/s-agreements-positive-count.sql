SELECT count(*)
FROM "FleetAgency".s_agreements sa
JOIN "FleetAgency".fleet_agency_brand fab ON sa.brand = fab.brand_name
JOIN "Audit".batch b ON sa.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
WHERE 
    fd.filename = $1 AND
    t.name = 'silver to gold' AND (
    sa.license_plate_number IS NOT NULL OR
    sa.license_plate_state IS NOT NULL OR
    sa.license_plate_number = TRIM(sa.license_plate_number) OR
    sa.license_plate_state = TRIM(sa.license_plate_state) OR
    sa.license_plate_number ~ '^[A-Za-z0-9 \\-]*$' OR
    sa.license_plate_state ~ '^[A-Za-z]*$' OR
    LENGTH(sa.license_plate_number) < 12 OR
    LENGTH(sa.license_plate_state) = 2 OR
    sa.checkout_datetime IS NOT NULL OR
    sa.checkout_datetime <= sa.estimated_checkin_datetime OR
    sa.agreement_number IS NOT NULL OR
    (sa.license_plate_state, sa.license_plate_number, sa.batch_id) IN (
        SELECT license_plate_state, license_plate_number, batch_id
        FROM "FleetAgency".s_agreements
        GROUP BY license_plate_state, license_plate_number, batch_id
        HAVING COUNT(*) = 1
    ) OR
    (sa.swap_indicator = true AND sa.swap_datetime IS NOT NULL)
)