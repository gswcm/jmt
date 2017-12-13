const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const User = require('../../lib/models/user');
const Token = require('../../lib/models/token');
const smtpTransport = require('../../lib/mailer');
const emailTemplates = require('email-templates');
const path = require('path');

router.post('/start/get', (req, res) => {
	let email = req.body.email;
	User.findOne({email})
	.then((user) => {
		res.json({
			status: 0,
			user,
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post('/start/set', (req, res) => {
	let email = req.body.email;
	let value = req.body.value;
	let uuid = req.body.uuid || '';
	User.findOne({email})
	.then((user) => {
		if(!user) {
			user = new User({email});
		}
		if(!user.registration) {
			user.registration = {};
		}
		user.registration.temp = {...value};
		return user.save();
	})
	.then((user) => {
		return Token.findOne({uuid});
	})
	.then((token) => {
		if(!token) {
			return new Token({email}).save()
			.then((token) => {	
				let host = `${req.protocol}://${req.get('host')}`;
				let url = `${host}/email?action=confirm&token=${token.uuid}`;
				return new emailTemplates({
					transport: smtpTransport,
					juice: true,
					juiceResources: {
						preserveImportant: true,
						webResources: {
							relativeTo: path.join(__dirname, '..', '..', 'dist'),
							images: 16
						}
					}
				})
				.send({
					template: 'confirm',
					message: {
						to: email
					},
					locals: {
						host,url
					},
				})
				.then((report) => {
					return Promise.resolve(token);
				})
				.catch((error) => {
					if(token) {
						token.remove();
					}
					return Promise.reject(error);
				});
			});
		}
		else {
			return Promise.resolve(token);
		}
	})
	.then((token) => {
		res.json({
			status: 0,
			uuid: token.uuid
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

