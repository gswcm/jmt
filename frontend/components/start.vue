<template>
	<b-container>
		<fieldset class="mt-3">
			<legend>
				Who are you?
			</legend>
			<div class="fieldset p-3 bg-light rounded">
				<b-form-group 			
					class="my-0"							
					label-for="email"
					:feedback="emailFeedback"
					:state="emailState">
					<b-row align-v="center">
						<b-col cols="12" sm="auto">	
							<label>Sponsor's e-mail</label>
						</b-col>
						<b-col col sm>
							<b-input-group>
								<b-form-input 
									id="email" 
									type="text" 
									:state="emailState"
									:value="email"
									@input="emailUpdated"
									placeholder="just start typing...">
								</b-form-input>
							</b-input-group>
						</b-col>
					</b-row>
					<div slot="feedback" class="d-flex justify-content-end mt-2">{{emailFeedback}}</div>
				</b-form-group>
			</div>
		</fieldset>
		<div v-if="isAdmin" class="bg-warning p-3 rounded my-3">
			<p class="text-dark text-justify">
				The registration form is hiddenn for you because your account is associated with administrative privilege. You can access admin interface by clicking <router-link to="/admin">Admin</router-link> link in the navigation bar on up top. 
			</p>
			<p>
				Please note that should you decide to walk through the registration process, your info will not be included into reports... because you are not a real user.
			</p>
			<b-btn variant="outline-dark" @click="override = !override">Show/hide registration form</b-btn>
		</div>
		<div v-if="(showForm && !isAdmin) || override">
			<registration
				:value="registration.value"
				:options="{
					debug: false,
					ro: false,
				}"
				@input="update">
			</registration>
			<div class="text-justify border border-info rounded my-3 p-3">
				<p>
					Submission of this form <strong>has to be confirmed by the e-mail's owner</strong>. Please click the button below to request a confirmation e-mail. Having such e-mail received, you will need to <strong>follow the link</strong> inside that e-mail to authorize the registration. Otherwise your submission will not be accepted and will eventually expire.
				</p>
				<p>
					Please have in mind that confirmation <strong>e-mail will expire in 1 day</strong> after creation.
				</p>
				<b-btn :disabled="!registration.status" variant="primary" @click="submit">{{!uuid.length ? 'Submit' : 'Update'}}</b-btn>
			</div>
		</div>		
	</b-container>
</template>

<script>
	const _ = require('lodash');
	import registration from './form/registration.vue';
	import { mapGetters } from 'vuex';
	import types from '../store/mutations';
	export default {
		components: {
			registration
		},
		data: () => ({
			registration: {
				value: {},
				status: false
			},
			showForm: false,
			popupIndex: 0,
			uuid: '',
			override: false
		}),
		created() {
			this.emailUpdated(this.email);
		},
		computed: {
			...mapGetters({
				email: 'getEmail',
				isAdmin: 'getIsAdmin',
			}),
			//-- email handlers
			emailIsValid() {
				return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,8}$/.test(this.email);
			},
			emailState() {
				return this.emailIsValid ? null : false;
			},
			emailFeedback() {
				return this.emailIsValid ? "" : "Please provide a valid e-mail address";
			}			
		},
		methods: {
			update(data) {
				this.registration.value = data.value;
				this.registration.status = data.status;
			},
			submit() {
				this.axios.post('/api/start/set', {
					email: this.email,
					registration: this.registration.value,
					uuid: this.uuid
				})
				.then((response) => {
					if(response.data.status) {
						//-- server error
						let error = response.data.error || new Error('not sure');
						throw error;						
					}
					else {
						this.$noty.success(`Your registration has been accepted. It is now awaiting for approval`);					
						this.uuid = response.data.uuid || '';
					}
				})
				.catch((error) => {
					this.$noty.error(`Something went wrong... more specifically: ${error.message}`);
					console.error(error.stack);
				})
			},
			emailUpdated: _.debounce(function(email) {
				this.showForm = false,
				this.$store.commit(types.SET_EMAIL, email.toLowerCase());
				this.$store.commit(types.SET_IS_ADMIN, false);
				if(this.emailIsValid && this.email.length) {
					this.axios.post('/api/start/get', { email })
					.then((response) => {	
						if(response.data.status) {
							let error = response.data.error || new Error('not sure');
							throw error;						
						}
						else {
							response = response.data;
							this.registration.value = {
								sponsor: {
									name: '',
									phone: ''
								},
								participants: {
									registration: "school",
									grades: [
										{ type: null, qty: 1}
									]
								},
								misc: {
									meals: 0,
									tshirts: []
								}
							};
							if(!response.registration.main || !response.registration.main.sponsor.name) {
								//-- unknown user
								if(this.popupIndex < 3) {
									this.$noty.info(([
										"I cannot recognize you, but you are welcome to continue",
										"Are you still typing? Can't recall your email? That's funny 😁",
										"OK, I'm done... I zipped it... no more disturbance from me..."
									])[this.popupIndex++]);
								}																	
							}
							else { 
								if(response.registration && response.registration.main) {
									let registration = response.registration.main;
									this.$noty.success(`Welcome back, ${registration.sponsor.name}`);
									//-- Copy registration data from server into form
									this.registration.value = _.cloneDeep(registration);
								}
							}
							this.$store.commit(types.SET_IS_ADMIN, response.admin);	
							this.showForm = true;												
						}					
					})
					.catch((error) => {
						//-- general error
						this.$noty.error(`Something went wrong... more specifically: ${error.message}`)
						console.error(error.stack);
					})
				}
			}, 500)
		}
	}
</script>
<style lang="scss">
	#email {
		text-transform: lowercase;
	}
	.form-control:focus,
	.form-control.is-invalid:focus,
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
	.disabled,
	:disabled {
		cursor: not-allowed;
	}
</style>

