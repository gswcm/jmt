<template>	
	<b-container class="mt-3">
		<div v-if="showContent">
			<b-alert show dismissible variant="info">
				Last modification is dated on <strong>{{lastUpdated}}</strong>
				<b-btn class="p-0" v-show="!showForm" @click="showForm = true" variant="link">Show details...</b-btn>
			</b-alert>
			<registration
				v-show="showForm"
				:value="registration.value"
				:options="{
					debug: false,
					ro: false,
				}"
				@input="update"/>
			<div class="text-justify border border-warning rounded my-3 p-3">
				<p>	
					Please make your <strong>check</strong> payable to <strong>"GSW High School Math Tournament"</strong> and send it to 
					<address class="ml-3">
						<strong>Kailash Ghimire</strong><br/>
						800 GSW State University Drive<br/>
						Americus, GA 31709
					</address>
				</p>
				<p>
					In order to pay by <strong>credit card</strong> please contact <a href="https://www.gsw.edu/campus-life/campusliving/studentaccount/contact" target="_blank">GSW Student Accounts</a> at <a href="tel:+12299312767">(229) 931-2767</a> or <a href="tel:+12299312013">(229) 931-2013</a> and mention that you are willing to pay for <strong>"High School Tournament"</strong>.
				</p>
			</div>
			<b-btn class="mt-3" :disabled="!registration.status" variant="primary" @click="submit">Save</b-btn>
		</div>
	</b-container>
</template>

<script>
	import registration from '../form/registration.vue';
	export default {
		components: {
			registration
		},
		props: {
			email: String
		},
		data: () => ({
			registration: {
				value: {},
				status: false
			},
			showContent: false,
			showForm: false,
			lastUpdated: null,
		}),
		created() {
			this.axios.post('/api/email/confirm', { 
				email: this.email
			})
			.then((response) => {
				if(response.data.status) {
					let error = response.data.error || new Error('not sure');
					throw error;						
				}
				else {
					this.registration.value = {...response.data.registration.temp};
					this.lastUpdated = Date(response.data.registration.updated);
					this.showContent = true;
				}
			})
			.catch((error) => {
				this.status = {
					message: error.message,
					variant: 'text-danger'
				};
				this.$noty.error(`Something went wrong... more specifically: ${error.message}`);
				console.error(error.stack);
			})
		},
		methods: {
			update(data) {
				this.registration.value = data.value;
				this.registration.status = data.status;
			},
			submit() {
				this.axios.post('/api/email/confirm', { 
					email: this.email,
					value: {...this.registration.value}
				})
				.then((response) => {
					if(response.data.status) {
						let error = response.data.error || new Error('not sure');
						throw error;						
					}
					else {
						this.$noty.success(`Thank you for confirming (updating) the registration`);
						this.lastUpdated = Date(response.data.registration.updated);
					}
				})
				.catch((error) => {
					this.$noty.error(`Something went wrong... more specifically: ${error.message}`);
					console.error(error.stack);
				})
			}
		}
	}	
</script>
