SELECT * FROM "FleetAgency".s_tolls st
WHERE st.batch_id = $1 AND (
    st.license_plate_number IS NOT NULL OR
    st.license_plate_state IS NOT NULL OR
    st.license_plate_number = TRIM(st.license_plate_number) OR
    st.license_plate_state = TRIM(st.license_plate_state) OR
    st.license_plate_number ~ '^[A-Za-z0-9 \\-]*$' OR
    st.license_plate_state ~ '^[A-Za-z]*$' OR
    LENGTH(st.license_plate_number) < 12 OR
    LENGTH(st.license_plate_state) = 2 OR
    (st.license_plate_state, st.license_plate_number, st.batch_id) IN (
        SELECT license_plate_state, license_plate_number, batch_id
        FROM "FleetAgency".s_tolls
        GROUP BY license_plate_state, license_plate_number, batch_id
        HAVING COUNT(*) = 1
    )
)