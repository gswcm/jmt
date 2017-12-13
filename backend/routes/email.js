var express = require('express');
var router = express.Router();

// About page
router.get('/', function (req, res) {
	res.render('../emails/confirm/html.experimental.1.pug',{
		url: 'http://'
	});
});

module.exports = router;