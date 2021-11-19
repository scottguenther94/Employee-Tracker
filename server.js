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
db.connect(function (err) {
    if (err) throw err;
    start();
});

// Function to populate the employee array with db data
function employeeArray() {
    employees = [];
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            employees.push(res[i].first_name + " " + res[i].last_name);
        }
    })
}
// Function to populate the role array with db data
function roleArray() {
    roles = [];
    db.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    })
}
// Function to populate the department array with db data
function departmentArray() {
    departments = [];
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
    })
}
// Function to populate the role array with db data
function managerArray() {
    managers = [];
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
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
// Adding data into db using new inquirer prompts
function addDepartment() {
    inquirer.prompt({
        type: "input",
        message: "What is the department called?",
        name: "departmentTitle"
    })
        .then(response => {
            db.query('INSERT INTO department (name) VALUES (?)', response.departmentTitle, (err, result) => {
                if (err) throw err;
                console.log(`Added ${response.departmentTitle} department to the database`);
                runInquirer();
            })
        })
}

function addRole() {
    departmentArray();
    inquirer.prompt([
        {
            type: "input",
            message: "What is the role called?",
            name: "roleTitle"
        },
        {
            type: "number",
            message: "What is the salary for the role?",
            name: "salary"
        },
        {
            type: "list",
            message: "Which department does the role belong to?",
            choices: departmentArray,
            name: "department"
        }
    ])
        .then(response => {
            let departmentId = departmentArray.indexOf(response.department) + 1;
            db.query('INSERT INTO role SET ?',
                {
                    title: response.roleTitle,
                    salary: response.salary,
                    department_id: departmentId,
                },
                function (err) {
                    if (err) throw err;
                    console.log(`Added ${response.roleTitle} role to the database`);
                    console.table(response);
                    runInquirer();
                })
        })
}

function addEmployee() {
    roleArray();
    managerArray();
    inquirer.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "firstName"
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "lastName"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            choices: roleArray,
            name: "role"
        },
        {
            type: "list",
            message: "Who is the employee's manager?",
            choices: managerArray,
            name: "manager"
        },
    ])
        .then(response => {
            let roleId = roleArray.indexOf(response.role) + 1;
            let managerId = managerArray.indexOf(response.manager);
            db.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: response.firstName,
                    last_name: response.lastName,
                    role_id: roleId,
                    manager_id: managerId,
                },
                function (err) {
                    if (err) throw err;
                    console.log(`Added employee: ${response.firstName} ${response.lastName} to the database`);
                    console.table(response);
                    runInquirer();
                })
        })
}
// Update employee information already in database
function updateEmployee() {
    employeeArray();
    roleArray();
    inquirer.prompt([
        {
            type: "list",
            message: "Which employee's role do you want to update?",
            choices: employeeArray,
            name: "employee"
        },
        {
            type: "list",
            message: "Which role do you want to assign the selected employee?",
            choices: roleArray,
            name: "role"
        },
    ])
        .then(response => {
            let employeeId = employeeArray.indexOf(response.employee) + 1;
            let roleId = roleArray.indexOf(response.role) + 1;
            db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId], (err, result) => {
                if (err) throw err;
                console.log(`${response.employee}'s role has been updated to ${response.role}`);
                runInquirer();
            })
        })
}

function updateManager() {
    employeeArray();
    managerArray();
    inquirer.prompt([
        {
            type: "list",
            message: "Which employee's manager do you want to update?",
            choices: employeeArray,
            name: "employee"
        },
        {
            type: "list",
            message: "Who is this employee's manager?",
            choices: managerArray,
            name: "manager"
        },
    ])
        .then(response => {
            let employeeId = employeeArray.indexOf(response.employee) + 1;
            let managerId = managerArray.indexOf(response.manager);
            db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [managerId, employeeId], (err, result) => {
                if (err) throw err;
                console.log(`${response.employee} has been assigned to ${response.manager}`);
                runInquirer();
            })
        })
}

