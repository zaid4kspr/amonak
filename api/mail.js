
const nodemailer = require('nodemailer');
const router = require('express').Router()
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

// async..await is not allowed in global scope, must use a wrapper
async function main(user, token) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            secure: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'amonakteam@gmail.com', // generated ethereal user
                pass: 'amonak123' // generated ethereal password
            }, tls: {
                rejectUnauthorized: false
            }
        }


    );

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Amonak Support 👻"<amonakteam@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Password Reset ✔', // Subject line
        html: `<b>Hello ${user.username}</b> <br>

        <p>Someone, hopefully you, has requested to reset the password for your Amonak account</p> 
        <p>
        If you did not perform this request, you can safely ignore this email.
Otherwise, click the link below to complete the process.
        </p> 
        <a target="_blank" href="http://localhost:4200/resetPassword/${token}" >
        reset password
        </a>
        
        `// html body
    });

    console.log('Message sent: %s', info.messageId);


}


router.post('/resetPasswordRequest', (req, res) => {
    const email = req.body.email;
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

                payload.id = user._id
                payload.name = user.name
                jwt.sign(payload, secret, { expiresIn: 36000 },
                    (err, token) => {
                        if (err) {
                            res.status(500)
                                .json({
                                    error: "Error signing token",
                                    raw: err
                                });
                        } else {
                            token2send = token
                            main(user, token).then(() => res.status(200).json("mail sent with success"))

                        }

                    });

            }


            // main()
        })
})
router.post('/changePassword', (req, res) => {


    jwt.verify(req.body.token, secret, function (err, decoded) {
        if (err) {
            res.status(403).json("Wrong Token")
            /*
              err = {
                name: 'TokenExpiredError',
                message: 'jwt expired',
                expiredAt: 1408621000
              }
            */
        } else {
         

            bcrypt.genSalt(10, (err, salt) => {
                if (err) res.status(400).json(err)
                bcrypt.hash(req.body.newPassword, salt,
                    (err, hash) => {
                        if (err) res.status(400).json(err)
                      
                        User.updateOne({ _id: decoded.id }, { $set: { password: hash } },
                            (err, raw) => {
                                if (err) res.status(400).json(err)
                                res.status(200).json("password updated with success")
                            }
                        )
                    });
            })



        }
    });



})
module.exports = router;