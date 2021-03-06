<template>
	<b-container v-if="isBefore.update">
		<fieldset class="mt-3">
			<legend>
				Who are you?
			</legend>
			<div class="fieldset p-3 bg-light rounded">
				<b-form @submit.prevent="emailEval">
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
										ref="email"
										@input="emailUpdated"
										placeholder="just start typing...">
									</b-form-input>
								</b-input-group>							
							</b-col>
							<b-col v-if="emailIsValid" class="pl-0" cols="auto">
								<b-btn type="submit" variant="primary">Go!</b-btn>
							</b-col>
						</b-row>
						<div slot="feedback" class="d-flex justify-content-end mt-2">{{emailFeedback}}</div>
					</b-form-group>
				</b-form>
			</div>
		</fieldset>
		<!-- <div  class="bg-warning p-3 rounded my-3"> -->
		<b-alert v-if="showForm && isAdmin" show variant="info" class="my-3 py-3 rounded"> 
			<h4  class="mb-3">Welcome, Administrator!</h4>
			<p class="text-justify">
				The registration form is hidden for you because your account is associated with administrative privilege. You can access admin interface by clicking <router-link to="/admin">Admin</router-link> link in the navigation bar up top. 
			</p>
			<p class="text-justify">
				Please note that should you decide to walk through the registration process, your info will not be included into reports... because you are not a real user.
			</p>
			<b-btn variant="outline-info" @click="override = !override">Show/hide registration form</b-btn>
		</b-alert>
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
				<invisible-recaptcha 
					id="recaptcha"
					class="btn btn-primary"
					theme="light"
					:sitekey="reCAPTCHA_sitekey" 
					:disabled="!registration.status"
					:callback="submit">
					{{!uuid.length ? 'Submit' : 'Update'}}
				</invisible-recaptcha>
			</div>
		</div>		
	</b-container>
</template>

<script>
	import { debounce } from 'lodash';
	import moment from 'moment';
	import registration from './form/registration.vue';
	import InvisibleRecaptcha from './misc/InvisibleRecaptcha.vue';
	import { mapGetters } from 'vuex';
	import types from '../store/mutations';
	
	export default {
		components: {
			registration,
			"invisible-recaptcha": InvisibleRecaptcha
		},
		data: () => ({
			registration: {
				value: {},
				status: false
			},
			showForm: false,
			popupIndex: 0,
			uuid: '',
			override: false,
			reCAPTCHA_sitekey: ''
		}),
		beforeRouteEnter(to, from, next) {
			next(vm => {
				if(!vm.isBefore.update) {
					vm.$router.replace('/');
				}
			});
		},
		created() {
			this.emailUpdated(this.email);
		},
		mounted() {
			this.$nextTick(() => {
				if(this.$refs && this.$refs.email) {
					this.$refs.email.focus();
				}
			});
		},
		computed: {
			...mapGetters({
				email: 'getEmail',
				isAdmin: 'getIsAdmin',
				eventDate: 'getEventDate',
			}),
			dates() {
				let event = moment(this.eventDate).startOf('day');
				let update = moment(event).subtract(2,'weeks');
				return {
					event, update
				};
			},
			isBefore() {
				let update = moment().isBefore(this.dates.update);
				return { 
					update
				};
			},
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
			submit(response) {
				this.axios.post('/api/start/set', {
					recaptcha: response,
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
			emailUpdated: debounce(
				function(email) {
					email = email.toLowerCase();
					if(email !== this.email) {
						this.$store.commit(types.SET_EMAIL, email);
						this.$store.commit(types.SET_IS_ADMIN, false);
						this.showForm = false;
						this.uuid = '';	
						this.override = false;
					}
				}, 500
			),
			keyup(e) {
				if(this.emailIsValid) {
					this.emailEval();
				}
			},
			emailEval() {
				//-- Shortcut for clicking Admin link -- second submission of the form
				if(this.isAdmin) {
					this.$router.push('/admin');
					return;
				}
				//-- Defaults				
				this.registration.value = {
					sponsor: {
						name: '',
						phone: ''
					},
					participants: {
						registration: "school",
						school: "",
						grades: [
							{ type: null, qty: 1}
						]
					},
					misc: {
						meals: 0,
						tshirts: []
					}
				};
				//-- Refreshing the store
				this.$store.commit(types.SET_IS_ADMIN, false);
				//-- Sending request for validation to the backend
				if(this.emailIsValid && this.email.length) {
					this.axios.post('/api/start/get', { email: this.email })
					.then((response) => {	
						if(response.data.status) {
							let error = response.data.error || new Error('not sure');
							throw error;						
						}
						else {
							response = response.data;
							if(!response.registration.main || !response.registration.main.sponsor.name) {
								//-- unknown user
								if(this.popupIndex < 3 && !response.admin) {
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
									this.registration.value = {...registration};
								}
							}
							this.$store.commit(types.SET_IS_ADMIN, response.admin);	
							this.reCAPTCHA_sitekey = response.sitekey;
							this.showForm = true;												
						}					
					})
					.catch((error) => {
						//-- general error
						this.$noty.error(`Something went wrong... more specifically: ${error.message}`)
						console.error(error.stack);
					})
				}
			}
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

