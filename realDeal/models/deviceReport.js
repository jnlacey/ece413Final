var db2 = require("../db");

var deviceReportSchema = new db2.Schema({
    deviceID:       String,
    GPS_lat:     Number,
    GPS_lon: Number,
    GPS_speed: Number,
    uvLevel: Number,
    session: Number,
    time:  { type: Date, default: Date.now }
});

var DeviceReport = db2.model("DeviceReport", deviceReportSchema);

module.exports = DeviceReport;
