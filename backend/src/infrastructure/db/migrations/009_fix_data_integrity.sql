-- Migration 009: Corrective migration to fix data integrity issues
-- Fixes: C2 (seed data mismatch), H4 (UNIQUE constraint), L2 (indexes), M6 (NOT NULL)

-- Step 1: Fix route_id values and populate new columns that were missed by migration 008
-- (Migration 008 targeted 'R001' format but seeds used 'route-001' format)
-- Also update GHG intensity to match specification KPI dataset

UPDATE routes SET
    vessel_type = 'Container',
    fuel_type = 'HFO',
    fuel_consumption = 5000,
    distance = 12000,
    total_emissions = 4500,
    ghg_intensity = 91.0
WHERE route_id = 'route-001';

UPDATE routes SET
    vessel_type = 'BulkCarrier',
    fuel_type = 'LNG',
    fuel_consumption = 4800,
    distance = 11500,
    total_emissions = 4200,
    ghg_intensity = 88.0
WHERE route_id = 'route-002';

UPDATE routes SET
    vessel_type = 'Tanker',
    fuel_type = 'MGO',
    fuel_consumption = 5100,
    distance = 12500,
    total_emissions = 4700,
    ghg_intensity = 93.5
WHERE route_id = 'route-003';

UPDATE routes SET
    vessel_type = 'RoRo',
    fuel_type = 'HFO',
    fuel_consumption = 4900,
    distance = 11800,
    total_emissions = 4300,
    ghg_intensity = 89.2
WHERE route_id = 'route-004';

UPDATE routes SET
    vessel_type = 'Container',
    fuel_type = 'LNG',
    fuel_consumption = 4950,
    distance = 11900,
    total_emissions = 4400,
    ghg_intensity = 90.5
WHERE route_id = 'route-005';

-- Step 2: Add NOT NULL constraints on new route columns
ALTER TABLE routes ALTER COLUMN vessel_type SET NOT NULL;
ALTER TABLE routes ALTER COLUMN fuel_type SET NOT NULL;
ALTER TABLE routes ALTER COLUMN fuel_consumption SET NOT NULL;
ALTER TABLE routes ALTER COLUMN distance SET NOT NULL;
ALTER TABLE routes ALTER COLUMN total_emissions SET NOT NULL;

-- Step 3: Add UNIQUE constraint on (ship_id, year) in ship_compliance (H4)
-- First remove any duplicates (keep the first one)
DELETE FROM ship_compliance a
    USING ship_compliance b
WHERE a.id > b.id
    AND a.ship_id = b.ship_id
    AND a.year = b.year;

ALTER TABLE ship_compliance ADD CONSTRAINT uq_ship_compliance_ship_year UNIQUE (ship_id, year);

-- Step 4: Add indexes for performance (L2)
CREATE INDEX IF NOT EXISTS idx_ship_compliance_ship_id ON ship_compliance (ship_id);
CREATE INDEX IF NOT EXISTS idx_ship_compliance_year ON ship_compliance (year);
CREATE INDEX IF NOT EXISTS idx_bank_entries_ship_id ON bank_entries (ship_id);
CREATE INDEX IF NOT EXISTS idx_bank_entries_year ON bank_entries (year);
CREATE INDEX IF NOT EXISTS idx_bank_entries_ship_year ON bank_entries (ship_id, year);

-- Step 5: Create ships table for proper ship-to-route mapping (H5)
CREATE TABLE IF NOT EXISTS ships (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    route_id VARCHAR(255) NOT NULL REFERENCES routes(route_id)
);

-- Seed ships table with mappings - ships map to routes
INSERT INTO ships (id, name, route_id) VALUES
    ('route-001', 'MV Pacific Explorer', 'route-001'),
    ('route-002', 'MV Atlantic Carrier', 'route-002'),
    ('route-003', 'MT Ocean Tanker', 'route-003'),
    ('route-004', 'MV Nordic Ferry', 'route-004'),
    ('route-005', 'MV Green Voyager', 'route-005'),
    ('ship-001', 'MV Pacific Explorer', 'route-001'),
    ('ship-002', 'MV Atlantic Carrier', 'route-002'),
    ('ship-003', 'MT Ocean Tanker', 'route-003')
ON CONFLICT (id) DO NOTHING;
