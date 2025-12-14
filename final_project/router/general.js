const express = require("express");
const axios = require("axios");

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/**
 * Task 6: Register a new user
 * Body: { "username": "...", "password": "..." }
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const alreadyExists =
    (typeof isValid === "function" && isValid(username)) ||
    users.some((u) => u.username === username);

  if (alreadyExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});


// base: all books
public_users.get("/books", (req, res) => {
  return res.json(books);
});

// base: book by isbn
public_users.get("/books/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  return res.json({ [isbn]: books[isbn] });
});

// base: books by author
public_users.get("/books/author/:author", (req, res) => {
  const author = req.params.author?.toLowerCase();
  const result = {};

  Object.keys(books).forEach((key) => {
    const a = books[key]?.author;
    if (typeof a === "string" && a.toLowerCase() === author) {
      result[key] = books[key];
    }
  });

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found for the given author" });
  }
  return res.json(result);
});

// base: books by title
public_users.get("/books/title/:title", (req, res) => {
  const title = req.params.title?.toLowerCase();
  const result = {};

  Object.keys(books).forEach((key) => {
    const t = books[key]?.title;
    if (typeof t === "string" && t.toLowerCase() === title) {
      result[key] = books[key];
    }
  });

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found for the given title" });
  }
  return res.json(result);
});

/*

function getBaseUrl(req) {
  // e.g. http://localhost:5000
  return `${req.protocol}://${req.get("host")}`;
}

/**
 * Task 10 (Async/Await + Axios): Get all books
 * Endpoint: GET /
 */
public_users.get("/", async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/books`);
    return res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

/**
 * Task 11 (Async/Await + Axios): Get book by ISBN
 * Endpoint: GET /isbn/:isbn
 */
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/books/isbn/${isbn}`);
    return res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    const status = err?.response?.status || 500;
    const msg = err?.response?.data?.message || "Error fetching book by ISBN";
    return res.status(status).json({ message: msg });
  }
});

/**
 * Task 12 (Async/Await + Axios): Get books by author
 * Endpoint: GET /author/:author
 */
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/books/author/${encodeURIComponent(author)}`);
    return res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    const status = err?.response?.status || 500;
    const msg = err?.response?.data?.message || "Error fetching books by author";
    return res.status(status).json({ message: msg });
  }
});

/**
 * Task 13 (Async/Await + Axios): Get books by title
 * Endpoint: GET /title/:title
 */
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/books/title/${encodeURIComponent(title)}`);
    return res.send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    const status = err?.response?.status || 500;
    const msg = err?.response?.data?.message || "Error fetching books by title";
    return res.status(status).json({ message: msg });
  }
});

/*

 * Endpoint: GET /review/:isbn
 */
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.send(JSON.stringify(books[isbn].reviews || {}, null, 4));
});

module.exports.general = public_users;
