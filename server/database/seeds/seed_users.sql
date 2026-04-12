-- Seed: Sample users and listings for development
-- Password for all users is: Password123
-- Hash generated with bcrypt rounds=12

INSERT INTO users (name, email, password, role, phone, area, business_name, bio) VALUES
  ('Admin User',       'admin@foodbridge.co.za',    '$2a$12$placeholderHashForAdminUser000000000000', 'admin',    NULL,           NULL,        NULL,             NULL),
  ('Thabo Mokoena',    'thabo@example.com',          '$2a$12$placeholderHashForProducer10000000000', 'producer', '0712345678',   'Soshanguve', 'Thabo''s Kitchen', 'Home-cooked meals made with love every day.'),
  ('Naledi Dlamini',   'naledi@example.com',         '$2a$12$placeholderHashForProducer20000000000', 'producer', '0823456789',   'Mamelodi',   'Naledi Veggies',   'Fresh vegetables straight from my garden.'),
  ('Sipho Ndlovu',     'sipho@example.com',          '$2a$12$placeholderHashForConsumer10000000000', 'consumer', '0634567890',   'Pretoria',   NULL,               NULL)
ON CONFLICT (email) DO NOTHING;

-- Note: Replace placeholder hashes with real bcrypt hashes before using.
-- Generate in Node: const bcrypt = require('bcryptjs'); bcrypt.hash('Password123', 12).then(console.log)
