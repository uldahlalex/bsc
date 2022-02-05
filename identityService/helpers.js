const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const argv = require('minimist')(process.argv.slice(2));

exports.userModel = mongoose.model("user", new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
}));

exports.verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, argv['secret']);
        console.log(jwt.decode(token));
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Try again");
    }
    return next();
};

