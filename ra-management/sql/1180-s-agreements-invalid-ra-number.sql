SELECT *
FROM "FleetAgency".s_agreements_error sae
JOIN "Audit".batch b ON sae.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
JOIN "FleetAgency".types et ON sae.error_type_id = et.id
WHERE 
  fd.filename = $1 AND
  t.name = 'silver to gold' AND
  sae.agreement_number IS NULL AND
  et.name = 'invalid rental agreement number';
