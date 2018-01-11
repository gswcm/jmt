const express = require("express");
const _ = require("lodash");
const errToJSON = require("error-to-json");
const router = express.Router();
const Account = require("../../lib/models/account");
const Registration = require("../../lib/models/registration");
const Token = require("../../lib/models/token");
const smtpTransport = require("../../lib/mailer");
const emailTemplates = require("email-templates");
const path = require("path");

let evalCredentials = credentials => {
	let email = credentials.email;
	let password = credentials.password;
	return Account.findOne({ email })
	.then(account => {
		if (account) {
			return account.checkPassword(password)
			.then(result => {
				return result
					? Promise.resolve(account)
					: Promise.reject(new Error("Incorrect credentials"));
			});
		} 
		else {
			return Promise.reject(new Error("Incorrect credentials"));
		}
	})
	.then(account => {
		if (!account.admin) {
			return Promise.reject(new Error("User is not an admin"));
		}
		return Promise.resolve();
	});
};

router.post("/admin/password/update", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	Account.findOne({ email })
	.then(account => {
		if (!account) {
			account = new Account({ email });
		}
		if (password.length) {
			account.password = password;
		}
		return account.save();
	})
	.then(() => {
		return res.json({
			status: 0
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post("/admin/password/request", (req, res) => {
	let email = req.body.email;
	new Token({ email })
	.save()
	.then(token => {
		let host = `${req.protocol}://${req.get("host")}`;
		let url = `${host}/email?action=restore&token=${token.uuid}`;
		return new emailTemplates({
			transport: smtpTransport,
			juice: true,
			juiceResources: {
				preserveImportant: true,
				webResources: {
					relativeTo: path.join(
						__dirname,
						"..",
						"..",
						"..",
						"build"
					),
					images: 16
				}
			}
		})
		.send({
			template: "../backend/emails/restore",
			message: {
				to: email
			},
			locals: {
				host,
				url
			}
		})
		.then(() => {
			return Promise.resolve(token);
		})
		.catch(error => {
			if (token) {
				token.remove();
			}
			return Promise.reject(error);
		});
	})
	.then(() => {
		res.json({
			status: 0
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});
router.post("/admin/confirm", (req, res) => {
	let email = req.body.email;
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return Registration.findOne({ email })
		.then(registration => {
			if (!registration) {
				return Promise.reject(new Error("Registration not found"));
			}
			registration.main = registration.temp || null;
			return registration.save();
		});
	})
	.then(() => {
		return res.json({ 
			email,
			status: 0 
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post("/admin/remove", (req, res) => {
	let email = req.body.email;
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return Registration.deleteMany({email}).exec();
	})
	.then(() => {
		res.json({
			status: 0,
			email
		});
	})	
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post("/admin/records", (req, res) => {
	let filter = req.body.filter;	
	Account.find(filter.account || {})
		.then(accounts => {			
			let emails = accounts.map(i => i.email);	
			return Registration.find({
				$and: [
					{ email: { $in: emails} },
					filter.registration || {}
				]
			});
		})
		.then(records => {
			return res.json({
				status: 0,
				records: records.map(i => _.pick(i, ["email", "paid", "temp", "main"]))
			});
		})
		.catch(error => {
			res.json({
				status: 500,
				error: errToJSON(error)
			});
		});
});

router.post("/admin/paid", (req, res) => {
	let paid = req.body.paid;
	let email = req.body.email;
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return Registration.findOne({ email })
		.then(registration => {
			if (!registration) {
				return Promise.reject(new Error("Registration not found"));
			}
			registration.paid = paid;
			return registration.save();
		});
	})
	.then((registration) => {
		return res.json({ 
			paid: registration.paid,
			status: 0 
		});
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

router.post("/admin/eval", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	evalCredentials({ email, password })
	.then(() => {
		return res.json({
			status: 0
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

module.exports = router;
