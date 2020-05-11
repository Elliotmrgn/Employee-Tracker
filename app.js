const mysql = require('mysql');
const inquirer = require('inquirer');

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
    inquirer.prompt([
        {
            type: "list",
            name:"MainMenu",
            message:"What would you like to do?",
            choices:["View all employees"]
        }
    ])
}

