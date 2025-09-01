SELECT *
FROM "FleetAgency".s_agreements_error sae
JOIN "FleetAgency".fleet_agency_brand fab ON sae.brand = fab.brand_name
JOIN "Audit".batch b ON sae.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
WHERE 
  fd.filename = $1 AND
  t.name = 'bronze to silver' AND (
    sae.license_plate_number IS NULL OR
    sae.license_plate_state IS NULL OR
    sae.license_plate_number <> TRIM(sae.license_plate_number) OR
    sae.license_plate_state <> TRIM(sae.license_plate_state) OR
    sae.license_plate_number !~ '^[A-Za-z0-9 \\-]*$' OR
    sae.license_plate_state !~ '^[A-Z]*$' OR
    LENGTH(sae.license_plate_number) > 12 OR
    LENGTH(sae.license_plate_state) <> 2 OR
    sae.checkout_datetime IS NULL OR
    sae.checkout_datetime > now() OR
    sae.checkout_datetime > sae.estimated_checkin_datetime OR
    sae.checkout_datetime > sae.checkin_datetime OR
    sae.agreement_number IS NULL OR
    sae.brand IS NULL OR
    sae.brand <> fab.brand_name OR
    (sae.license_plate_state, sae.license_plate_number, sae.batch_id) IN (
    SELECT license_plate_state, license_plate_number, batch_id
    FROM "FleetAgency".s_agreements_error
    GROUP BY license_plate_state, license_plate_number, batch_id
    HAVING COUNT(*) = 1
    ) OR
    (sae.swap_indicator = true AND sae.swap_datetime IS NULL)
)