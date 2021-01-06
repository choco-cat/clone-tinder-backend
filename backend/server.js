const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
// TODO при заливке на сервер изменить на адрес сервера
const url = '';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

// init sqlite db
const dbFile = './data/sqlite3.db';
const db = new sqlite3.Database(dbFile);

app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all users in the database
app.get(`${url}/getUsers`, (request, response) => {
  db.all('SELECT * from users', (err, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to get all users in the database
app.get(`${url}/getUser/:id`, (request, response) => {
  db.all('SELECT * from users WHERE id = (?)', request.params.id, (err, rows) => response.send(JSON.stringify(rows)));
});

// endpoint to add a user to the database
app.post(`${url}/addUser`, (request, response) => {
  console.log(`add to users ${request.body.user}`);

  if (!process.env.DISALLOW_WRITE) {
    db.run('INSERT INTO users (?)', request.body.user, (error) => {
      if (error) {
        response.send({ message: 'error!' });
      } else {
        response.send({ message: 'success' });
      }
    });
  }
});
// listen for requests :)
app.listen(8090, () => console.log('Your app is listening on port 8090'));
