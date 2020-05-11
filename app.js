const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'employee_db'
});

connection.connect(err => {
  if (err) throw err;
  userPrompt();
});

const userPrompt = () => {
    inquirer
    .prompt({
            type: "list",
            name:"mainMenu",
            message:"What would you like to do?",
            choices:["View all employees", "View all departments", "View all roles", "Add employee"]
        })
        .then(answer =>{
            switch (answer.mainMenu){
                case 'View all employees':
                    viewAll('employee');
                    break;
                case 'View all departments':
                    viewAll('department');
                    break;
                case 'View all roles':
                    viewAll('role');
                    break;
            }
        })
}

const viewAll = (choice) =>{
    connection.query(`SELECT * FROM ${choice}`, (err, res) =>{
        if (err) throw err;
        console.table(res);
    })
}