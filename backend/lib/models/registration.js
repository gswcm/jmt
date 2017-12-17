const mongoose = require('mongoose');

const tshirtSchema = mongoose.Schema({
	size: {
		type: String,
		default: null
	},
	qty: {
		type: Number,
		default: 0
	}
});

const gradeSchema = mongoose.Schema({
	type: {
		type: String,
		default: null
	},
	qty: {
		type: Number,
		default: 0
	}
});

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
	participants: {
		registration: {
			type: String,
			required: true
		},
		grades: [gradeSchema]
	},
	misc: {
		tshirts: [tshirtSchema],
		meals: {
			type: Number,
			default: 0
		},
	},
});

const registrationSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	main: {
		type: recordSchema,
		default: null
	},
	temp: {
		type: recordSchema,
		default: null
	},
	updated: {
		type: Date,
		default: Date.now,
	},
	paid: {
		type: Boolean,
		required: true,
		default: false
	}
})
.pre('save', function(next) {
	this.updated = new Date();
	next();
})
.index({
	email: 1
});


module.exports = mongoose.model('Registration', registrationSchema);
