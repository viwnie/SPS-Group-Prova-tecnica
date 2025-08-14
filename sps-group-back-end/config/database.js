export const usersDB = [];

export function findUserByEmail(email) {
  return usersDB.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return usersDB.find(user => user.id === id);
}

export function generateUserId() {
  return usersDB.length ? Math.max(...usersDB.map(u => u.id), 0) + 1 : 1;
}
