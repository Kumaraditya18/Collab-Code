const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
  } catch (err) {
    console.error('Error creating users.json file:', err);
  }
}

const getUsers = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users database:', err);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users database:', err);
  }
};

const findUserByEmailOrUsername = (identifier) => {
  const users = getUsers();
  const lower = identifier.toLowerCase().trim();
  return users.find(
    (u) => u.email.toLowerCase() === lower || u.username.toLowerCase() === lower
  );
};

const findUserById = (id) => {
  const users = getUsers();
  return users.find((u) => u.id === id);
};

const createUser = (userObj) => {
  const users = getUsers();
  users.push(userObj);
  saveUsers(users);
  return userObj;
};

module.exports = {
  getUsers,
  findUserByEmailOrUsername,
  findUserById,
  createUser,
};
