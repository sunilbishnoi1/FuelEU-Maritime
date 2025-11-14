UPDATE routes SET
    vessel_type = 'Container',
    fuel_type = 'HFO',
    fuel_consumption = 5000,
    distance = 12000,
    total_emissions = 4500
WHERE route_id = 'R001';

UPDATE routes SET
    vessel_type = 'BulkCarrier',
    fuel_type = 'LNG',
    fuel_consumption = 4800,
    distance = 11500,
    total_emissions = 4200
WHERE route_id = 'R002';

UPDATE routes SET
    vessel_type = 'Tanker',
    fuel_type = 'MGO',
    fuel_consumption = 5100,
    distance = 12500,
    total_emissions = 4700
WHERE route_id = 'R003';

UPDATE routes SET
    vessel_type = 'RoRo',
    fuel_type = 'HFO',
    fuel_consumption = 4900,
    distance = 11800,
    total_emissions = 4300
WHERE route_id = 'R004';

UPDATE routes SET
    vessel_type = 'Container',
    fuel_type = 'LNG',
    fuel_consumption = 4950,
    distance = 11900,
    total_emissions = 4400
WHERE route_id = 'R005';
