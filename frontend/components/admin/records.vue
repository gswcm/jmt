<template>
	<b-row class="p-4">
		<b-col cols="12" md="auto">
			<h4>Filters</h4>
			<div class="bg-light px-3 py-1 mt-3 rounded">
				<!-- Payment status -->
				<b-form-group label="Payment status">
					<b-form-radio-group :checked="filter.paid" @input="filterUpdated('paid',$event)">
						<b-form-radio :value="true">Paid</b-form-radio>
						<b-form-radio :value="false">Not paid</b-form-radio>
						<b-form-radio :value="null">Any</b-form-radio>
					</b-form-radio-group>
				</b-form-group>
				<!-- Partial email match -->
				<b-form-group label="Sponsor's <span class='text-info'>e-mail</span> contains...">
					<b-form-input :value="filter.email" @input="debounce('email',$event)" type="text" placeholder="part of the sponsor's e-mail"></b-form-input>
				</b-form-group>
				<!-- Partial sponsor name match -->
				<b-form-group label="Sponsor's <span class='text-info'>name</span> contains...">
					<b-form-input :value="filter.name" @input="debounce('name',$event)" type="text" placeholder="part of the sponsor's name"></b-form-input>
				</b-form-group>
				<!-- Partial school name match -->
				<b-form-group label="<span class='text-info'>School</span> name contains...">
					<b-form-input :value="filter.school" @input="debounce('school',$event)" type="text" placeholder="part of the school name"></b-form-input>
				</b-form-group>
				<hr>
				<!-- Admin status -->
				<b-form-group label="Admin status">
					<b-form-radio-group :checked="filter.admin" @input="filterUpdated('admin',$event)">
						<b-form-radio :value="true">Admin</b-form-radio>
						<b-form-radio :value="false">Regular user</b-form-radio>
						<b-form-radio :value="null">Any</b-form-radio>
					</b-form-radio-group>
				</b-form-group>
				<hr>
				<!-- Registration confirmation status -->
				<b-form-group label="Confirmation status">
					<b-form-radio-group :checked="filter.confirmed" @input="filterUpdated('confirmed',$event)">
						<b-form-radio :value="true">Confirmed</b-form-radio>
						<b-form-radio :value="false">Pending</b-form-radio>
						<b-form-radio :value="null">Any</b-form-radio>
					</b-form-radio-group>
				</b-form-group>
			</div>
			<div class="mt-3 d-flex justify-content-start">
				<!-- Refresh -->
				<b-btn variant="outline-dark" @click="refresh" v-b-tooltip.hover title="Refresh filtered results">
					<font-awesome-icon :icon="['fas', 'sync-alt']"/>					
					Refresh
				</b-btn>
				<b-btn class="ml-3" variant="outline-dark" v-clipboard:copy="options" v-clipboard:success="onCopy" v-b-tooltip.hover title="Copy all emails to clipboard">
					<font-awesome-icon :icon="['fas', 'copy']"/>
					All emails
				</b-btn>
			</div>
		</b-col>
		<b-col cols="auto" class="d-none d-md-block px-0 border-left"></b-col>
		<b-col cols="12" md>
			<div v-if="options.length" class="">	
				<b-alert show variant="info" class="pt-3">
					<!-- Select sponsor's e-mail -->
					<b-row align-v="center">
						<b-col cols="12" sm="" md="12" lg="">
							<b-row align-v="center">
								<b-col cols="auto">
									<label><strong>Sponsor's email</strong></label>
								</b-col>
								<b-col cols="" class="pl-0">
									<b-form-select v-model="email" :options="options"/>
								</b-col>
							</b-row>
						</b-col>	
						<b-col cols="12" class="d-sm-none d-md-block d-lg-none py-1"></b-col>
						<b-col cols="auto" sm="auto" class="pl-0 order-2 order-md-2 order-sm-1 order-lg-1 ml-auto ml-sm-0 ml-md-auto ml-lg-0">
							<b-btn class="" variant="outline-dark" v-b-modal.confirmRegistration v-b-tooltip.hover title="Confirm registration">
								<!-- <i class="fa fa-check" aria-hidden="true"></i> -->
								<font-awesome-icon :icon="['fas', 'check']"/>
							</b-btn>
							<b-btn class="" variant="outline-dark" v-b-modal.removeRecord v-b-tooltip.hover title="Remove registration">
								<!-- <i class="fa fa-trash" aria-hidden="true"></i> -->
								<font-awesome-icon :icon="['fas', 'trash-alt']"/>
							</b-btn>
							<b-btn class="" variant="outline-dark" v-clipboard:copy="email" v-clipboard:success="onCopy" v-b-tooltip.hover title="Copy email to clipboard">
								<!-- <i class="fa fa-clipboard" aria-hidden="true"></i> -->
								<font-awesome-icon :icon="['fas', 'copy']"/>
							</b-btn>								
						</b-col>
						<b-col cols="5" sm="12" md="4" lg="12" class="order-1 order-md-1 order-sm-2 order-lg-2">
							<!-- Change payment status -->
							<b-form-checkbox class="mt-3 ml-auto" :checked="paid" @change="paidUpdated">
								Payment <span class="d-none d-sm-inline-block d-md-none d-lg-inline-block">status</span>
							</b-form-checkbox>
						</b-col>	
					</b-row>
					<!-- Confirm removal -->
					<b-modal id="removeRecord" title="Are you sure?" ok-title="Confirm" cancel-title="Close" @ok="removeRecord">
						<p>
							You are about to permanently remove registration record for <strong>{{email}}</strong>. Please confirm your will or close this dialog to cancel.
						</p>
					</b-modal>
					<!-- Confirm converting Temp -> Main -->
					<b-modal id="confirmRegistration" title="Are you sure?" ok-title="Confirm" cancel-title="Close" @ok="confirmRegistration">
						<p>
							You are about confirm temporal registration for <strong>{{email}}</strong>. Please confirm your will or close this dialog to cancel.
						</p>
					</b-modal>
				</b-alert>
				<registration v-if="reg !== null" :value="reg" :options="{ debug: false, ro: true }"/>					
			</div>
			<b-alert v-else show variant="warning">
				<h5>No records found</h5>
			</b-alert>
		</b-col>
	</b-row>
