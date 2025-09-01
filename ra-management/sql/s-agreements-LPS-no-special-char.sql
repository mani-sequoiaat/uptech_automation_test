SELECT
    sa.id,
    sa.guid,
    sa.batch_id,
    sa.agreement_number,
    sa.fleet_agency_id,
    sa.brand_id,
    sa.brand,
    sa.license_plate_number,
    sa.license_plate_state,
    sa.make,
    sa.model,
    sa.rental_customer_type_id,
    sa.corporate_account,
    sa.checkout_location_id,
    sa.checkout_location_group,
    sa.checkout_location_code,
    sa.checkout_location_name,
    sa.checkout_address_1,
    sa.checkout_address_2,
    sa.checkout_city,
    sa.checkout_state,
    sa.checkout_zip,
    TO_CHAR(sa.checkout_datetime, 'YYYY-MM-DD HH24:MI:SS') AS checkout_datetime,
    sa.estimated_checkin_location_id,
    sa.estimated_checkin_location_group,
    sa.estimated_checkin_location_code,
    sa.estimated_checkin_location_name,
    sa.estimated_checkin_address_1,
    sa.estimated_checkin_address_2,
    sa.estimated_checkin_city,
    sa.estimated_checkin_state,
    sa.estimated_checkin_zip,
    TO_CHAR(sa.estimated_checkin_datetime, 'YYYY-MM-DD HH24:MI:SS') AS estimated_checkin_datetime,
    sa.checkin_location_id,
    sa.checkin_location_group,
    sa.checkin_location_code,
    sa.checkin_location_name,
    sa.checkin_address_1,
    sa.checkin_address_2,
    sa.checkin_city,
    sa.checkin_state,
    sa.checkin_zip,
    TO_CHAR(sa.checkin_datetime, 'YYYY-MM-DD HH24:MI:SS') AS checkin_datetime,
    sa.swap_indicator,
    TO_CHAR(sa.swap_datetime, 'YYYY-MM-DD HH24:MI:SS') AS swap_datetime,
    sa.record_status_id,
    sa.created_at,
    sa.updated_at
FROM "FleetAgency".s_agreements sa
JOIN "FleetAgency".fleet_agency_brand fab ON sa.brand = fab.brand_name
JOIN "Audit".batch b ON sa.batch_id = b.id
JOIN "Audit".file_details fd ON b.file_id = fd.id
JOIN "Audit".types t ON b.batch_type_id = t.id
WHERE 
    fd.filename = $1 AND
    t.name = 'silver to gold' AND (
    sa.license_plate_state ~ '^[A-Za-z]*$'
)