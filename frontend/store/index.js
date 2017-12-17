import vue from 'vue';
import vuex from 'vuex';
import types from './mutations';

const state = {
	isAdmin: false,
	email: '',
};
const getters = {
	getIsAdmin: (state) => state.isAdmin,
	getEmail: (state) => state.email,
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
};

vue.use(vuex);
export default new vuex.Store({
	state,
	getters,
	actions,
	mutations
});