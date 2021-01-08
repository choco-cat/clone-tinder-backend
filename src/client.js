import { addUser, login } from './services/users';

// TODO вынести в хелпер
const md5 = require('md5');

const prepareData = (form) => {
  const data = {};
  [...form.elements].forEach((el) => {
    if (el.getAttribute('name')) {
      const nameField = el.getAttribute('name');
      data[nameField] = nameField === 'password' ? md5(el.value) : el.value;
    }
  });
  return data;
};

// TODO вынести в хелпер
// Если не null, то возвращает все данные по пользователю, обратно - пользователь не авторизован
const getAuthorizedUser = () => sessionStorage.getItem('clone-tinder-user');

const registerForm = document.querySelector('#register-form');

registerForm.onsubmit = (event) => {
// stop our form submission from refreshing the page
  event.preventDefault();
  const data = prepareData(registerForm);
  addUser(data);
};

const loginForm = document.querySelector('#login-form');

loginForm.onsubmit = async (event) => {
// stop our form submission from refreshing the page
  event.preventDefault();
  const data = prepareData(loginForm);
  const loginUser = await login(data);
  if (loginUser.id) {
    console.log('login');
  } else {
    console.log('login wrong');
  }
};
