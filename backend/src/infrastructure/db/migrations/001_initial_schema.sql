CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id VARCHAR(255) UNIQUE NOT NULL,
    year INT NOT NULL,
    ghg_intensity NUMERIC NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ship_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    cb_gco2eq NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    amount_gco2eq NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pool_members (
    pool_id UUID NOT NULL REFERENCES pools(id),
    ship_id VARCHAR(255) NOT NULL,
    cb_before NUMERIC NOT NULL,
    cb_after NUMERIC NOT NULL,
    PRIMARY KEY (pool_id, ship_id)
);
