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
