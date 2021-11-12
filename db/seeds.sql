INSERT INTO
  department (name)
VALUES
  ("Customer Service"),
  ("Sales"),
  ("Creative"),
  ("Accounting");

INSERT INTO
  role (title, salary, department_id)
VALUES
  ("Call Center Representative", 40000.00, 1),
  ("Team Lead", 50000.00, 1),
  ("Outside Sales", 45000.00, 2),
  ("Inside Sales", 55000.00, 2),
  ("Designer", 100000.00, 3),
  ("Creative Strategist", 125000.00, 3),
  ("Accountant", 150000.00, 4),
  ("Accounting Manager", 190000.00, 4);

INSERT INTO
  employee (first_name, last_name, role_id, manager_id)
VALUES
  ("Scott", "Guenther", 1, 2),
  ("Elijah", "Romer", 2, null),
  ("Karla", "Goo", 3, 4),
  ("Jessica", "Parker", 4, null),
  ("Ronald", "Arceo", 5, 6),
  ("Micah", "Waweru", 6, null),
  ("Mike", "Heer", 7, 8),
  ("Matt", "Nelson", 8, null);