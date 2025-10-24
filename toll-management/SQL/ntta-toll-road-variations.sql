SELECT 
    v.id,
    v.variation_type_id,
    v.toll_authority_id,
    v.variation_name,
    v.toll_plaza_id,
    tp.id AS tp_id, 
    tr.id AS tr_id,    
    tp.plaza_name,
    tp.toll_road_id,
    tr.toll_authority_id AS tr_authority_id,
    v.created_at,
    v.updated_at
FROM "TollAuthority".toll_road tr
JOIN "TollAuthority".variations v 
    ON v.toll_road_id = tr.id
JOIN "TollAuthority".toll_plaza tp
    ON v.toll_road_id = tp.toll_road_id
WHERE tr.toll_authority_id = 1
AND length(v.variation_name) <= 6
AND v.variation_name not in ('PANYNJ', 'NYSTA', 'TBTA');