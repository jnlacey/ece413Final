var db4 = require("../db");

var activitySchema = new db4.Schema({
    deviceID: 	String,
    sessionId: Number,  		//This will be handy in later identifying associated reports and plotting them on a map
    duration: Number,			// In seconds
    uvExposure: Number,			// All the uvLevel's added up
    avgSpeed: Number,
    activityType: String,		// Walking, running, or biking
    calories: Number,
    endTime: Number
});

var Activity = db4.model("Activity", activitySchema);

module.exports = Activity;
