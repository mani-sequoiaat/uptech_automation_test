SELECT *
FROM "FleetAgency".s_agreements_error sae
JOIN "Audit".batch b ON sae.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
JOIN "FleetAgency".types et ON sae.error_type_id = et.id
WHERE 
    fd.filename = $1 AND
    t.name = 'silver to gold' AND (
    sae.license_plate_number IS NULL AND
    et.name = 'invalid license plate number'
)OR(
    sae.license_plate_state IS NULL AND
    et.name = 'invalid license plate state');