</template>

<script>
	import { debounce, escapeRegExp } from 'lodash';
	import registration from '../form/registration.vue';
	export default {
		components: {
			registration
		},
		props: {
			credentials: Object
		},
		data: () => ({
			records: [],
			filter: {
				paid: null,
				admin: false,
				confirmed: true,
				email: '',
				name: '',
				school: ''
			},
			email: '',
		}),
		created() {
			this.refresh();
		},
		computed: {
			paid() {
				let record = this.records.find(i => i.email === this.email);
				return record ? record.paid : false;
			},
			reg() {
				let record = this.records.find(i => i.email === this.email);
				return record.main ? record.main : record.temp;
			},
			options() {
				return this.records.map(i => i.email);
			},
		},
		methods: {
			onCopy(e) {
				this.$noty.success(`E-mail(s) copied into clipboard`);
			},
			confirmRegistration() {
				this.axios.post("/api/admin/confirm", {
					email: this.email,
					credentials: this.credentials
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.$noty.success(`Registration for ${response.data.email} has been confirmed`);
						this.refresh();
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			},
			removeRecord() {
				this.axios.post("/api/admin/remove", {
					email: this.email,
					credentials: this.credentials
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.$noty.success(`Registration record for ${response.data.email} has been removed`);
						this.refresh();
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			},
			paidUpdated(value) {
				this.axios.post("/api/admin/paid", {
					email: this.email,
					credentials: this.credentials,
					paid: value,
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.$noty.success(`Payment status has been updated to '${response.data.paid ? 'paid' : 'not paid'}'`);
						this.refresh();
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			},
			debounce: debounce(function(source,value) {
				this.filterUpdated(source,value)
			}, 500),
			filterUpdated(source,value) {
				this.filter[source] = value;
				this.refresh();
			},
			refresh() {
				let filter = {
					account: {
						admin: {
							$in: this.filter.admin === null ? [true,false] : [this.filter.admin]
						}
					},
					registration: {}
				};
				if(this.filter.paid !== null) {
					filter.registration["paid"] = this.filter.paid;
				}
				if(this.filter.email.length) {
					filter.registration["email"] = {
						$regex: escapeRegExp(this.filter.email)
					}
				}
				if(this.filter.name.length) {
					filter.registration["temp.sponsor.name"] = {
						$regex: escapeRegExp(this.filter.name),
						$options: 'i'
					}
				}
				if(this.filter.school.length) {
					filter.registration["temp.participants.school"] = {
						$regex: escapeRegExp(this.filter.school),
						$options: 'i'
					}
				}
				if(this.filter.confirmed !== null) {
					filter.registration["main"] = this.filter.confirmed ? { $ne: null} : { $eq: null };
				}
				/*
						paid: {
							$in: this.filter.paid === null ? [true,false] : [this.filter.paid]
						},
						email: {
							$regex: escapeRegExp(this.filter.email)
						},
						"main.sponsor.name": {
							$regex: escapeRegExp(this.filter.name),
							$options: 'i'
						},
						"main.participants.school": {
							$regex: escapeRegExp(this.filter.school),
							$options: 'i'
						},
						main: this.filter.confirmed ? 
							{ $ne: null } : 
							this.filter.confirmed === false ? 
								{ $eq: null } : 
								{ $exists: true }
					}
				};
				*/
				this.axios.post("/api/admin/records", { filter })
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.records = response.data.records;
						if(this.records.length) {
							if(!this.records.find(i => i.email === this.email)) {
								this.email = this.records[0].email;
							}
						}
						else {
							this.email = null;
						}
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			}
		}
	}
</script>

<style lang="scss">
	.border-left {
		border-left: 2px solid #aaa;
	}
	hr {
		border: 1px solid black;
	}
	.nav-tabs:focus {
		outline: none;
	}
</style>

