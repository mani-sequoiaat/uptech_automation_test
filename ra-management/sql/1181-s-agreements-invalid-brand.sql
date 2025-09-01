SELECT *
FROM "FleetAgency".s_agreements_error sae
JOIN "FleetAgency".types t ON sae.error_type_id = t.id
LEFT JOIN "FleetAgency".fleet_agency_brand fab ON sae.brand = fab.brand_name
JOIN "Audit".batch b ON sae.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
JOIN "FleetAgency".types et ON sae.error_type_id = et.id
WHERE 
    fd.filename = $1 AND
    t.name = 'silver to gold' AND (
    (sae.brand IS NULL OR sae.brand <> fab.brand_name) AND
    sae.error_type_id = t.id AND
    et.name = 'invalid fleet agency brand'
)