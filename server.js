const myMailer = require('./nodemailer.js');
const ADMIN_EMAIL = '"Admin" <admin@rstinder.com>';
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const md5 = require('md5');
const morgan = require('morgan');
const dateFormat = require('dateformat');
const winston = require('./config/winston');
// TODO при заливке на сервер изменить на адрес сервера, вынести эти константы в отдельный файл
const dbFile = './data/sqlite3.db';
const URI = '/clone-tinder-api';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('combined', { stream: winston.stream }));
const allowedOrigins = ['http://localhost:8080', 'http://rstinder.com', 'https://rstinder.com'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
})); 

// init sqlite db
const db = new sqlite3.Database(dbFile);

app.get(`${URI}/`, (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.get(`${URI}/logs`, (request, response) => {
    response.sendFile(`${__dirname}/info.txt`);
    winston.level = 'debug';
});

// endpoint to get all users in the database
app.get(`${URI}/users`, (request, response) => {
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
app.post(`${URI}/users/login`, (request, response) => {
  db.all('SELECT * FROM users WHERE email = ? AND password = ?', request.body.email, request.body.password,
      (err, rows) => {
        if (err) {
          winston.error(`${err.status || 500} - ${err.message}`);
          response.status(err.status || 500).send('Server Error!');
        } else {
            if (rows.length > 0 && rows[0].email_status == 0) {
              response.send([{ error: 'no_activation' }]);
            } else {
              response.send(JSON.stringify(rows));
            }
        }
      });
});

// endpoint to activation user registration
app.get(`${URI}/activate/:activationId`, (request, response) => {
    db.run(`UPDATE users SET email_status = 1 WHERE activation_code = '${request.params.activationId}'`, (err) => {
      if (err) {
        winston.error(`${err.status || 500} - ${err.message}`);
        response.status(err.status || 500).send('Server Error!');
      }
      db.all(`SELECT * from users WHERE email_status = 1 AND activation_code = '${request.params.activationId}'`, (err, rows) => {
        if (err) {
          winston.error(`${err.status || 500} - ${err.message}`);
          response.status(err.status || 500).send('Server Error!');
        }
        if(rows.length === 0) {
          response.status(404).sendFile(`${__dirname}/views/404.html`);
        } else {
          response.redirect(`https://${request.host}?activation=true`);
        }
      });
    });
  });

// endpoint to get some user from the database
app.get(`${URI}/users/:id`, (request, response) => {
  db.all(`SELECT * from users WHERE id = ${request.params.id}`, (err, rows) => {
        if (err) {
            winston.error(`${err.status || 500} - ${err.message}`);
            response.status(err.status || 500).send('Server Error!');
        }
        if(rows.length === 0) {
            response.status(404).sendFile(`${__dirname}/views/404.html`);
        } else {
          response.send(JSON.stringify(rows));
        }
    });
});

// endpoint to get passons list from the database
app.get(`${URI}/passions`, (request, response) => {
    db.all('SELECT * from passions', (err, rows) => {
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

// endpoint to get next user to like
app.get(`${URI}/worksheets/:id`, (request, response) => {
  db.all(`SELECT * FROM users WHERE id NOT IN (SELECT recipient FROM likes WHERE sender = ${request.params.id}) AND id <> ${request.params.id} AND (gender_id = (SELECT looking FROM users WHERE id = ${request.params.id}) OR (SELECT looking FROM users WHERE id = ${request.params.id}) = 0) LIMIT 1`, (err, rows) => {
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

// endpoint to get pairs of user from the database
app.get(`${URI}/pairs/:user_id`, (request, response) => {
  db.all(`SELECT * FROM users WHERE id IN (SELECT user2_id as user_id from pairs WHERE user1_id = ${request.params.user_id} 
    UNION SELECT user1_id as user_id from pairs WHERE user2_id = ${request.params.user_id})`, (err, rows) => {
    if (err) {
      winston.error(`${err.status || 500} - ${err.message}`);
      response.status(err.status || 500).send('Server Error!');
    }
      response.send(JSON.stringify(rows));
   })
});

// add a user to the database
app.post(`${URI}/users`, (request, response) => {
  const values = [];
  const fields = Object.keys(request.body);
  fields.forEach((field) => values.push(request.body[field]));
  fields.push('register_date');
  fields.push('activation_code');
  const currentFormatDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  values.push(currentFormatDate);
  const activationCode = md5(currentFormatDate);
  values.push(activationCode);
  if (!process.env.DISALLOW_WRITE) {
    db.run(`INSERT INTO users (${fields.join(',')}) VALUES ("${values.join('","')}")`, (err) => {
      if (err) {
          winston.error(`${err.status || 500} - ${err.message}`);
          response.status(err.status || 500).send('Server Error!');
      } else {
          const activationLink = `http://${request.host}/clone-tinder-api/activate/${activationCode}`;
          const html = `You have registered at rsclone.com.<br />To activate your account, please follow the link:<br /> <a href="${activationLink}">${activationLink}</a>`;
          const subject = "Activation your account on rstinder.com";
          const replyTo = ADMIN_EMAIL;
          myMailer.sendMailToUser(request.body.email, subject, html, ADMIN_EMAIL, replyTo);
          response.send({ message: 'success' });
      }
    });
  }
});

// send feedback form
app.post(`${URI}/mail`, (request, response) => {
  db.all(`SELECT * FROM users WHERE id = ${request.body.id} AND email = "${request.body.email}"`, (err, rows) => {
    if (err) {
      winston.error(`${err.status || 500} - ${err.message}`);
      response.status(err.status || 500).send('Server Error!');
    } else {
      if (rows.length > 0) {
        const sender = `${request.body.email}`;
        const subject = `Feedback form rstinder.com - ${request.body.questionType}`;
        myMailer.sendMailToUser(ADMIN_EMAIL, subject, request.body.message, ADMIN_EMAIL, sender);
        response.send({ message: 'success' });
      } else {
        response.status(404).sendFile(`${__dirname}/views/404.html`);
      }
    }
  });
 });

// update user in the database
app.put(`${URI}/users/:id`, (request, response) => {
  const fields = Object.keys(request.body);
  const query = [];
  fields.forEach((field) => {
    query.push(`${field} = '${request.body[field]}'`);
  });
  db.run(`UPDATE users SET ${query.join(', ')} WHERE id = ${request.params.id}`, (err) => {
    if (err) {
      winston.error(`${err.status || 500} - ${err.message}`);
      response.status(err.status || 500).send('Server Error!');
    }
  });
  db.all(`SELECT * FROM users WHERE id = ${request.params.id}`,
    (error, rows) => response.send(JSON.stringify(rows)));
});

// delete a user from the database
app.delete(`${URI}/users/:id`, (request, response) => {
  if (!process.env.DISALLOW_WRITE) {
    db.run(`DELETE FROM users WHERE id = ${request.params.id}`, (err) => {
      if (err) {
         winston.error(`${err.status || 500} - ${err.message}`);
         response.status(err.status || 500).send('Server Error!');
      } else {
        response.send({ message: 'success' });
      }
    });
  }
});

// add a like
app.post(`${URI}/users/like`, (request, response) => {
  const values = [];
  const fields = Object.keys(request.body);
  fields.forEach((field) => values.push(request.body[field]));
  fields.push('date');
  values.push(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"));
  // add like
  db.run(`INSERT INTO likes (${fields.join(',')}) VALUES ("${values.join('","')}")`, (err) => {
      if (err) {
        winston.error(`${err.status || 500} - ${err.message}`);
        console.log(`INSERT INTO likes (${fields.join(',')}) VALUES ("${values.join('","')}")`);
        response.status(err.status || 500).send('Server Error!');
      } else {
        response.send({ message: 'success' });
      }
    });
  // check pairs - зашито в логике БД, триггер check_pair: проверяется совпадение лайков, если оно есть,
  // а пары такой еще нет, то пара добавляется в таблицу pairs
});

// endpoint to get some user from the database
app.get(`${URI}/usersimport`, (request, response) => {
  var fs = require("fs");
  var contents = fs.readFileSync("users.json");
  var data = JSON.parse(contents);
  data.results.forEach(el => {
    const userName = `${el.name.first} ${el.name.last}`;
    const genderId = el.gender === 'male' ? 1 : 2;
    const location = `${el.location.city}, ${el.location.country}`;
    db.run(`INSERT INTO users (email, password, name, birth, gender_id, photo, location, phone) VALUES ("${el.email}", "${el.login.md5}", "${userName}", "${el.dob.date}", ${genderId}, "${el.picture.large}", "${location}", "${el.phone}")`, (error) => {
      if (error) {
        response.send({ message: `INSERT INTO users (email, password, name, birth, gender_id, photo, location, phone) VALUES ("${el.email}", "${el.login.md5}", "${userName}", "${el.dob.date}", ${genderId}, "${el.picture.large}", "${location}", "${el.phone}")` });
      }
    });
  });
  response.send({ message: 'success' });
});

 app.get(`*`, (request, response) => {
     response.status(404).sendFile(`${__dirname}/views/404.html`);
}); 

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

