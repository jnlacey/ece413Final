var mongoose = require("mongoose");

mongoose.connect('mongodb://admin:password!@ece413-shard-00-00-asqta.mongodb.net:27017,ece413-shard-00-01-asqta.mongodb.net:27017,ece413-shard-00-02-asqta.mongodb.net:27017/test?ssl=true&replicaSet=ece413-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true });

module.exports = mongoose;
