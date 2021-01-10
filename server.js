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
app.get(`${URL}/getUsers`, (request, response) => {
  db.all('SELECT * from users', (error, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to check user login
app.post(`${URL}/loginUser`, (request, response) => {
  db.all('SELECT * FROM users WHERE email = ? AND password = ?', request.body.email, request.body.password,
    (error, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to get all users in the database
app.get(`${URL}/getUser/:id`, (request, response) => {
  db.all('SELECT * from users WHERE id = (?)', request.params.id, (err, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to add a user to the database
app.post(`${URL}/addUser`, (request, response) => {
  const values = [];
  const fields = Object.keys(request.body);
  fields.forEach((field) => values.push(request.body[field]));
  if (!process.env.DISALLOW_WRITE) {
    db.run(`INSERT INTO users (${fields.join(',')}) VALUES ("${values.join('","')}")`, (error) => {
      if (error) {
        response.send({ message: `INSERT INTO users (${fields.join(',')}) VALUES ("${values.join('","')}")` });
      } else {
        response.send({ message: 'success' });
      }
    });
  }
});
// listen for requests :)
app.listen(8090, () => console.log('Your app is listening on port 8090'));
