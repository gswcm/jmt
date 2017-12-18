const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const Registration = require('../../lib/models/registration');
const Token = require('../../lib/models/token');

const allowedActions = ['confirm','restore'];

router.post('/email/eval', (req, res) => {
	let action = req.body.action;
	let uuid = req.body.token;
	if (allowedActions.indexOf(action) === -1) {
		return res.json({
			status: 405,
			error: errToJSON(new Error(`Incorrect action: ${action}`))
		});
	}
	Token.findOne({ uuid })
	.then((token) => {
		if (!token) {
			return Promise.reject(new Error('Token not found'));
		}
		return res.json({
			status: 0,
			email: token.email,
			action
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});


router.post('/email/confirm', (req, res) => {
	let email = req.body.email;
	let value = req.body.value;
	Registration.findOne({ email })
	.then((registration) => {
		if(!registration || !registration.temp) {
			return Promise.reject(new Error('Cannot locate registration associated with the token'));
		}
		if(value) {
			registration.temp = registration.main = {...value};
			return registration.save();
		}
		else {
			return Promise.resolve(registration);
		}
	})
	.then((registration) => {
		res.json({
			status: 0,
			registration
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

module.exports = router;

