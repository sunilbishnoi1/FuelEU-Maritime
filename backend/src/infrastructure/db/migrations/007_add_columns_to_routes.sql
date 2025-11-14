ALTER TABLE routes
ADD COLUMN vessel_type VARCHAR(255),
ADD COLUMN fuel_type VARCHAR(255),
ADD COLUMN fuel_consumption NUMERIC,
ADD COLUMN distance NUMERIC,
ADD COLUMN total_emissions NUMERIC;
