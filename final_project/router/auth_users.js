const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some(u => u.username === username);
}

const isAuthenticatedUser = (username, password) => {
  return users.find(u => u.username === username && u.password === password) !== undefined;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).send("Username and password are required.");

  if (isAuthenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: password,
    }, 'access', { expiresIn: '1h' });

    req.session.authorization = {
      accessToken, username
    };

    res.send("User successfully logged in.");
  } else {
    res.status(400).send("Invalid credentials.");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const user = req.session.authorization.username;
  const book = books[isbn];

  if (!book)
    return res.status(404).send("Book not found.")

  book.reviews[user] = review
  res.status(201).send(`Review successfully created for \"${book.title}\"`)
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const user = req.session.authorization.username;
  const book = books[isbn];

  if (!book)
    return res.status(404).send("Book not found");
  if (!book.reviews[user])
    return res.status(404).send("You haven't made a review for this book.");

  delete book.reviews[user];
  res.send(`Review for \"${book.title}\" has been deleted.`);
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
