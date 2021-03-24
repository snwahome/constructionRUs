var router = require('express').Router();
var ProductCategory = require('../models/prod-category');

router.get('/add-category', function(req, resp, next) {
    resp.render('admin/add-prod-category', { message: req.flash('success') });
});


router.post('/add-category', function(req, res, next) {
    var category = new ProductCategory();
    category.name = req.body.name;

    category.save(function(err) {
        if(err) return next(err);
        req.flash('success', 'Successfully Added a New Category');
        return res.redirect('/add-category');
    });
});

module.exports = router;
