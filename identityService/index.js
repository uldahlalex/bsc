const port = process.env.PORT || 3000;
const helpers = require('./helpers.js');
const http = require("http");
const argv = require('minimist')(process.argv.slice(2));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const server = http.createServer(app);
const User = helpers.userModel;

mongoose.connect("mongodb://root:example@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false").then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */ },
    err => { /** handle initial connection error */ }
);
app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!(email && password && first_name && last_name)) {
            res.status(400).send("Invalid request");
        }

        if (await User.findOne({ email })) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            hash: encryptedPassword,
        });

        user.token = jwt.sign(
            {user_id: user._id, email},
            argv['secret'],
            {
                expiresIn: "2h",
            }
        );
        return res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            user.token = jwt.sign(
                {user_id: user._id, email},
                argv['secret'],
                {
                    expiresIn: "2h",
                }
            );
            return res.status(200).json(user);
        }

        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});
app.get("/test", helpers.verifyToken, (req, res) => {
    return res.status(200).send("Welcome. Token accepted");
});

app.use("*", (req, res) => {
    return res.status(404).json({
        success: "false",
        message: "Page not found",
        error: {
            statusCode: 404,
            message: "Route not found",
        },
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});