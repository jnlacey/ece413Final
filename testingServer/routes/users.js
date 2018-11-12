var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt-nodejs");
var User = require("../models/users");
var Device = require("../models/device");

var jwt = require("jwt-simple");


/* Register a new user */
router.post('/register', function(req, res, next) {
    
    // FIXME: Add input validation
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
        // Create an entry for the user
        var newUser = new User( {
           email: req.body.email,
           fullName: req.body.fullName,
           passwordHash: hash // hashed password
        }); 
        
	console.log("WOWIE");
        newUser.save( function(err, user) {
		console.log("powie");
           if (err) {
              // Error can occur if a duplicate email is sent
		console.log("owie");
              res.status(400).json( {success: false, message: err.errmsg});
           }
           else {
		console.log("zowie!");
               res.status(201).json( {success: true, message: user.fullName + " has been created."})
           }
        });
    });    
});


module.exports = router;