
const router = require('express').Router()
//Initializes an instance of the Router class.
const User = require('../models/user');
const bcrypt = require('bcryptjs');
//imports the user model and the BcryptJS Library
// BcryptJS is a no setup encryption tool
require('dotenv').config();
const secret = process.env.SECRET || 'pw';
//gives us access to our environment variables 
//and sets the secret object.
const passport = require('passport');
const jwt = require('jsonwebtoken');
//imports Passport and the JsonWebToken library for some utilities
router.post('/register', (req, res) => {
    User.find({ email: req.body.email })
        .then(user => {
            if (user.length) {
                let error = 'Email Address Exists in Database.';
                return res.status(400).json(error);
            } else {
                // 
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    secteur: req.body.secteur,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(newUser.password, salt,
                        (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save().then(user => res.json(user))
                                .catch(err => res.status(400).json(err));
                        });
                });


            }
        });
});





router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    var errors = {
   
        msg: ''
    }
    var payload = {
        id: null,
        name: null
    };
    User.findOne({ email })
        .then(user => {

            if (!user || user == null) {
              

                    errors.msg = "No Account Found";
                    return res.status(404).json(errors);

            


            } else {
     
                    if (user.password) {
                        bcrypt.compare(password, user.password)
                            .then(isMatch => {
                                if (isMatch) {
                                    payload.id = user._id
                                    payload.name = user.name
                                    jwt.sign(payload, secret, { expiresIn: 36000 },
                                        (err, token) => {
                                            if (err) res.status(500)
                                                .json({
                                                    error: "Error signing token",
                                                    raw: err
                                                });
                                            res.json({
                                                success: true,
                                                user: user,
                                                token: `Bearer ${token}`
                                            });
                                        });
                                } else {
                                    errors.msg = "Password is incorrect";
                                    res.status(400).json(errors);
                                }
                            });
                    } else {
                        errors.msg = "social account has a different id";
                        res.status(400).json(errors);
                    }

                }

            

        }).catch(err => {
            res.status(404)
                .json({
                    error: "User Not Found",

                })
        })
});

router.get('/test', passport.authenticate('jwt', { session: false }),(req, res) => {
    User.find().then(data => {
        return res.status(200).json({ users: data })
    })
});

module.exports = router;