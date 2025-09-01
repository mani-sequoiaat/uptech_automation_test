SELECT * FROM "Audit".file_details fd
JOIN "Audit".types t ON fd.file_status_id = t.id
WHERE fd.filename = $1 AND t.name = 'silver to gold';