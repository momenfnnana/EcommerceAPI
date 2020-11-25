const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");

const { errorHandler } = require("../helper/dbErrorHandler");

exports.signup = (req, res) => {
    console.log("req.body", req.body);
    const user = new User(req.body)
    user.save((error, user) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            })
        }
        user.salt = undefined;
        user.hased_password = undefined;
        res.json({ user })
    })
};

exports.signin = (req, res) => {
    console.log("req.body", req.body);
    const { email, password } = new User(req.body)
    User.findOne({ email }, (error, user) => {
        if (error || !user) {
            return res.status(400).json({
                error: "User with that emial not found. Please signup"
            })
        }
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password dont match"
            })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
        res.cookie("access_token", token, { expire: new Date() + 9999 })
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, email, name, role } })
    })
};

exports.signout = (req, res) => {
    res.clearCookie('access_token')
    res.json({ message: "Signout success" });
}