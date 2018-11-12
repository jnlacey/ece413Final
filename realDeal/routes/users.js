var express = require('express');
var router = express.Router();
var fs = require('fs');
var User = require("../models/users");
var Device = require("../models/device");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function(req, res, next) {
console.log("HECKK");
   User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
         res.status(401).json({success : false, error : "Error communicating with database."});
      }
      else if(!user) {
         res.status(401).json({success : false, error : "The email or password provided was invalid!."});         
      }
      else {
	//do some bcrypt?
        /*bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
            if (err) {
               res.status(401).json({success : false, error : "Error authenticating. Please contact support."});
            }
            else if(valid) {
               var token = jwt.encode({email: req.body.email}, secret);
               res.status(201).json({success : true, token : token});         
            }
            else {
               res.status(401).json({success : false, error : "The email or password provided was invalid."});         
            }
         });*/
	console.log(req.body.password);
	console.log(user.passwordHash);
	if(req.body.password == user.passwordHash) {
		var token = jwt.encode({email: req.body.email}, secret);
               res.status(201).json({success : true, token : token}); 
	}
	else {
		res.status(401).json({success : false, error : "The email or password provided was invalid."});
	}
      }
   });
});

/* Register a new user */
router.post('/register', function(req, res, next) {

    // FIXME: Add input validation, bcrypt
        // Create an entry for the user
        var newUser = new User( {
           email: req.body.email,
           fullName: req.body.fullName,
           passwordHash: req.body.password // hashed password
	});
        console.log(newUser.email);
	console.log(newUser.fullName);
	console.log(newUser.passwordHash);
	
	newUser.save( function(err, user) {
	   console.log("Saving user... ");
           if (err != null) {
		console.log("Error != null"); 
              // Error can occur if a duplicate email is sent
              res.status(400).json( {success: false, message: err.errmsg});
           }
           else {
		console.log("Error == null");
               res.status(201).json( {success: true, message: user.fullName + " has been created."})
           }
        });   
});
router.get("/getall", (req, res, next) => {
	//const naame = req.params.name;
	console.log("Getting all users: ");
	User.find()
		.exec()
		.then(doc => {
		console.log("From database: ", doc);
		res.status(200).json(doc);		
	});
});
router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
            
            // Find devices based on decoded token
		      Device.find({ userEmail : decodedToken.email}, function(err, devices) {
			      if (!err) {
			         // Construct device list
			         var deviceList = []; 
			         for (device of devices) {
				         deviceList.push({ 
				               deviceId: device.deviceId,
				               apikey: device.apikey,
				         });
			         }
			         userStatus['devices'] = deviceList;
			      }
			      
               return res.status(200).json(userStatus);            
		      });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
   
});

module.exports = router;
