-- select count(*) from "FleetAgency".agreements
-- where created_at = '2025-08-03 23:57:08.184574'

SELECT a.*
FROM "FleetAgency".agreements a
JOIN "FleetAgency".s_agreements sa
ON a.license_plate_number = sa.license_plate_number
AND a.license_plate_state = sa.license_plate_state
JOIN "Audit".batch b
ON sa.batch_id = b.id
JOIN "Audit".file_details fd
ON b.file_id = fd.id
WHERE fd.filename = $1
and a.checkin_datetime is not null
and a.updated_at is null;