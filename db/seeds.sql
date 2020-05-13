INSERT into department (name) VALUES ("Sales");
INSERT into department (name) VALUES ("IT");
INSERT into department (name) VALUES ("HR");

INSERT into role (title, salary, department_id) VALUES ("Sales Manager", 100000, 1);
INSERT into role (title, salary, department_id) VALUES ("Sales Representative", 60000, 1);
INSERT into role (title, salary, department_id) VALUES ("IT Manager", 100000, 2);
INSERT into role (title, salary, department_id) VALUES ("Engineer", 75000, 2);
INSERT into role (title, salary, department_id) VALUES ("HR Manager", 85000, 3);
INSERT into role (title, salary, department_id) VALUES ("HR Representative", 85000, 3);

INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Bill", "Smith", 1, null);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Jean", "Monroe", 2, 1);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Claire", "Walters", 2, 1);

INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Angela", "Chapman", 3, null);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Tom", "Wolf", 4, 3);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Liam", "Frye", 4, 3);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Rebecca", "Sinclair", 4, 3);

INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Bob", "Johnson", 5, null);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Amy", "Morales", 6, 5);
INSERT into employee (first_name, last_name, role_id, manager_id) VALUES ("Jack", "Norris", 6, 5);