INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 13 AND c.code IN ('plastic','glass','paper','metal');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 14 AND c.code IN ('textiles');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 15 AND c.code IN ('dangerous');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 16 AND c.code IN ('paper','glass','plastic','metal');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 17 AND c.code IN ('batteries');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 18 AND c.code IN ('dangerous');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 19 AND c.code IN ('textiles','plastic','glass','paper','metal','toys');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 20 AND c.code IN ('batteries');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 21 AND c.code IN ('batteries','lamps','oil');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 22 AND c.code IN ('toys','mixed','textiles');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 23 AND c.code IN ('paper');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 24 AND c.code IN ('textiles','toys');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 25 AND c.code IN ('paper','plastic','glass','metal');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 26 AND c.code IN ('plastic','paper','metal');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 27 AND c.code IN ('paper');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 28 AND c.code IN ('mixed','electronics');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 29 AND c.code IN ('textiles','toys');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 30 AND c.code IN ('mixed');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 31 AND c.code IN ('mixed');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 32 AND c.code IN ('lamps');

INSERT INTO point_categories (point_id, category_id)
SELECT p.id, c.id FROM collection_points p, waste_categories c
WHERE p.id = 33 AND c.code IN ('batteries','lamps');
