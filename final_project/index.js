const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.session.authorization
        ? req.session.authorization['accessToken']
        : null

    if (token) {
        jwt.verify(token, "access", (error, user) => {
            if (!error) {
                console.log(user)
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" })
            }
        })
    } else {
        return res.status(403).json({ message: "User not authenticated" })
    }
});

const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
