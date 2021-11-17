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
