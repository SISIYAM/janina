const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// Middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.redirect("/login");
    }
    req.user = decoded; // Store decoded token payload in req.user
    next();
  });
}

// Middleware to redirect logged-in users away from the login page
function preventLoginAccess(req, res, next) {
  const token = req.cookies.authToken;
  if (token) {
    jwt.verify(token, SECRET_KEY, (err) => {
      if (!err) {
        return res.redirect("/video"); // Redirect to video page if logged in
      }
      next();
    });
  } else {
    next();
  }
}

// Routes
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

app.get("/login", preventLoginAccess, (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Dummy authentication check
  if (username === "user" && password === "password") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });
    res.redirect("/video");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

app.get("/video", authenticate, (req, res) => {
  res.render("video");
});

// Logout route to clear the token
app.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
