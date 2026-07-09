const express = require('express');
const axios = require('axios');
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
  const bookList = new Promise((resolve, reject) => {
    setTimeout(() => resolve(JSON.stringify(books, null, 4)), 500)
  })

  bookList.then(list => res.send(list))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = new Promise((resolve, reject) => {
    setTimeout(() => resolve(books[isbn]), 500);
  })

  book.then(b => {
    if (b) {
      res.send(JSON.stringify(b, null, 4))
    } else {
      res.status(404).send("Book not found.")
    }
  })
});

public_users.get('/author/:author', async function (req, res) {
  try {
    const { author } = req.params;
    const response = await axios.get('http://localhost:3000/');
    const booksData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    const booksByAuthor = Object.values(booksData).filter(b => b.author === author);
    
    if (booksByAuthor.length > 0) {
      res.send(JSON.stringify(booksByAuthor, null, 4));
    } else {
      res.status(404).send("Author not found.");
    }
  } catch (error) {
    res.status(500).send("Error fetching book details.");
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const booksByTitle = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(Object.values(books).filter(b => b.title === title))
    }, 500);
  })

  booksByTitle.then(list => {
    if (list.length > 0)
      res.send(JSON.stringify(list, null, 4))
    else
      res.status(404).send("Book not found.");
  });
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
