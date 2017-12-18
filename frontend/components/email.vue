<template>
	<b-container>
		<div v-if="showContent">
			<div v-if="action === 'confirm'">
				<confirm :email="email"/>
			</div>
			<div v-else-if="action === 'restore'">
				<restore :email="email"/>
			</div>
			<div v-else>
				<h3>Booooooo</h3>
			</div>
		</div>
		<div v-else class="p-3">
			<h4 :class="status.variant">{{status.message}}</h4>
		</div>
	</b-container>
</template>

<script>
	import _ from 'lodash';
	import confirm from './emailActions/confirm.vue';
	import restore from './emailActions/restore.vue';
	export default {
		components: {
			confirm, restore
		},
		data: () => ({
			showContent: false,
			email: '',
			action: '',
			status: {
				message: 'Loading...',
				variant: 'text-secondary'
			}
		}),
		created() {
			this.axios.post('/api/email/eval', { 
				action: this.$route.query.action,
				token: this.$route.query.token
			})
			.then((response) => {
				if(response.data.status) {
					let error = response.data.error || new Error('not sure');
					throw error;						
				}
				else {
					this.email = response.data.email;
					this.action = response.data.action;
					this.showContent = true;
				}
			})
			.catch((error) => {
				this.status = {
					message: error.message,
					variant: 'text-danger'
				};
				console.error(error.stack);
			})
		},
	}
</script>
