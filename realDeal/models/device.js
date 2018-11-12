var db3 = require("../db");

var deviceSchema = new db3.Schema({
    apikey:       String,
    deviceId:     String,
    userEmail:    String,
    lastContact:  { type: Date, default: Date.now }
});

var Device = db3.model("Device", deviceSchema);

module.exports = Device;
