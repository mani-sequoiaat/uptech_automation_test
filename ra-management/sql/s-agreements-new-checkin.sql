-- select count(*) from "FleetAgency".agreements
-- where created_at = '2025-08-03 23:57:08.184574'

SELECT sa.*
FROM "FleetAgency".s_agreements sa
JOIN "Audit".batch b
ON sa.batch_id = b.id
JOIN "Audit".file_details fd
ON b.file_id = fd.id
WHERE fd.filename = $1
and sa.checkin_datetime is not null
and sa.updated_at is null;