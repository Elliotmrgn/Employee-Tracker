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
        .then(answer => {
            switch (answer.mainMenu) {
                case 'View all employees':
                    viewAll('employee');
                    break;
                case 'View all departments':
                    viewAll('department');
                    break;
                case 'View all roles':
                    viewAll('role');
                    break;
                case 'Add employee':
                    addEmployee();
                    break;
            }
        })
}

const viewAll = async (choice) => {
    await connection.query(`SELECT * FROM ${choice}`, (err, res) => {
        if (err) throw err;
        console.clear();
        console.table(res);
        userPrompt();
    })

}

const addEmployee = async () => {
    const roles = await Roles.getRoleTitles();
    const managers = await Managers.getManagerNames();
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
            const managerID = await Managers.matchNameToID(answers.manager);
            await connection.query(
                `INSERT INTO employee SET ?`,
                [{ first_name: answers.firstName, last_name: answers.lastName, role_id: roleID, manager_id: managerID }],
                (err, res) => {
                    if (err) throw err;
                    console.log("Successfully Created New Employee!");
                })
        })
    userPrompt();
}

const Roles = {
    getRoles: async () => {
        const data = await connection.query(`SELECT * FROM role`)
        let roles = []
        data.forEach(row => {
            let current = {};
            current.id = row.id;
            current.title = row.title;
            current.salary = row.salary;
            roles.push(current)
        })
        return roles;
    },

    getRoleIDs: async () => {
        let roleIDs = []
        const getRoles = await Roles.getRoles();
        getRoles.forEach(role => roleIDs.push(role.id))
        return roleIDs
    },

    getRoleTitles: async () => {
        let roleTitles = []
        const getRoles = await Roles.getRoles();
        getRoles.forEach(role => roleTitles.push(role.title))
        return roleTitles
    },
    matchTitleToID: async titleInput => {
        const getRoles = await Roles.getRoles();
        const foundID = getRoles.find(({ title }) => title === titleInput).id;
        return foundID;
    }


}
const Managers = {
    getManagers: async () => {
        const data = await connection.query(`SELECT * FROM employee WHERE manager_id IS NULL`)
        let managers = []
        data.forEach((row) => {
            let current = {}
            current.name = `${row.first_name} ${row.last_name}`;
            current.id = row.id;
            managers.push(current);
        });
        return managers;
    },

    getManagerNames: async () => {
        let managerNames = [];
        const getManagers = await Managers.getManagers();
        getManagers.forEach(manager => managerNames.push(manager.name))
        return managerNames;
    },

    matchNameToID: async nameInput => {
        const getManagers = await Managers.getManagers();
        const foundID = getManagers.find(({ name }) => name === nameInput).id;
        return foundID;
    }
}

userPrompt();