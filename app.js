const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
const cTable = require('console.table');

//promisifying the database, documentation below
// https://codeburst.io/node-js-mysql-and-promises-4c3be599909b
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

const connection = new Database({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employee_db'
});


const userPrompt = async () => {
    inquirer
        .prompt({
            type: "list",
            name: "mainMenu",
            message: "What would you like to do?",
            choices: ["View all employees", "View all departments", "View all roles", "Add department", "Add role", "Add employee", "Update employee role"]
        })
        .then(answer => {
            switch (answer.mainMenu) {
                case 'View all employees':
                    viewAll(Employees);
                    break;
                case 'View all departments':
                    viewAll(Departments);
                    break;
                case 'View all roles':
                    viewAll(Roles);
                    break;
                case 'Add employee':
                    addEmployee();
                    break;
                case 'Add department':
                    addDepartment();
                    break;
                case 'Add role':
                    addRole();
                    break;
                case 'Update employee role':
                    updateEmployeeRole();
                    break;
            }
        })
}

const viewAll = async (choice) => {
    const display = await choice.getData()
    console.clear();
    console.log("");
    console.table(display)
    userPrompt();
}

const addDepartment = () => {
    inquirer.prompt({
        type: "input",
        name: "departmentName",
        message: "Enter new department name"
    })
        .then(answers => {
            connection.query(`INSERT into department (name) VALUES ("${answers.departmentName}")`)
                .then(() => {
                    console.clear();
                    console.log("Successfully Added Department")
                    userPrompt();
                })
                .catch(err => { if (err) throw err })
        })
}

const addRole = async () => {
    const departments = await Departments.getDepartmentNames();
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Enter new role name"
        },
        {
            type: "input",
            name: "salary",
            message: "Enter new role salary"
        },
        {
            type: "list",
            name: "department",
            message: "What department is this role for?",
            choices: [...departments]
        }
    ]).then(async answers => {
        console.log("addRole -> answers", answers)
        const departmentID = await Departments.matchNameToID(answers.department)
        console.log("addRole -> departmentID", departmentID)
        connection.query(`INSERT INTO role SET ?`, [{ title: answers.title, salary: answers.salary, department_id: departmentID }])
            .then(() => {
                console.clear();
                console.log("Successfully Added Role")
                userPrompt();
            })
            .catch(err => { if (err) throw err })
    })
}

const addEmployee = async () => {
    const roles = await Roles.getRoleTitles();
    const managers = await Employees.getManagerNames();
    await inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter first name: "
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter last name: "
            },
            {
                type: "list",
                message: "What is the employee's role?",
                name: "role",
                choices: [...roles]
            },
            {
                type: "list",
                message: "Who is the employee's manager?",
                name: "manager",
                choices: [...managers]
            }
        ]).then(async answers => {
            const roleID = await Roles.matchTitleToID(answers.role);
            const managerID = await Employees.matchManagerNameToID(answers.manager);
            connection.query(
                `INSERT INTO employee SET ?;`, [{ first_name: answers.firstName, last_name: answers.lastName, role_id: roleID, manager_id: managerID }])
                .then(() => {
                    //console.clear();
                    console.log("Successfully Created New Employee!");
                    userPrompt();
                })
                .catch(err => { if (err) throw err })
        })
}

const updateEmployeeRole = async () => {
    const employees = await Employees.getNames();
    const roles = await Roles.getRoleTitles();
    await inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee would you like to update?",
            choices: [...employees]
        },
        {
            type: "list",
            name: "newRole",
            message: "Which role would you like to give them?",
            choices: [...roles]
        }
    ]).then(async answers => {
        const roleID = await Roles.matchTitleToID(answers.newRole);
        const employeeID = await Employees.matchNameToID(answers.employee)
        await connection.query(`UPDATE employee SET role_id=${roleID} WHERE id=${employeeID}`)
            .then(() => {
                console.clear();
                console.log("Successfully Updated!")
                userPrompt();
            })
            .catch(err => { if (err) throw err })
    })
}

const Departments = {
    getData: async () => { return connection.query(`Select * FROM department`) },

    getDepartmentNames: async () => {
        const names = []
        await connection.query(`SELECT name FROM department`)
            .then(rows => {
                rows.forEach(row => {
                    names.push(row.name)
                })
            })
        return names
    },

    matchNameToID: async (nameInput) => {
        let found;
        await connection.query(`SELECT id FROM department WHERE name = "${nameInput}"`)
            .then(rows => {
                found = rows[0].id
            })

        return found;
    }
}

const Roles = {
    getData: async () => { return connection.query(`SELECT * FROM role`) },

    getRoleIDs: async () => { return connection.query(`SELECT id FROM role`) },

    getRoleTitles: async () => {
        const titles = []
        await connection.query(`SELECT title FROM role`)
            .then(rows => {
                rows.forEach(row => {
                    titles.push(row.title)
                })
            })
        return titles
    },

    matchTitleToID: async titleInput => {
        let found;
        await connection.query(`SELECT id FROM role WHERE title = "${titleInput}"`)
            .then(rows => {
                found = rows[0].id
            })

        return found;
    }


}
const Employees = {

    getData: async () => { return connection.query(`Select * FROM employee`) },

    getEmployees: async (query) => {
        let employees = []
        await connection.query(query)
            .then(rows => {
                rows.forEach((row) => {
                    let current = {}
                    current.name = `${row.first_name} ${row.last_name}`;
                    current.id = row.id;
                    employees.push(current);
                })
            })
        return employees;
    },

    getNames: async (query) => {
        let names = [];
        if (!query) { query = `SELECT * FROM employee` }
        const employees = await Employees.getEmployees(query);
        employees.forEach(manager => names.push(manager.name))
        return names;
    },

    getManagerNames: () => {
        return Employees.getNames(`SELECT * FROM employee WHERE manager_id IS NULL`)
    },
    matchManagerNameToID: (nameInput) => {
        return Employees.matchNameToID(nameInput, `SELECT * FROM employee WHERE manager_id IS NULL`)
    },
    matchNameToID: async (nameInput, query) => {
        if (!query) { query = `SELECT * FROM employee` }
        const employees = await Employees.getEmployees(query);
        const foundID = employees.find(({ name }) => name === nameInput).id;
        return foundID;
    }
}
userPrompt();