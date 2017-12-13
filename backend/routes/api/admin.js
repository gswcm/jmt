const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const User = require('../../lib/models/user');
const Token = require('../../lib/models/token');
const smtpTransport = require('../../lib/mailer');
const emailTemplates = require('email-templates');
const path = require('path');

let evalCredentials = (credentials) => {
	let email = credentials.email;
	let password = credentials.password;
	return User.findOne({ email })
	.then(user => {
		if (user) {
			return user.checkPasscode(password).then(result => {
				return result ? Promise.resolve(user) : Promise.reject(new Error('Incorrect credentials'));
			});
		} else {
			return Promise.reject(new Error('Incorrect credentials'));
		}
	})
	.then(user => {
		if (!user.admin) {
			return Promise.reject(new Error('User is not an admin'));
		}
		return Promise.resolve();
	});
};

router.post('/admin/password/update', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	User.findOne({ email })
	.then((user) => {
		if(!user) {
			user = new User({email});
		}
		if(password.length) {
			user.passcode = password;
		}
		return user.save();
	})
	.then(() => {
		return res.json({
			status: 0
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post('/admin/password/request', (req, res) => {
	let email = req.body.email;
	new Token({ email }).save()
	.then((token) => {
		let host = `${req.protocol}://${req.get('host')}`;
		let url = `${host}/email?action=restore&token=${token.uuid}`;
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
			template: 'restore',
			message: {
				to: email
			},
			locals: {
				host, url
			},
		})
		.then((report) => {
			return Promise.resolve(token);
		})
		.catch((error) => {
			if (token) {
				token.remove();
			}
			return Promise.reject(error);
		});
	})
	.then((token) => {
		res.json({
			status: 0,
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post('/admin/paid', (req, res) => {
	let paid = req.body.paid;
	let email = req.body.email;
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return User.findOne({ email })
		.then(user => {
			if (!user) {
				return Promise.reject(new Error('Team not found'));
			}
			user.paid = paid;
			return user.save();
		});
	})
	.then(() => {
		return res.json({ status: 0 });
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

router.post('/admin/eval', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	evalCredentials({email,password})
	.then(() => {
		return res.json({
			status: 0
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
