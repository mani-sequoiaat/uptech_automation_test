SELECT bt.name FROM "Audit".batch b
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types bt ON b.batch_type_id = bt.id
JOIN "Audit".types st ON b.status_type_id = st.id
WHERE fd.filename = $1
AND bt.name = ANY($2::text[])
AND st.name = 'finished';