var Product = require('../models/product');
var User = require('../models/user');
var Cart = require('../models/cart');
var router = require('express').Router();

const stripe =  require('stripe') ('sk_test_51HF4m4E74Drpedo1Q7B2utWrJpEmwHfTNBFHiq4Y4adKmwDsVeqMNg2bOvvj4C4SI9BMUPKznNxJ6lWhfqSKz6ar00ywRQZfNO');

function paginate(req, resp, next) {
    var perPage = 9;
    var page = req.params.page;
  
    Product
      .find()
      .skip( perPage * page)
      .limit( perPage )
      .populate('category')
      .exec(function(err, products) {
        if (err) return next(err);
        Product.count().exec(function(err, count) {
          if (err) return next(err);
          resp.render('main/product-main', {
            products: products,
            pages: count / perPage
          });
        });
      });
}

Product.createMapping(function(err, mapping) {
    if(err) {
        console.log("There was an Error Creating Mapping");
        console.log(err);
    } else {
        console.log("Mapping for ContrustionRUs, has been Created");
        console.log(mapping);
    }
});

var stream = Product.synchronize();
var count =0;

stream.on('data', function() {
    count++;
});

stream.on('close', function() {
    console.log("Search has Indexed " + count + " documents");
});

stream.on('error', function() {
    console.log(err);
});

router.get('/cart', function(req, resp, next) {
    Cart
      .findOne({ owner: req.user._id })
      .populate('items.item')
      .exec(function(err, foundCart) {
        if (err) return next(err);
        resp.render('main/cart', {
          foundCart: foundCart,
          message: req.flash('remove')
        });
      });
  });

router.post('/product/:product_id', function(req, resp, next) {
    Cart.findOne({ owner: req.user._id }, function(err, cart) {
      cart.items.push({
        item: req.body.product_id,
        price: parseFloat(req.body.priceValue),
        quantity: parseInt(req.body.quantity)
      });
  
      cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
  
      cart.save(function(err) {
        if (err) return next(err);
        return resp.redirect('/cart');
      });
    });
  });

  router.post('/remove', function(req, resp, next) {
    Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
      foundCart.items.pull(String(req.body.item));
  
      foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
      foundCart.save(function(err, found) {
        if (err) return next(err);
        req.flash('remove', 'We Have Successfully Removed the Items from the Cart');
        resp.redirect('/cart');
      });
    });
  });

router.post('/search', function(req, resp, next) {
    resp.redirect('/search?q=' + req.body.q);
  });
  
router.get('/search', function(req, resp, next) {
if (req.query.q) {
    Product.search({
    query_string: { query: req.query.q}
    }, function(err, results) {
    results:
    if (err) return next(err);
    var data = results.hits.hits.map(function(hit) {
        return hit;
    });
    resp.render('main/search-results', {
        query: req.query.q,
        data: data
    });
    });
}
});

router.get('/', function (req, resp, next) {

    if(req.user) {
        paginate(req, resp, next);

    } else {
        resp.render('main/home');
    }
});

router.get('/page/:page', function(req, resp, next) {
    paginate(req, resp, next);
}); 

router.get('/about', function (req, resp) {
    resp.render('main/about');
});

router.get('/products/:id', function (req, resp, next) {
    Product
        .find({ category: req.params.id })
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            resp.render('main/prod-cat', {
                products: products
            });
        });
});

router.get('/product/:id', function(req, resp, next) {
    Product.findById({ _id: req.params.id }, function(err, product) {
        if (err) return next(err);
        resp.render('main/product', {
            product: product
        });
    });
});

router.post('/payment', function(req, res, next) {
try{
  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source: stripeToken,
  }).then(function(customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  }).then(function(charge) {
    async.waterfall([
      function(callback) {
        Cart.findOne({ owner: req.user._id }, function(err, cart) {
          callback(err, cart);
        });
      },
      function(cart, callback) {
        User.findOne({ _id: req.user._id }, function(err, user) {
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }

            user.save(function(err, user) {
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      },
      function(user) {
        Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
          if (updated) {
            res.redirect('/profile');
          }
        });
      }
    ]);
    
  });
  
}catch (err) {
  res.send(err);
}
});

module.exports = router;
