var express = require('express');
var router = express.Router();
var fs = require('fs');
var Device = require("../models/device");
var DeviceReport = require("../models/deviceReport");
var Activity = require("../models/activity");
var jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();


/*
**	FUNCTIONALITY: GET request that returns activity data for a given device ID within the last 7 days.
**
**	INPUTS: Device ID
**
**	OUTPUTS: Array of objects containing duration, calories, and uv exposure of valid activities
*/
router.get('/getActivitySummary', function(req, res, next) {
	var deviceId = req.query.deviceID;
	var date = new Date();
	var returnData = [];
	
	var seconds = Math.floor(new Date().getTime() / 1000);
	console.log(seconds);
	Activity.find({deviceID: deviceId, sessionId: { $gte: seconds -(7*24*60*60)}},
		function(err, act) {
			if(act.length == 0) {
				console.log("No activities found within past 7 days");
				return res.status(400).json({success: false, message: "No activies found in last 7 days."});
			}
			else if(err) {
				return res.status(400).json({success: false, message: "Error searching database"});
			}
			else {
				for(var activity of act) {
					console.log("cool");
					returnData.push({ "duration": activity.duration, "calories": activity.calories, "uv": activity.uvExposure})
				}
				return res.status(200).json(returnData);
			}
		});
});


/*
**	FUNCTIONALITY: GET request that returns all activity data for a given device ID.
**
**	INPUTS: Device ID
**
**	OUTPUTS: Array of objects containing activity type, date, duration, calories, uv exposure, device ID, and session number
*/
router.get('/getActivities', function(req, res, next) {
	var deviceId = req.query.deviceID;
	var date = new Date();
	var returnData = [];

	Activity.find({deviceID: deviceId},
		function(err, act) {
			if(act.length == 0) {
				console.log("No activities found");
				return res.status(400).json({success: false, message: "No activies found"});
			}
			else if(err) {
				return res.status(400).json({success: false, message: "Error searching database"});
			}
			else {
				for(var activity of act) {
					returnData.push({ "activityType": activity.activityType, "date": activity.startTime, "duration": activity.duration, "calories": activity.calories, "uv": activity.uvExposure, "deviceID": activity.deviceID, "sessionNum": activity.sessionId});
				}
				return res.status(200).json(returnData);
			}
		});	
});


/*
**	FUNCTIONALITY: GET request that returns one activity for a given device ID.
**
**	INPUTS: Device ID, Session number
**
**	OUTPUTS: Array of objects containing activity type, duration, calories, uv exposure, device ID, and session number
*/
router.get('/getOneActivity', function(req, res, next) {
	var deviceId = req.query.deviceID;
	var sessionID = req.query.sessionNum;

	var returnData = [];

	Activity.find({deviceID: deviceId, sessionId :sessionID },
		function(err, act) {
			if(act.length == 0) {
				console.log("No activities found");
				return res.status(400).json({success: false, message: "No activity found"});
			}
			else if(err) {
				return res.status(400).json({success: false, message: "Error searching database"});
			}
			else {
				for(var activity of act) {
					returnData.push({ "activityType": activity.activityType, "duration": activity.duration, "calories": activity.calories, "uv": activity.uvExposure, "deviceID": activity.deviceID, "sessionNum": activity.sessionId});
				}
				return res.status(200).json(returnData[0]);
			}
		});	
});


/*
**	FUNCTIONALITY: POST request that searches for an activity given a device ID and session number, and updates the calories 
**				   and activity type with the user input.
**
**	INPUTS: Device ID, session, and new activity type
**
**	OUTPUTS: 401 response for error, 201 for success
*/
router.post('/update', function(req, res, next) {

	var sessionNumber = req.body.session;
	var deviceId = req.body.deviceID;
	var newActivityType = req.body.newActivityType;

	console.log(sessionNumber + "\n");
	console.log(deviceId + "\n");
	console.log(newActivityType);

	Activity.findOne({deviceID: deviceId, sessionId: sessionNumber},
		function(err, act) {
			if(err) {
				res.status(401).json({success : false, error : "Error communicating with database."});
			}
			else if(!act) {
				res.status(401).json({success : false, error : "Error finding."});
			}
			else {
				act.activityType = newActivityType;
				var cals;

				// Updates calories 
				if(newActivityType == "Walking") {
					cals = 7.6 * (act.duration/60);
				}
				else if(newActivityType == "Running") {	
					cals = 13.2 * (act.duration/60);
				}
				else {				
					cals = 10.83 * (act.duration/60);
				}				
				act.calories = cals;
				act.save();
				res.status(201).json({success : true, error : "Updated."});
			}
		});
});


