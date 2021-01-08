const md5 = require('md5');

const usersForm = document.forms[0];
const userData = JSON.stringify(usersForm);
console.log(userData);

const prepereData = (form) => {
  const data = {};
  [...form.elements].forEach((el) => {
    if (el.getAttribute('name')) {
      const nameField = el.getAttribute('name');
      data[nameField] = nameField === 'password' ? md5(el.value) : el.value;
    }
  });
  console.log(data);
  return data;
};

usersForm.onsubmit = (event) => {
// stop our form submission from refreshing the page
  event.preventDefault();
  const data = prepereData(usersForm);
  fetch('http://localhost:8090/addUser', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((response) => {
      console.log(JSON.stringify(response));
    });
};
