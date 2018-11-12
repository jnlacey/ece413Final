var db = require("../db");

var dataSchema = new db.Schema({
  deviceId:   String,
  gpsLocation:  [ Double ],
  gpsSpeed: [ Double ],
  uvReadings: [ Double ],
  time:   { type: Date, default: Date.now }
});

var Data = db.model("Data", dataSchema);

module.exports = Data;
