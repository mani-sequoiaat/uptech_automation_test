SELECT trt.*
FROM "TollAuthority".toll_rate trt
WHERE (trt.toll_road_id, trt.exit_plaza_id) IN (
    SELECT DISTINCT 
        tr.id AS toll_road_id,
        tp.id AS toll_plaza_id
    FROM "TollAuthority".toll_road tr
    JOIN "TollAuthority".variations v 
        ON v.toll_road_id = tr.id
    JOIN "TollAuthority".toll_plaza tp
        ON tp.toll_road_id = tr.id
    WHERE tr.toll_authority_id = 1
      AND LENGTH(v.variation_name) <= 6
      AND v.variation_name NOT IN ('PANYNJ', 'NYSTA', 'TBTA')
)
ORDER BY trt.id ASC;