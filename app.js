var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
var indexRouter = require('./api/index');
var usersRouter = require('./api/user');
var mailRouter = require('./api/mail');

const passport = require('passport');
require('dotenv').config()
var app = express();


var server = require('http').Server(app);
var io = require('socket.io')(server);


//mongoDb connexion
mongoose.set('useCreateIndex', true)
mongoose
.connect(process.env.DB_CONNEXION_STRING, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {

console.log("DB Connection err" + err.message);
});

app.use('/uploads', express.static('uploads'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//CORS bypass
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//initializes the passport configuration.
app.use(passport.initialize());
//imports our configuration file which holds our verification callbacks and things like the secret for signing.

require('./config/passport-config')(passport);


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/mail', mailRouter);

//This simply adds socket.io to res in our event loop
app.use(function(req, res, next){
  res.io = io;
  next();
});


socketEvents = require('./socketEvents')
socketEvents(io)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = {app: app, server: server};
