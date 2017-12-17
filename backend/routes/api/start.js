const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const Account = require('../../lib/models/account');
const Registration = require('../../lib/models/registration');
const Token = require('../../lib/models/token');
const smtpTransport = require('../../lib/mailer');
const emailTemplates = require('email-templates');
const path = require('path');

router.post('/start/get', (req, res) => {
	let email = req.body.email;
	Account.findOne({email})
	.then((account) => {
		if(!account) {
			return new Account({email}).save();
		}
		return Promise.resolve(account);
	})
	.then(account => {
		return Registration.findOne({email: account.email})
		.then(registration => {
			if(!registration) {
				return new Registration({email: account.email}).save();
			}
			return Promise.resolve(registration);
		})
		.then(registration => {
			return res.json({
				status: 0,
				registration,
				admin: account.admin
			});
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
	let value = req.body.registration;
	let uuid = req.body.uuid || '';
	Registration.findOne({email})
	.then((registration) => {
		registration.temp = value;
		return registration.save();
	})
	.then(() => {
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
							relativeTo: path.join(__dirname, '..', '..', '..', 'build'),
							images: 16
						}
					}
				})
				.send({
					template: '../backend/emails/confirm',
					message: {
						to: email
					},
					locals: {
						host,url
					},
				})
				.then(() => {
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

