CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT email_and_or_phone CHECK (num_nonnulls(email, phone) > 0)
);

CREATE TABLE IF NOT EXISTS points_history (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    change INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_id TEXT,
    CONSTRAINT customer_id_fkey FOREIGN KEY (customer_id)
        REFERENCES customers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS points_modifiers (
    id SERIAL PRIMARY KEY,
    modifier NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    CONSTRAINT modifier_greater_than_zero_check CHECK (modifier >= 0::numeric) NOT VALID
);