/*
**	FUNCTIONALITY: POST request that is called after an activity finishes. Searches for all valid device reports
**				   with the given device id and session, calculates all necessary fields, and creates an activity.
**
**	INPUTS: Device ID and session
**
**	OUTPUTS: 400 response for error, 201 for success
*/
router.post('/create', function(req, res, next) {
   	
	var deviceId = req.body.deviceID;
   	var sessionNumber = req.body.session;

	// For all device reports with session # and deviceID = request session #
	// also sorted by ascending date, to make calculations easier	
	DeviceReport.find({deviceID: deviceId, session: sessionNumber }).sort('time').exec(function(err, reports) {
		if(reports.length == 0) {  
			console.log("None found");
			return res.status(400).json({success: false, message: "None found"}); 
		}
		else if(err) {
			console.log("None found");
			return res.status(400).json({success: false, message: "Error searching database"}); //add error msg here
		} 
		else {
			console.log("From database: ", reports);  //send all reports to console log
		

			var initTime = reports[0].time;  //first time of the session
			var finalTime; //final time of session (updated after for loop is finished)
			var totalTimeDif; //Difference in seconds from first time and last time
			var totUv = 0;   //calculated with midpoint riemann sum
			var totDist = 0; //calculated with midpoint riemann sum
			var avgSpeed = 0; //calculated by dividing totDist by totalTimeDif
			var lastUv;	//last deviceReport's uv
			var lastSpeed; 	//last deviceReport's speed
			var lastTime;	//last deviceReport's time
			var timeDif; //difference in seconds between the last and current deviceReport
			var first = 1;  //just a boolean to avoid a nullPointer when reading the first report
			var timeMinutes = 0;
			for(var report of reports) {
				if (first == 1) {  //for the first report in the series, avoid doing calculations. 
				   first = 0;
				   lastUv = report.uvLevel;
				   lastSpeed = report.GPS_speed;
				   lastTime = report.time;
				}
				else {
					// Calculations
					timeDif = Math.abs((report.time.getTime() - lastTime.getTime())/1000); //seconds between reports
					totUv = totUv + ((report.uvLevel + lastUv)/2)*timeDif;  //calculate midpoint, multiply by timeDif
					totDist = totDist + ((report.GPS_speed + lastSpeed)/2.0)*timeDif; //calculate midpoint, multiply by timeDif
					
					//update values
					lastUv = report.uvLevel;
					lastSpeed = report.GPS_speed;
		       			lastTime = report.time;
					
					//DEBUG CONSOLE LOGS
					console.log("Single time difference " + timeDif);
				}
			}
			console.log("Total UV " + totUv);
			console.log("Total distance " + totDist);
			finalTime = lastTime;
			totalTimeDif = Math.abs((finalTime.getTime() - initTime.getTime())/1000);
			console.log("Total time difference " + totalTimeDif);
			avgSpeed = totDist / totalTimeDif; //meters per second
			avgSpeed = avgSpeed * 2.23694; //convert to miles Per Hour
			console.log("Avg speed " + avgSpeed + " mph");
			
			timeMinutes = totalTimeDif / 60;
			var activity_type;
			var cals;

			if(avgSpeed <= 4) {				// 10 calories per minutes
				activity_type = "Walking";
				cals = 7.6 * timeMinutes;
			}
			else if(avgSpeed > 4 && avgSpeed <= 10) {		// 20 calories per minutes
				activity_type = "Running";
				cals = 13.2 * timeMinutes;
			}
			else {								// 30 calories per minutes
				activity_type = "Biking";
				cals = 10.83 * timeMinutes;
			}

			// Creates a new activity from the calculated information above
			var newActivity = new Activity({
				deviceID: deviceId,
				startTime: initTime,
				sessionId: sessionNumber,
				duration:  totalTimeDif,
				uvExposure: totUv,
				avgSpeed: avgSpeed,
				activityType: activity_type,
				calories: cals
			});


			newActivity.save(function(err) {
				if(err) {
					res.status(400).send(err);
				}
				else {
					console.log("Activity was saved.");
					res.status(201).json({success: true, message: "Activity saved"});
				}
			});
			console.log("wow");
		}
	});
});
module.exports = router;