<template>	
	<b-container>
		<b-row align-v="center" class="mt-5">
			<b-col cols="12" sm="4" md="auto">
				<label>New password</label>
			</b-col>
			<b-col col sm md="8"> 
				<b-input-group>
					<b-form-input 
						:type="showPassword ? 'text' : 'password'" 
						v-model="password"						
						placeholder="type in your new password">
					</b-form-input>
					<b-input-group-button slot="right">
						<b-btn :disabled="!password.length" variant="outline-secondary" @click="togglePasswordVisibility">show</b-btn>
					</b-input-group-button>
				</b-input-group>
			</b-col>	
		</b-row>
		<b-btn :disabled="!password.length" class="mt-3" variant="primary" @click="submit">Save</b-btn>
	</b-container>
</template>

<script>
	export default {
		props: {
			email: String
		},
		data: () => ({
			showPassword: false,
			password: ''
		}),
		
		methods: {
			togglePasswordVisibility() {
				this.showPassword = !this.showPassword;
			},
			submit() {
				this.axios.post('/api/admin/password/update', { 
					email: this.email,
					password: this.password
				})
				.then((response) => {
					if(response.data.status) {
						let error = response.data.error || new Error('not sure');
						throw error;						
					}
					else {
						this.$noty.success(`Your passwprd has been successfully updated`);
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
<style>
	.form-control:focus, 
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
</style>
