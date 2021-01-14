const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const md5 = require('md5');
const morgan = require('morgan');
const winston = require('./config/winston');
// TODO при заливке на сервер изменить на адрес сервера, вынести эти константы в отдельный файл
const URL = '';
const dbFile = './data/sqlite3.db';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('combined', { stream: winston.stream }));
app.use(cors());

// init sqlite db
const db = new sqlite3.Database(dbFile);

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all users in the database
app.get(`${URL}/users`, (request, response) => {
  db.all('SELECT * from users', (err, rows) => {
      if (err) {
          winston.error(`${err.status || 500} - ${err.message}`);
          response.status(err.status || 500).send('Server Error!');
      } else {
          response.send(JSON.stringify(rows));
      }
  });
});

// endpoint to check user login
app.post(`${URL}/users/login`, (request, response) => {
  db.all('SELECT * FROM users WHERE email = ? AND password = ?', request.body.email, request.body.password,
      (err, rows) => {
        if (err) {
          winston.error(`${err.status || 500} - ${err.message}`);
          response.status(err.status || 500).send('Server Error!');
        } else {
            response.send(JSON.stringify(rows));
        }
      });
});


// endpoint to get all users in the database
app.get(`${URL}/users/:id`, (request, response) => {
  db.all('SELECT * from users WHERE id = (?)', request.params.id, (err, rows) => {
     if (err) {
        winston.error(`${err.status || 500} - ${err.message}`);
        response.status(err.status || 500).send('Server Error!');
     }
     if(rows.length === 0) {
         response.status(404).sendFile(`${__dirname}/views/404.html`);
     } else {
         response.send(JSON.stringify(rows));
     }
  })
});

// endpoint to add a user to the database
app.post(`${URL}/users/add`, (request, response) => {
  const values = [];
  const fields = Object.keys(request.body);
  fields.forEach((field) => values.push(request.body[field]));
  if (!process.env.DISALLOW_WRITE) {
    db.run(`INSERT INTO users (${fields.join(',')}) VALUES ("${values.join('","')}")`, (error) => {
      if (error) {
          winston.error(`${err.status || 500} - ${err.message}`);
          response.status(err.status || 500).send('Server Error!');
      } else {
          response.send({ message: 'success' });
      }
    });
  }
});

 app.get('*', (request, response) => {
     response.status(404).sendFile(`${__dirname}/views/404.html`);
});


// listen for requests :)
const listener = app.listen(55475 /*process.env.PORT*/, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

