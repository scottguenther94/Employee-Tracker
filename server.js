// defining necessary modules/packages and PORT
require('dotenv').config();
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const PORT = process.env.PORT || 3001;
// add a .env file or change properties below
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`Connected to the employees_db database.`)
);
// empty arrays to be used in inquirer prompt choices
let departmentArray = [];
let roleArray = [];
let employeeArray = [];
let managerArray = [];
// functions below to fill arrays with current data from database
function getDepartmentArray() {
    departmentArray = [];
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            departmentArray.push(res[i].name);
        }
    })
}
function getRoleArray() {
    roleArray = [];
    db.query('SELECT * FROM role', (err, res) => {
        for (var i = 0; i < res.length; i++) {
            roleArray.push(res[i].title);
        }
    })
}
function getEmployeeArray() {
    employeeArray = [];
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            employeeArray.push(res[i].first_name + " " + res[i].last_name);
        }
    })
}
function getManagerArray() {
    managerArray = ['no manager'];
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            managerArray.push(res[i].first_name + " " + res[i].last_name);
        }
    })
}
// to establish connection to employees_db database then calling the start function
db.connect(function(err) {
    if (err) throw err;
    start();
});
// displays all available choices then the switch statement executes a function based on the user's response
function start() {
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        choices: ["View departments", "View roles", "View employees", "Add department", "Add role", "Add employee",  "Update employee's role", "Update employee's manager", "Delete a department", "Delete a role", "Delete an employee", "Quit"],
        name: "startChoice"
    })
        .then(response => {
            console.log(response.startChoice);

            switch (response.startChoice) {
                case "View departments":
                    viewDepartments();
                    break;
                case "View roles":
                    viewRoles();
                    break;
                case "View employees":
                    viewEmployees();
                    break;
                case "Add department":
                    addDepartment();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "Add employee":
                    addEmployee();
                    break;
                case "Update employee's role":
                    updateEmployee();
                    break;
                case "Update employee's manager":
                    updateManager();
                    break;
                case "Delete a department":
                    deleteDepartment();
                    break;
                case "Delete a role":
                    deleteRole();
                    break;
                case "Delete an employee":
                    deleteEmployee();
                    break;
                default:
                    quit();
            }
        })
}
// displays departments
function viewDepartments() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;
        console.table(departments);
        start();
    })    
}
// displays roles with their salary and what department they belong to
function viewRoles() {
    db.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id', (err, roles) => {
        if (err) throw err;
        console.table(roles);
        start();
    })
}
// displays employees's details sorted by the user's choice 
function viewEmployees() {
    inquirer.prompt({
        type: "list",
        message: "In what order do you want to view employees?",
        choices: ["by id", "by department", "by manager"],
        name: "employeeOrder"
    })
        .then(response => {
            db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(m.first_name, " " ,  m.last_name) AS Manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m on employee.manager_id = m.id ORDER ${response.employeeOrder}`, (err, employees) => {
                if (err) throw err;
                console.table(employees);
                start();
            })
        })
}
// adds a department named by the user
function addDepartment() {
    inquirer.prompt({
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName"
    })
        .then(response => {
            db.query('INSERT INTO department (name) VALUES (?)', response.departmentName, (err, result) => {
                if (err) throw err;
                console.log(`Added ${response.departmentName} department to the database`);
                start();
            })
        })
}
// adds a role, user determines role, salary, and what department it's under
function addRole() {
    getDepartmentArray();
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the role?",
            name: "roleName"
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
                    title: response.roleName,
                    salary: response.salary,
                    department_id: departmentId,
                },
                function (err) {
                    if (err) throw err;
                    console.log(`Added ${response.roleName} role to the database`);
                    console.table(response);
                    start();
                })
        })
}
// adds an employee, user inputs the name, role, and manager of the employee, 
function addEmployee() {
    getRoleArray();
    getManagerArray();
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
                    start();
                })
        })
}
// updates an existing employee's role
function updateEmployee() {
    getEmployeeArray();
    getRoleArray();
    inquirer.prompt([
        {
            message: "Changing an employee's role will automatically change their salary to the salary of the new role. Press enter to continue.",
            name: "advisory"
        },
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
                start();
            })
        })
}
// updates an existing employee's manager
function updateManager() {
    getEmployeeArray();
    getManagerArray();
    inquirer.prompt([
        {
            message: "First select the employee then choose their manager or no manager to unassign their current manager. Press enter to continue.",
            name: "advisory"
        },
        {
            type: "list",
            message: "Which employee's manager do you want to update?",
            choices: employeeArray,
            name: "employee"
        },
        {
            type: "list",
            message: "Who is the manager of the selected employee?",
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
                start();
            })
        })
}
// deletes a department that the user chooses
function deleteDepartment() {
    getDepartmentArray();
    inquirer.prompt([
        {
            message: "All roles within the department must be deleted before deleting the department. Press enter to continue.",
            name: "advisory"
        },
        {
            type: "list",
            message: "Which department do you want to delete?",
            choices: departmentArray,
            name: "deletedDepartment"
        }
    ])
        .then(response => {
            db.query('DELETE FROM department WHERE name = ?', response.deletedDepartment, (err, res) => {
                if (err) throw err;
                console.log(`${response.deletedDepartment} department has been deleted`);
                start();
            })
        })
}
// deletes a role that the user chooses
function deleteRole() {
    getRoleArray();
    inquirer.prompt([
        {
            message: "No employee must be assigned to the role before attempting to delete it. Press enter to continue.",
            name: "advisory"
        },
        {
            type: "list",
            message: "Which role do you want to delete?",
            choices: roleArray,
            name: "deletedRole"
        }
    ])
        .then(response => {
            db.query('DELETE FROM role WHERE title = ?', response.deletedRole, (err, res) => {
                if (err) throw err;
                console.log(`${response.deletedRole} role has been deleted`);
                start();
            })
        })
}
//deletes an employee that the user chooses
function deleteEmployee() {
    getEmployeeArray();
    inquirer.prompt([
        {
            message: "You cannot delete employees that are currently managers. Press enter to continue.",
            name: "advisory"
        },
        {
            type: "list",
            message: "Which employee do you want to delete?",
            choices: employeeArray,
            name: "deletedEmployee"
        }
    ])
        .then(response => {
            let employeeId = employeeArray.indexOf(response.deletedEmployee) + 1;
            db.query('DELETE FROM employee WHERE id = ?', employeeId, (err, res) => {
                if (err) throw err;
                console.log(`${response.deletedEmployee} has been deleted`);
                start();
            })
        })
}
// closes the application
function quit() {
    process.exit();
}