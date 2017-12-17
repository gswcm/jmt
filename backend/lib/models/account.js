const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crs = require('crypto-random-string');
const admins = [
	'kailash.ghimire@gsw.edu',
	'simonbaev@gmail.com',
];

const accountSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	},
	password: {
		type: String,
		default: ''
	}
})
.pre('save', function(next) {
	let self = this;
	if(admins.indexOf(self.email) > -1) {
		self.admin = true;
	}
	next();
})
.pre('save', function(next){
	const self = this;
	if(!self.password.length) {
		self.password = crs(16);
	}
	else if(self.password.indexOf('$2a$12$') === 0 && self.password.split(/\$/)[3].length == 53) {
		//-- password already hashed, no need to re-hash it
		return next();
	}
	bcrypt.hash(this.password, 12)
	.then((hash) => {
		self.password = hash;
		next();
	});
})
.method('checkPassword',function(password){
	const $this = this;
	return new Promise((resolve) => {
		bcrypt.compare(password, $this.password).then(resolve);
	});
})
.index({
	email: 1
});

module.exports = mongoose.model('Account', accountSchema);
