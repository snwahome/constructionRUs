var router = require('express').Router();
var User = require('../models/user');
var Cart = require('../models/cart');
var passport = require('passport');
var async = require('async');
var passportConf = require('../config/passport');

router.get('/login', function(req, resp) {
    if (req.user) return resp.redirect('/');
    resp.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('login-local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

router.get('/profile', passportConf.isAuthenticated,function(req, resp, next) {
    User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if (err) return next(err);

      resp.render('accounts/profile', { user: foundUser });
    });
});

router.get('/signup', function(req, resp, next) {
    resp.render('accounts/signup', {
        errors: req.flash('errors')
    });
});

router.get('/faqs', function(req, resp, next) {
    resp.render('main/faqs', {
        errors: req.flash('errors')
    });
});

router.post('/signup', function(req, resp) {
    async.waterfall([
        function(callback) {
            var user = new User();

            user.profile.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;
            user.profile.picture = user.gravatar();
        
            User.findOne({ email: req.body.email }, function(err, existingUser) {
                
                if(existingUser) {
                    req.flash('errors', 'Account with the Email Address, Already Exists');
                    return resp.redirect('/signup');
                } else {
                    user.save(function(err, user) {
                        if (err) return next(err);
                        callback(null, user)
                    });
                }
            });
        },

        function(user) {
            var cart = new Cart();
            cart.owner = user._id;
            cart.save(function(err) {
                if(err) return next(err);
                req.logIn(user, function(err) {
                    if(err) return next(err);
                    resp.redirect('/profile');
                 });
            });
        }
    ]);
});

router.get('/logout', function(req, resp, next) {
    req.logout();
    resp.redirect('/');
});

router.get('/edit-profile', function(req, resp, next) {
    resp.render('accounts/edit-profile', { message: req.flash('success')});
});

router.post('/edit-profile', function(req, resp, next) {
    User.findOne({ _id: req.user._id }, function(err, user) {

        if(err) return next(err);

        if(req.body.name) user.profile.name = req.body.name;
        if(req.body.email) user.email = req.body.email;
        if(req.body.address) user.address = req.body.address;

        user.save(function(err)  {
            if(err) return next(err);
            req.flash('success', 'Changes Have Been Successfully Made To Your Profile!');
            return resp.redirect('/edit-profile');
        });
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));

module.exports = router;

