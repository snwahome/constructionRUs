var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsEngine = require('ejs-mate');
var session = require('express-session')
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport')

var secret = require('./config/secret');
var User = require('./models/user');
var ProductCategory = require('./models/prod-category');

var cartLength = require('./middleware/middleware'); 

var app = express();

mongoose.connect(secret.database, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Conncted to the database");
    }
});

//MiddleWare
app.use(express.static(`${__dirname}/public`));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave:true,
    saveUninitialize:true,
    secret:secret.secretKey,
    store: new MongoStore({ url:secret.database, autoReconnect:true})
}));
app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, resp, next) {
    resp.locals.user = req.user;
    next();
});

app.use(cartLength);

app.use(function(req, resp, next) {
    ProductCategory.find({}, function(err, categories) {
        if (err) return next(err);
        resp.locals.categories = categories;
        next();
    });
});

app.engine('ejs', ejsEngine);
app.set('view engine', 'ejs');


var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
const { Store } = require('express-session');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);


app.listen(secret.port, function (err) {
    if (err) throw err;
    console.log("Server is Running on Port " + secret.port)
});