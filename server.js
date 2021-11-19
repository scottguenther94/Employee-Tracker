// Require mySQL, console.table, Inquirer and establish PORT, db
const mysql = require('mysql2');
const conTable = require('console.table');
const inquirer = require('inquirer');
const PORT = process.env.PORT || 3001;
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PW,
        database: process.env.DB_NAME
    }
);

require('dotenv').config();
// Inquirer prompt arrays
let employees = [];
let roles = [];
let departments = [];
let managers = [];

// Running Inquirer and connect the database
db.connect(function(err) {
    if(err) throw err;
    start();
});

// Function to populate the employee array with db data
function employeeArray() {
    employees = [];
    db.query('SELECT * FROM employee', (err, res) => {
        if(err) throw err;
        for (var i=0; i<res.length; i++) {
            employees.push(res[i].first_name + " " + res[i].last_name);
        }
    })
}
// Function to populate the role array with db data
function roleArray() {
    roles = [];
    db.query('SELECT * FROM role', (err, res) => {
        if(err) throw err;
        for (var i=0; i<res.length; i++) {
            roles.push(res[i].title);
        }
    })
}
// Function to populate the department array with db data
function departmentArray() {
    departments = [];
    db.query('SELECT * FROM department', (err, res) => {
        if(err) throw err;
        for (var i=0; i<res.length; i++) {
            departments.push(res[i].name);
        }
    })
}
// Function to populate the role array with db data
function managerArray() {
    managers = [];
    db.query('SELECT * FROM department', (err, res) => {
        if(err) throw err;
        for (var i=0; i<res.length; i++) {
            managers.push(res[i].first_name + " " + res[i].last_name);
        }
    })
}

function runInquirer() {
    inquirer.prompt({
        type: "list",
        message: "Welcome! Please select an option below.",
        choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role", "update an employee's manager", "exit"],
        name: "firstOption"
    })
    .then(response => {
        console.log(response.firstOption);

        switch (response.firstOption) {
            case "view all departments":
            viewAllDepartments();
            break;
            case "view all roles":
            viewAllRoles();
            break;
            case "view all employees":
            viewAllEmployees();
            break;
            case "add a department":
            addDepartment();
            break;
            case "add a role":
            addRole();
            break;
            case "add an employee":
            addEmployee();
            break;
            case "update an employee role":
            updateEmployee();
            break;
            case "update an employee's manager":
            updateManager();
            default:
            exit();
        }
    })
}
// View data in table format based on user selection
function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;
        console.table(departments);
        runInquirer();
    })    
}
 
function viewAllRoles() {
    db.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id', (err, roles) => {
        if (err) throw err;
        console.table(roles);
        runInquirer();
    })
}
 
function viewAllEmployees() {
    inquirer.prompt({
        type: "list",
        message: "How would you like to sort the list of employees?",
        choices: ["by id", "by department", "by manager"],
        name: "sortEmployees"
    })
        .then(response => {
            db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(m.first_name, " " ,  m.last_name) AS Manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m on employee.manager_id = m.id ORDER ${response.sortEmployees}`, (err, employees) => {
                if (err) throw err;
                console.table(employees);
                runInquirer();
            })
        })
}
