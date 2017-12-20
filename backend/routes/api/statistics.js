const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const Registration = require('../../lib/models/registration');
const Account = require('../../lib/models/account');

let getSummary = (registrations) => {
	let tShirts = {};
	registrations.filter((i) => i.main.misc.tshirts.length > 0).forEach(i => {
		i.main.misc.tshirts.forEach(t => {
			tShirts[t.size] = ((t.size in tShirts) ? tShirts[t.size] : 0) + t.qty;
		});
	});
	let grades = {};
	let numStudents = 0;
	registrations.filter((i) => i.main.participants.grades.length > 0).forEach(i => {
		i.main.participants.grades.forEach(g => {
			grades[g.type] = ((g.type in grades) ? grades[g.type] : 0) + g.qty;
			numStudents += g.qty;
		});
	});
	let summary = {
		numTeams: registrations.length,
		numStudents,
		numMeals: registrations.reduce((a,i) => a + i.main.misc.meals, 0),
		grades: Object.keys(grades).length ? grades : null,
		tshirts: Object.keys(tShirts).length ? tShirts : null
	};
	return summary;
};

router.post('/statistics', (req, res) => {
	Account.find({admin:false})
	.then(accounts => {
		let emails = accounts.map(i => i.email);
		return Registration.find(
			{
				$and: [{ email: emails }, { 'main': { $ne: null } }]
			}
		);
	})
	.then((registrations) => {
		return res.json({
			status: 0,
			summary: getSummary(registrations)
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.get('/statistics', (req, res) => {
	Account.find({admin:false})
	.then(accounts => {
		let emails = accounts.map(i => i.email);
		return Registration.find(
			{
				$and: [{ email: emails }, { 'main': { $ne: null } }]
			}
		);
	})
	.then((registrations) => {		
		return res.render('statistics', {
			status: 0,
			summary: getSummary(registrations)
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: error.message
		});
	});
});

module.exports = router;

