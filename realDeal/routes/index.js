var express = require('express');
var router = express.Router();

/*
**	FUNCTIONALITY: GET the homepage
**
**	INPUTS: None
**
**	OUTPUTS: None
*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ECE 413/513 Fall 2018' });
});

module.exports = router;
