import { addUser, login, logout } from './services/users';

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
const getAuthorizedUser = () => JSON.parse(sessionStorage.getItem('clone-tinder-user'));

const registerForm = document.querySelector('#register-form');

registerForm.onsubmit = (event) => {
// stop our form submission from refreshing the page
  event.preventDefault();
  const data = prepareData(registerForm);
  addUser(data);
};

const displayAuthorizedUser = () => {
  const currentUser = getAuthorizedUser();
  const currentUserBlock = document.getElementById('current-user');
  const logoutButton = document.getElementById('logout');

  if (currentUser && currentUser.email) {
    currentUserBlock.innerHTML = `${currentUser.name} ${currentUser.email}`;
    logoutButton.style.display = 'block';
  } else {
    currentUserBlock.innerHTML = 'Пользователь не авторизован';
    logoutButton.style.display = 'none';
  }
};

const loginForm = document.querySelector('#login-form');

loginForm.onsubmit = async (event) => {
// stop our form submission from refreshing the page
  event.preventDefault();
  const data = prepareData(loginForm);
  const loginUser = await login(data);
  if (loginUser.id) {
    console.log('login', loginUser);
  } else {
    console.log('login wrong');
  }
  displayAuthorizedUser();
};

document.getElementById('logout').onclick = () => {
  logout();
  displayAuthorizedUser();
};

displayAuthorizedUser();
