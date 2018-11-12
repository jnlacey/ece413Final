var express = require('express');
var router = express.Router();
router.get('/',function(req, res) {
        var name;
        if ( req.query.name) {
                name = req.query.name;
        } else {
                name = "anonymous";
        }
        res.send("Hi! " + name);
});

module.exports = router;
