var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/db19", { useNewUrlParser: true });

module.exports = mongoose;
