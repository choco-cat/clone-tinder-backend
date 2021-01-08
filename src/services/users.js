const BASE_URL = 'http://localhost:8090';

export const addUser = async (data) => {
  const response = await fetch(`${BASE_URL}/addUser`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const login = async (data) => {
  const response = await fetch(`${BASE_URL}/loginUser`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  const [user = {}] = await response.json() || [];
  const { password, ...userAuth } = user;
  sessionStorage.setItem('clone-tinder-user', userAuth.id ? JSON.stringify(userAuth) : null);
  return user;
};
