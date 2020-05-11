const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
const cTable = require('console.table');

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
            choices: ["View all employees", "View all departments", "View all roles", "Add employee"]
        })
        .then(async answer => {
            switch (answer.mainMenu) {
                case 'View all employees':
                    await viewAll('employee');
                    await userPrompt();
                    break;
                case 'View all departments':
                    viewAll('department');
                    break;
                case 'View all roles':
                    viewAll('role');
                    break;
                case 'Add employee':
                    await addEmployee();
                    await userPrompt();
                    break;
            }
        })
}

const viewAll = async (choice) => {
    await connection.query(`SELECT * FROM ${choice}`, (err, res) => {
        if (err) throw err;
        console.table(res);
    })
}

const addEmployee = async () => {
    const roles = await getRoles();
    const managers = await getManagers();
    const mgmtNames = []
    managers.forEach(manager => mgmtNames.push(manager.name))
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
                name: "mgmt",
                choices: [...mgmtNames]
            }
        ]).then(answers => {
            const mgmtID = managers.find(({ name }) => name === answers.mgmt).id
            connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, answers.role, mgmtID])
        })
}

const getRoles = async () => {
    const data = await connection.query(`SELECT title FROM role`)
    let roles = []
    data.forEach(row => {
        let current = {};
        current.title = row.title;
        current.id = row.id;
        roles.push(current)
    })
    return roles;
}

const getManagers = async () => {
    const data = await connection.query(`SELECT * FROM employee WHERE manager_id IS NULL`)
    let managers = []
    data.forEach((row) => {
        let current = {}
        current.name = `${row.first_name} ${row.last_name}`;
        current.id = row.id;
        managers.push(current);
    });
    return managers;
}


userPrompt();