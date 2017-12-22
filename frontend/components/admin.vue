<template>
	<b-container fluid v-if="isAdmin">
		<b-form-group :class="['login', 'my-3', 'p-3', 'bg-warning', 'rounded']">
			<b-row>
				<b-col cols="12" md>
					<b-row align-v="center" class="my-2">
						<b-col cols="12" sm="3" md="auto">
							<label><strong>E-mail</strong></label>
						</b-col>
						<b-col col sm>
							<b-form-input type="text" @input="credentialChecker('email',$event)" :value="email || ''" placeholder="admin's e-mail">
							</b-form-input>
						</b-col>
					</b-row>
				</b-col>
				<b-col cols="12" md>
					<b-row align-v="center" class="my-2">
						<b-col cols="12" sm="3" md="auto">
							<label><strong>Password</strong></label>
						</b-col>
						<b-col col sm>
							<b-input-group>
								<b-form-input type="password" class="border-right-0" @input="credentialChecker('password',$event)" placeholder="admin's password">
								</b-form-input>
								<b-input-group-button slot="right">
									<b-btn :disabled="!emailIsValid" variant="outline-dark" class="border-left-0" v-b-modal.passwordRecovery>forgotten...</b-btn>
								</b-input-group-button>
							</b-input-group>
						</b-col>
					</b-row>
				</b-col>
			</b-row>
		</b-form-group>
		<b-modal id="passwordRecovery" title="Forgotten your password?" ok-title="Confirm" cancel-title="Close" @ok="sendRecoveryEmail">
			<p>
				We will send an e-mail with password recovery link to <strong>{{credentials.email}}</strong>. Please confirm your will or close this dialog to cancel recovery process.
			</p>
		</b-modal>
		<records :credentials="credentials" v-if="authenticated"/>
		<b-alert v-else show variant="warning">
			<p class="text-justified">
				This banner will be replaced with the real admin interface as soon as you provide correct credentials. So keep on trying...
			</p>
		</b-alert>
	</b-container>
</template>

<script>
import { mapGetters } from "vuex";
import records from './records.vue'
import { debounce } from 'lodash';
export default {
	data: () => ({
		credentials: {
			email: "",
			password: ""
		},
		authenticated: false,
		registrations: []
	}),
	components: {
		records
	},
	created() {
		this.credentials.email = this.email;
		this.credentialChecker();
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if(!vm.isAdmin) {
				vm.$router.replace('/start');
			}
		});
	},
	computed: {
		...mapGetters({
			isAdmin: "getIsAdmin",
			email: "getEmail"
		}),
		credentialsReady() {
			return Object.keys(this.credentials).reduce(
				(a, i) => a && this.credentials[i].length > 0,
				true
			);
		},
		emailIsValid() {
			return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,8}$/.test(
				this.credentials.email
			);
		}
	},
	methods: {
		sendRecoveryEmail(e) {
			this.axios
			.post("/api/admin/password/request", {
				email: this.credentials.email
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`Password recovery e-mail has been sent`);
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		credentialChecker: debounce(function(source, value) {
			if (source in this.credentials) {
				this.credentials[source] = value;
			}
			if (this.credentialsReady) {
				this.authenticated = false;
				this.axios.post("/api/admin/eval", this.credentials)
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.authenticated = true;
					}
				})
				.catch(error => {
					console.error(error.message);
				});
			}
		}, 500)
	}
};
</script>

<style scoped>
	.login {
	}
	.form-control,
	.form-control:focus {
		border: 1px solid #343a40;
	}
	.form-control:focus,
	.form-control.is-invalid,
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
</style>

