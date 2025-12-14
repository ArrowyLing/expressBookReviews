const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// returns boolean
const isValid = (username) => {
  return users.some(u => u.username === username);
};


const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// only registered users can login

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User does not exist" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  // Generate JWT access token (1 hour)
  const accessToken = jwt.sign(
    { data: { username } },
    "access",
    { expiresIn: 60 * 60 }
  );

  // Save token + username in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add / modify a book review (query: ?review=xxx)

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

 
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
