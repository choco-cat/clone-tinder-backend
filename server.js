const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const md5 = require('md5');
// TODO при заливке на сервер изменить на адрес сервера, вынести эти константы в отдельный файл
const URL = '';
const dbFile = './data/sqlite3.db';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(cors());
// init sqlite db
const db = new sqlite3.Database(dbFile);

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all users in the database
app.get(`${URL}/users`, (request, response) => {
  db.all('SELECT * from users', (error, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to check user login
app.post(`${URL}/users/login`, (request, response) => {
  db.all('SELECT * FROM users WHERE email = ? AND password = ?', request.body.email, request.body.password,
    (error, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to get some user from the database
app.get(`${URL}/users/:id`, (request, response) => {
  db.all('SELECT * from users WHERE id = (?)', request.params.id, (err, rows) => response.send(JSON.stringify(rows)));
});

// add a user to the database
app.post(`${URL}/users`, (request, response) => {
  const values = [];
  const fields = Object.keys(request.body);
  fields.forEach((field) => values.push(request.body[field]));
  if (!process.env.DISALLOW_WRITE) {
    db.run(`INSERT INTO users (${fields.join(',')}) VALUES ("${values.join('","')}")`, (error) => {
      if (error) {
        response.send({ message: `Error INSERT new user` });
      } else {
        response.send({ message: 'success' });
      }
    });
  }
});

// update user in the database
app.put(`${URL}/users/:id`, (request, response) => {
  const fields = Object.keys(request.body);
  const query = [];
  fields.forEach((field) => {
    query.push(`${field} = '${request.body[field]}'`);
  });
  db.run(`UPDATE users SET ${query.join(', ')} WHERE id = ${request.params.id}`, (error) => {
    if (error) {
      response.send({ message: `Error UPDATE user` });
    } else {
      //response.send({ message: 'success' });
    }
  });
  db.all(`SELECT * FROM users WHERE id = ${request.params.id}`,
    (error, rows) => response.send(JSON.stringify(rows)));
});

// delete a user from the database
app.delete(`${URL}/users/:id`, (request, response) => {
  if (!process.env.DISALLOW_WRITE) {
    db.run(`DELETE FROM users WHERE id = ${request.params.id}`, (error) => {
      if (error) {
        response.send({ message: `Error DELETE user` });
      } else {
        response.send({ message: 'success' });
      }
    });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

