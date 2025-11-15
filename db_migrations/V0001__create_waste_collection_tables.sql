CREATE TABLE IF NOT EXISTS waste_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_points (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  metro VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hours VARCHAR(100),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS point_categories (
  point_id INTEGER REFERENCES collection_points(id),
  category_id INTEGER REFERENCES waste_categories(id),
  PRIMARY KEY (point_id, category_id)
);

INSERT INTO waste_categories (code, name, icon, color, description) VALUES
('batteries', 'Батареи и аккумуляторы', 'Battery', 'bg-yellow-100 text-yellow-700', 'Приём батареек, аккумуляторов, источников питания'),
('textiles', 'Текстиль и одежда', 'Shirt', 'bg-pink-100 text-pink-700', 'Старая одежда, обувь, текстильные изделия'),
('tires', 'Шины', 'Circle', 'bg-slate-100 text-slate-700', 'Автомобильные и велосипедные покрышки'),
('lamps', 'Ртутные лампы', 'Lightbulb', 'bg-orange-100 text-orange-700', 'Энергосберегающие и люминесцентные лампы'),
('oil', 'ГСМ', 'Fuel', 'bg-blue-100 text-blue-700', 'Отработанное масло, топливо, смазочные материалы');

INSERT INTO collection_points (name, address, metro, latitude, longitude, hours) VALUES
('ЭкоЦентр на Варшавке', 'Варшавское шоссе, 33', 'Нагатинская', 55.6795, 37.6260, '10:00-20:00'),
('Пункт приёма Вторая Жизнь', 'ул. Профсоюзная, 45', 'Профсоюзная', 55.6774, 37.5629, '09:00-21:00'),
('ГринПоинт Юго-Запад', 'Ленинский просп., 82', 'Юго-Западная', 55.6644, 37.4833, '08:00-22:00'),
('Charity Shop', 'Тверская ул., 12', 'Тверская', 55.7645, 37.6065, '11:00-19:00'),
('Второй Шанс', 'ул. Арбат, 28', 'Арбатская', 55.7513, 37.5902, '10:00-20:00'),
('БлагоДар', 'Кутузовский просп., 15', 'Кутузовская', 55.7423, 37.5353, '09:00-18:00'),
('ШиноПрием', 'МКАД 47 км', 'Выхино', 55.7141, 37.8175, '08:00-20:00'),
('ЭкоШина', 'Каширское шоссе, 112', 'Домодедовская', 55.6138, 37.7185, '09:00-19:00'),
('ЭкоЛампа', 'ул. Гарибальди, 23', 'Новые Черёмушки', 55.6705, 37.5535, '10:00-18:00'),
('БезОпасность', 'Дмитровское шоссе, 71', 'Петровско-Разумовская', 55.8367, 37.5738, '09:00-20:00'),
('МаслоСбор', 'ул. Автозаводская, 16', 'Автозаводская', 55.7065, 37.6565, '08:00-17:00'),
('ЭкоНефть', 'Волгоградский просп., 42', 'Текстильщики', 55.7088, 37.7310, '09:00-18:00');

INSERT INTO point_categories (point_id, category_id) VALUES
(1, 1), (2, 1), (3, 1),
(4, 2), (5, 2), (6, 2),
(7, 3), (8, 3),
(9, 4), (10, 4),
(11, 5), (12, 5);