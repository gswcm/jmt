import vue from 'vue';
import vuex from 'vuex';
import types from './mutations';

const state = {
	isAdmin: false,
	emailValue: '',
};
const getters = {
	getIsAdmin: (state) => state.isAdmin,
	getEmailValue: (state) => state.emailValue,
};
const actions = {
};
const mutations = {
	[types.SET_IS_ADMIN]: (state, isAdmin) => {
		state.isAdmin = isAdmin;
	},
	[types.SET_EMAIL_VALUE]: (state, emailValue) => {
		state.emailValue = emailValue;
	},
};

vue.use(vuex);
export default new vuex.Store({
	state,
	getters,
	actions,
	mutations
});