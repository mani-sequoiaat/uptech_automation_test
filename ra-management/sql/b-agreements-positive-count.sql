SELECT count(*) FROM "FleetAgency".b_agreements ba
JOIN "Audit".batch b ON ba.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
WHERE t.name = 'bronze to silver' AND fd.filename = $1;