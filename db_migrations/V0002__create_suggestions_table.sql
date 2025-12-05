CREATE TABLE IF NOT EXISTS t_p52456942_waste_collection_mos.suggestions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES t_p52456942_waste_collection_mos.waste_categories(id),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    metro VARCHAR(100),
    hours VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    user_name VARCHAR(100),
    user_contact VARCHAR(100),
    comment TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);