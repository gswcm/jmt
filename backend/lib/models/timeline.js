const mongoose = require('mongoose');

const timelineSchema = mongoose.Schema({
	eventDate: {
		type: Date,
		default: null
	}
}); 

module.exports = mongoose.model("Timeline", timelineSchema);
