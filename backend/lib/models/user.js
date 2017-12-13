const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crs = require('crypto-random-string');
const admins = [
	'kailash.ghimire@gsw.edu',
	'simonbaev@gmail.com',
	'mtourney@gsw.edu'
];

const tshirtSchema = mongoose.Schema({
	size: {
		type: String,
		default: null
	},
	qty: {
		type: Number,
		default: 0
	}
} ,{ _id : false });

const recordSchema = mongoose.Schema({
	sponsor: {
		name: {
			type: String,
			default: ''
		},
		phone: {
			type: String,
			default: ''
		},
	},
	school: {
		name: {
			type: String,
			default: ''
		},
		division: {
			type: String,
			default: null
		},
	},
	team: {
		names: [String],
		meals: {
			type: Number,
			default: 0
		},
		tshirts: [tshirtSchema]
	},
	cteatedAt: {
		type: Date,
		default: Date.now,
	},
},{ _id : false });

const registrationSchema = mongoose.Schema({
	main: {
		type: recordSchema,
		default: null
	},
	temp: {
		type: recordSchema,
		default: null
	}
},{ _id : false });

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	},
	passcode: {
		type: String,
		default: ''
	},
	registration: {
		type: registrationSchema,
		default: null	
	},
	paid: {
		type: Boolean,
		required: true,
		default: false
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
	if(!self.passcode.length) {
		self.passcode = crs(16);
	}
	else if(self.passcode.indexOf('$2a$12$') === 0 && self.passcode.split(/\$/)[3].length == 53) {
		//-- password already hashed, no need to re-hash it
		return next();
	}
	bcrypt.hash(this.passcode, 12)
	.then((hash) => {
		self.passcode = hash;
		next();
	});
})
.pre('save', function(next) {
	if(this.registration) {
		let registration = this.registration;
		['temp','main'].forEach((key) => {
			if(registration[key]) {
				registration[key].createdAt = new Date();
			}
		});
	}
	next();
})
.method('checkPasscode',function(passcode){
	const $this = this;
	return new Promise((resolve) => {
		bcrypt.compare(passcode, $this.passcode).then(resolve);
	});
})
.index({
	email: 1
});

module.exports = mongoose.model('User', userSchema);
