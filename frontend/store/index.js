import vue from 'vue';
import vuex from 'vuex';
import types from './mutations';

const state = {
	isAdmin: false,
	email: '',
	tournament: null,
	eventDate: null,
	years: [],
	credentials: null
};
const getters = {
	getIsAdmin: (state) => state.isAdmin,
	getEmail: (state) => state.email,
	getTournament: (state) => state.tournament,
	getEventDate: (state) => state.eventDate,
	getYears: (state) => state.years,
	getCredentials: (state) => state.credentials
};
const actions = {
};
const mutations = {
	[types.SET_IS_ADMIN]: (state, isAdmin) => {
		state.isAdmin = isAdmin;
	},
	[types.SET_EMAIL]: (state, email) => {
		state.email = email;
	},
	[types.SET_TOURNAMENT]: (state, tournament) => {
		state.tournament = tournament;
	},
	[types.SET_EVENT_DATE]: (state, eventDate) => {
		state.eventDate = eventDate;
	},
	[types.SET_YEARS]: (state, years) => {
		state.years = years;
	},
	[types.SET_CREDENTIALS]: (state, credentials) => {
		state.credentials = credentials;
	},
};

vue.use(vuex);
export default new vuex.Store({
	state,
	getters,
	actions,
	mutations
});