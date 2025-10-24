SELECT 
    v.id,
    v.variation_type_id,
    v.toll_authority_id,
    v.variation_name,
    v.toll_plaza_id,
    tp.id AS tp_id, 
    tr.id AS tr_id,
    tr.toll_road_name,
    tp.plaza_name,
    tp.toll_road_id,
    tr.toll_authority_id AS tr_authority_id
FROM "TollAuthority".toll_plaza tp
JOIN "TollAuthority".variations v 
    ON v.toll_plaza_id = tp.id
JOIN "TollAuthority".toll_road tr
    ON tp.toll_road_id = tr.id
WHERE tr.id IN (
    SELECT DISTINCT tr.id
    FROM "TollAuthority".toll_road tr
    JOIN "TollAuthority".variations v 
        ON v.toll_road_id = tr.id
    JOIN "TollAuthority".toll_plaza tp
        ON v.toll_road_id = tp.toll_road_id
    WHERE tr.toll_authority_id = 1
      AND LENGTH(v.variation_name) <= 6
      AND v.variation_name NOT IN ('PANYNJ', 'NYSTA', 'TBTA')
)
AND length(v.variation_name) <= 6
ORDER BY tr.id, tp.id;