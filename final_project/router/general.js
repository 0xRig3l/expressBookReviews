const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("Username and password are required.");

  if (isValid(username)) {
    users.push({ username, password });
    res.send("User registered successfully.");
  } else
    res.status(400).send("Username already exists.");
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book)
    res.send(JSON.stringify(book, null, 4))
  else
    res.status(404).send("Book not found.")
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params
  const booksByAuthor = Object.values(books).filter(b => b.author === author)

  if (booksByAuthor.length > 0)
    res.send(JSON.stringify(booksByAuthor, null, 4))
  else
    res.status(404).send("No books found.")
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const booksByTitle = Object.values(books).filter(b => b.title === title);

  if (booksByTitle.length > 0)
    res.send(JSON.stringify(booksByTitle, null, 4))
  else
    res.status(404).send("Book not found.");
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews;

    if (Object.keys(reviews).length > 0)
      res.send(JSON.stringify(reviews, null, 4))
    else
      res.status(404).send("No reviews found.")

  } else
    res.status(404).send("Book not found.");
});

module.exports.general = public_users;
