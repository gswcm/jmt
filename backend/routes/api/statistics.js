const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const User = require('../../lib/models/user');

let getSummary = (users) => {
	let tShirts = {};
	users.filter((i) => i.registration.main.team.tshirts.length > 0).forEach(i => {
		let tshirts = i.registration.main.team.tshirts;
		tshirts.forEach(t => {
			tShirts[t.size] = ((t.size in tShirts) ? tShirts[t.size] : 0) + t.qty;
		});
	});
	let summary = {
		numTeams: users.length,
		numStudents: users.reduce((a,i) => a + i.registration.main.team.names.length, 0),
		numMeals: users.reduce((a,i) => a + i.registration.main.team.meals, 0),
		tshirts: Object.keys(tShirts).length ? tShirts : null
	};
	return summary;
};

let getTeams = function(users) {
	let teams = {};
	users.forEach(i => {
		teams[i.email] = i.registration.main;
		teams[i.email].paid = i.paid || false;
	});
	return teams;
};

router.post('/statistics', (req, res) => {
	User.find(
		{
			$and: [{ admin: false }, { 'registration.main': { $ne: null } }]
		}
	)
	.lean()
	.then((users) => {
		return res.json({
			status: 0,
			teams: getTeams(users),
			summary: getSummary(users)
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
	User.find(
		{
			$and: [{ admin: false }, { 'registration.main': { $ne: null } }]
		}
	)
	.lean()
	.then((users) => {		
		return res.render('statistics', {
			status: 0,
			summary: getSummary(users)
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

