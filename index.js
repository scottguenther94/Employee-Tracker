const db = require('./db/connection');
const inquirer = require('inquirer');
const gradient = require('gradient-string');

function init() {
    startPrompt();
}
console.log(gradient.rainbow('Employee Manager'));

function whatsNext() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do next?",
            name: "next",
            choices: ["go back", "quit"]
        }
    ]).then(response => {
        if (response.next == "go back") {
            startPrompt();
        } else {
            quit();
        }
    })
}

function startPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "initialPrompt",
            choices: ["View All Departments", "Add a Department", "View All Roles", "Add a Role", "View All Employees", "Add an Employee", "Update an Employee Role", "Quit"]
        }
    ]).then(response => {
        console.log(response)
        switch (response.initialPrompt) {
            case "View All Departments":
                viewAllDepartments()
                break;
            case "Add a Department":
                addDepartment()
                break;
            case "View All Roles":
                viewAllRoles()
                break;
            case "Add a Role":
                addRole()
                break;
            case "View All Employees":
                viewAllEmployees()
                break;
            case "Add an Employee":
                addEmployee()
                break;
            case "Update an Employee Role":
                updateEmployeeRole()
                break;
            case "Quit":
                quit();
                break;
            default:
                quit();
        }
    })

}

function viewAllDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        console.table(results);
        whatsNext();
    })
}

function viewAllEmployees() {
    db.query('SELECT * FROM employee', function (err, results) {
        console.table(results);
        whatsNext();
    })
}

function viewAllRoles() {
    db.query('SELECT * FROM role', function (err, results) {
        console.table(results);
        whatsNext();
    })
}

function addRole() {
    db.query('SELECT COUNT(*) FROM role', function (err, result) {
        console.log(result);
        inquirer.prompt([
            {
                type: "input",
                message: "What is role title?",
                name: "title"
            },
            {
                type: "input",
                message: "What is the salary for this role?",
                name: "salary"
            },
            {
                type: "list",
                message: "Pick department",
                name: "department_id",
                choices: departmentIds
            }
        ]).then(response => {
            db.query('INSERT INTO role (title, salary, department_id VALUES (?,?,?)', [response.title, response.salary, response.department_id], function (err, results) {
                console.table(results);
            })
        })
    })

}

function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new department?",
            name: "departmentName"
        }
    ]).then(response => {
        db.query('INSERT INTO department (name) VALUES (?)', response.departmentName, function (err, results) {
            console.table(results);
            viewAllDepartments();
            startPrompt();
        })
    })
}

function addEmployee() {
    db.query('SELECT * FROM employee WHERE manager_id IS NULL', (err, results) => {
        const managerArr = [];
        results.map(managerEl => {
            managerArr.push("ID: " + managerEl.id + " - Name: " + managerEl.first_name + " " + managerEl.last_name)
        })
        console.log(managerArr);
        const employeeArr = [];
        db.query('SELECT * FROM role', (err, results) => {
            results.map(employeeEl => {
            employeeArr.push(employeeEl.title) 
            })
        })
        inquirer.prompt([
            {
                type: "input",
                message: "What is the employee's first name?",
                name: "first_name"
            },
            {
                type: "input",
                message: "What is the employee's last name?",
                name: "last_name"
            },
            {
                type: "list",
                message: "What is the employee's title?",
                name: "role_id",
                choices: employeeArr
            },
            {
                type: "list",
                message: "Who is the employee's manager?",
                name: "manager_id",
                choices: managerArr
            }
        ]).then(response => {
            const managerId = parseInt(response.manager_id.split(" ")[1]);
            const employeeId= parseInt(response.role_id.split)

            db.query('INSERT INTO employee SET ?', { first_name: response.first_name, last_name: response.last_name, role_id: response.role_id, manager_id: managerId, role_id: employeeId }, function (err, results) {
                console.log(err)
                console.table(results)
            })
        })
    })

}

function updateEmployeeRole() {
    // inquirer.prompt([
    //     {

    //     }
    // ])
}

function quit() {
    console.log("Goodbye!");
    process.exit();
}

init();