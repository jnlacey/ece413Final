var express = require('express');
var router = express.Router();
var fs = require('fs');
var Data = require("../models/data");
var jwt = require("jwt-simple");