var express = require('express');
var router = express.Router();
var fs = require('fs');
var User = require("../models/users");
var Device = require("../models/device");
var DeviceReport = require("../models/deviceReport");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();


/*
**  FUNCTIONALITY: POST request that searches for user given an email, checks that the given password is correct,
**                 and sends back an encoded token letting the user sign in.
**
**  INPUTS: Email, Password
**
**  OUTPUTS: Status 201 and an encoded token for success, 401 for failure
*/
router.post('/signin', function(req, res, next) {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
          res.status(401).json({success : false, error : "Error communicating with database."});
      }
      else if(!user) {
          res.status(401).json({success : false, error : "The email or password provided was invalid."});         
      }
      else {
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


/*
**  FUNCTIONALITY: POST request that reads in an email, name, and password, and creates a new account.
**
**  INPUTS: Email, Full Name, Password
**
**  OUTPUTS: 401 response for error, 201 for success
*/
router.post('/register', function(req, res, next) {

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


/*
**  FUNCTIONALITY: POST request that updates a user's email
**
**  INPUTS: Token, new email
**
**  OUTPUTS: 401 response for error, 201 and a token for success
*/
router.post('/updateEmail', function(req, res, next) {
    var decodedToken = jwt.decode(req.body.token, secret);
    var oldEmail = decodedToken.email;
    User.findOne({email: oldEmail}, function(err,doc) {
    	  if(err) {
          	res.status(401).json({success : false, error : "Error communicating with database."});
        }
  	    else if (!doc) {
           	console.log("Somehow the orignal email isn't in the database");
  		      res.status(401).json({success : false, error : "Error finding original email."});
  	    }
        else {
        		console.log(doc.email);
        		doc.email = req.body.email;
        		doc.save();
        		Device.findOne({userEmail: oldEmail}, function(err, dev) {
          		  if(err) {
          		  }
          		  if(!dev) {
          			    console.log("No associated device");
          		  }
          		  else {
          		      dev.userEmail = req.body.email;	
          		      dev.save();	
          		  }
  		      });
            var token = jwt.encode({email: doc.email}, secret);
  		      res.status(201).json( {success: true, token: token, message: "updated"});
        }
    });
});


/*
**  FUNCTIONALITY: POST request that updates a user's uv threshold
**
**  INPUTS: Token, new thresh
**
**  OUTPUTS: 401 response for error, 201 for success
*/
router.post('/updateUvThresh', function(req, res, next) {
    var decodedToken = jwt.decode(req.body.token, secret);
    var email = decodedToken.email;
    User.findOne({email: email}, function(err,doc) {
    	  if(err) {
          	res.status(401).json({success : false, error : "Error communicating with database."});
        }
  	    else if (!doc) {
           	console.log("Somehow the orignal email isn't in the database");
  		      res.status(401).json({success : false, error : "Error finding original email."});
  	    }
        else {
  		      doc.uvLimit = req.body.thresh;
  		      doc.save();
            res.status(201).json( {success: true, message: "updated"});
        }
    });
});


/*
**  FUNCTIONALITY: GET request that returns a user's UV limit
**
**  INPUTS: Device ID
**
**  OUTPUTS: 401 response for error, 201 for success
*/
router.get("/getuvlimit", (req, res, next) => { //req should contain deviceID: deviceID
  	console.log(req.query.deviceID);
	  Device.findOne({deviceId: req.query.deviceID}, function(err, doc) {
    	  if(err) {
           	res.status(401).json({success : false, error : "Error communicating with database."});
        }
    	  else if (!doc) {
           	console.log("Device isn't in the database");
    		    res.status(401).json({success : false, error : "Error finding device."});
    	  }
        else {
        		console.log(doc.userEmail);
        		User.findOne({email: doc.userEmail}, function(err, user) {
        		    if(err) {
        		        res.status(401).json({success : false, error : "Error communicating with database."});
        		    }
        		    else if (!user) {
                    res.status(401).json({success : false, error : "Associated User not found"});
        		    }
        		    else {
        		        var uvLimit = user.uvLimit;
        	       	  res.status(201).json( {success: true, uvLimit: uvLimit});
        		    }
        		});	
        }
	});
});


/*
**  FUNCTIONALITY: POST request that updates a user's name
**
**  INPUTS: Token, new name
**
**  OUTPUTS: 401 response for error, 201 for success
*/
router.post('/updateName', function(req, res, next) {
    var decodedToken = jwt.decode(req.body.token, secret);
    var email = decodedToken.email;
    User.findOne({email: email}, function(err,doc) {
    	  if(err) {
          	res.status(401).json({success : false, error : "Error communicating with database."});
        }
  	    else if (!doc) {
           	console.log("Somehow the orignal email isn't in the database");
  		      res.status(401).json({success : false, error : "Error finding original email."});
  	    }
        else {
        		doc.fullName = req.body.name;
        		doc.save();
            res.status(201).json( {success: true, message: "updated"});
        }
    });
});


/*
**  FUNCTIONALITY: POST request that updates a user's password
**
**  INPUTS: Token, new password
**
**  OUTPUTS: 401 response for error, 201 for success
*/
router.post('/updatePass', function(req, res, next) {
    var decodedToken = jwt.decode(req.body.token, secret);
    var email = decodedToken.email;
    User.findOne({email: email}, function(err,doc) {
    	  if(err) {
          	res.status(401).json({success : false, error : "Error communicating with database."});
        }
  	    else if (!doc) {
           	console.log("Somehow the orignal email isn't in the database");
  		      res.status(401).json({success : false, error : "Error finding original email."});
  	    }
        else {
        		doc.passwordHash = req.body.pass;
        		doc.save();
            res.status(201).json( {success: true, message: "updated"});
        }
    });
});


/*
**  FUNCTIONALITY: GET request that returns all user's
**
**  INPUTS:None
**
**  OUTPUTS: 200 status code and array of all users
*/
router.get("/getall", (req, res, next) => {

  	console.log("Getting all users: ");
  	User.find()
  		.exec()
  		.then(doc => {
  		console.log("From database: ", doc);
  		res.status(200).json(doc);		
  	});
});


/*
**  FUNCTIONALITY: GET request that removes a device from the user
**
**  INPUTS: Token, Device id
**
**  OUTPUTS: 401 response for error, 200 if user doesn't exist, and 201 for success
*/
router.get("/deleteDevice", function(req, res, next) {
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
      		//delete user device here
       		console.log("BEEP");
      		Device.findOneAndRemove({ userEmail : decodedToken.email}, function (err2, doc) {
      			if(err2) {
      				return done(err2);
      			}
      			else if (!doc) {
      			}
      			else {
      				DeviceReport.find({deviceID: doc.deviceId}).remove().exec();
      			}
      		});
      		user.userDevices = [];
      		user.save();
      		console.log(user.userDevices.length);
         }
       });
       res.status(201).json( {success: true, message: "device deleted"});
   }
   catch(ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});


/*
**  FUNCTIONALITY: GET request that returns information on the user's account as well as their device's ID and API key.
**
**  INPUTS: Token
**
**  OUTPUTS: 401 response for error, 200 if user doesn't exist. For success, it returns the user's
**           email, name, last access date, uv limit, device id's and device api keys
*/
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
	      else if(!user) {
	      }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
	          userStatus['uvLimit'] = user.uvLimit;
            
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
