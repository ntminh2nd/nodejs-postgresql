const express = require('express');
const app = express();
const port = 5000;

require('dotenv').config();

app.use(express.json());

app.listen(port, () => {
  console.log(`REST API app is running on port ${port}.`);
});

// Connect to PostgreSQL database
const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

// Config sample data and Action methods
// const employees = [
//     {
//       name: 'Nguyen Van A',
//       age: 22
//     },
//     {
//       name: 'Tran Van B',
//       age: 24
//     },
//     {
//       name: 'Pham Thi C',
//       age: 21
//     }
//   ];

  const getAllEmployees = async (request, response) => {
    pool.query(`SELECT * FROM employees ORDER BY id ASC`, (error, results) => {
        if (error) {
            return response.status(400).send(error);
        }
        return response.status(200).send(results.rows);
    });
  };

  const getEmployeeById = (request, response) => {
    const id = request.params.id;
    pool.query(`SELECT * FROM employees WHERE id = $1`, [id], (error, results) => {
        if (error) {
            return response.status(400).send(error);
        }
        return response.status(200).send(results.rows);
    });
  };

  const addEmployee = async (request, response) => {
    const { name, email, dob } = request.body;
    const dobConverted = new Date(dob);
    // employees.push({ name, email, dob });
    pool.query(`INSERT INTO employees (name, email, dob) VALUES ($1, $2, $3) RETURNING *`, [name, email, dobConverted], (error, results) => {
        if (error) {
            return response.status(400).send(error);
        }
        if (isNaN(dobConverted.getTime())) {
          return response.status(400).send('Invalid date format. Please use YYYY-MM-DD.');
        }
        return response.status(201).send(`Employee added with ID: ${results.rows[0].id}`);
    }); 
  };
  
  const updateEmployee = (request, response) => {
    const id = request.params.id;
    const { name, email, dob } = request.body;
    const dobConverted = new Date(dob);
    // employees[id] = { name, email, dob };
    pool.query(`UPDATE employees SET name = $1, email = $2, dob = $3 WHERE id = $4 RETURNING *`, [name, email, dobConverted, id], (error, results) => {
        if (error) {
            return response.status(400).send(error);
        }
        return response.status(201).send(`Employee modified with ID: ${results.rows[0].id}`);
    }); 
  };
  
  const deleteEmployee = (request, response) => {
    const id = request.params.id;
    const { name, email, dob } = request.body;
    const dobConverted = new Date(dob);
    // employees[id].shift();
    pool.query(`DELETE FROM employees WHERE id = $1 RETURNING *`, [id], (error, results) => {
        if (error) {
            return response.status(400).send(err);
        }
        return response.status(201).send(`Employee deleted with ID: ${results.rows[0].id}`);
    }); 
  };

  module.exports = {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };

  // Create endpoints
  const api = require('./api');

  app.get('/employees/', api.getAllEmployees);
  app.get('/employees/:id', api.getEmployeeById);
  app.post('/employees/', api.addEmployee);
  app.put('/employees/:id', api.updateEmployee);
  app.delete('/employees/:id', api.deleteEmployee);