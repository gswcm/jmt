<template>
	<div>
		<b-row>
			<b-col cols="12" sm="auto">
				<h4>Filters</h4>
				<div class="bg-light px-3 py-1 mt-1 rounded">
					<!-- Payment status -->
					<b-form-group label="Payment status">
						<b-form-radio-group :checked="filter.paid" @input="filterUpdated('paid',$event)">
							<b-form-radio :value="true">Paid</b-form-radio>
							<b-form-radio :value="false">Not paid</b-form-radio>
							<b-form-radio :value="null">Any</b-form-radio>
						</b-form-radio-group>
					</b-form-group>
					<!-- Partial email match -->
					<b-form-group label="Sponsor's e-mail contains...">
						<b-form-input :value="filter.email" @input="debounce('email',$event)" type="text" placeholder="part of the sponsor's e-mail"></b-form-input>
					</b-form-group>
					<!-- Partial sponsor name match -->
					<b-form-group label="Sponsor's name contains...">
						<b-form-input :value="filter.name" @input="debounce('name',$event)" type="text" placeholder="part of the sponsor's name"></b-form-input>
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
				</div>
			</b-col>
			<b-col cols="auto" class="d-none d-sm-block px-0 border-left"></b-col>
			<b-col cols="12" sm>
				<div v-if="options.length" class="mt-3">	
					<b-alert show variant="info">
						<!-- Select sponsor's e-mail -->
						<b-row align-v="center">
							<b-col cols="auto">
								<label><strong>Sponsor's email</strong></label>
							</b-col>
							<b-col col cols>
								<b-form-select v-model="email" :options="options"/>
							</b-col>	
						</b-row>
						<!-- Change payment status -->
						<b-form-checkbox class="mt-3" :checked="paid" @change="paidUpdated">
							Payment status
						</b-form-checkbox>
					</b-alert>
					<registration :value="reg" :options="{ debug: false, ro: true }"/>
				</div>
				<b-alert v-else show variant="warning">
					<h5>No records found</h5>
				</b-alert>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	import { debounce, escapeRegExp } from 'lodash';
	import registration from './form/registration.vue';
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
				email: '',
				admin: false,
				name: ''
			},
			email: '',
			paid: false
		}),
		created() {
			this.refresh();
		},
		watch: {
			email() {
				console.log(this.email);
				let record = this.records.find(i => i.email === this.email);
				this.paid = record ? record.paid : false; 				
			} 
		},
		computed: {
			reg() {
				let temp = this.records.find(i => i.email === this.email);
				return temp = 'main' in temp ? temp.main : {}
			},
			options() {
				return this.records.map(i => i.email);
			},
		},
		methods: {
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
				this.axios.post("/api/admin/records", {
					filter: {
						account: {
							admin: {
								$in: this.filter.admin === null ? [true,false] : [this.filter.admin]
							}
						},
						registration: {
							paid: {
								$in: this.filter.paid === null ? [true,false] : [this.filter.paid]
							},
							email: {
								$regex: escapeRegExp(this.filter.email)
							},
							"main.sponsor.name": {
								$regex: escapeRegExp(this.filter.name),
								$options: 'i'
							}
						}
					}
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.records = response.data.records;
						if(this.records.length) {
							let record = this.records.find(i => i.email === this.email);	
							if(record) {
								this.paid = record.paid;
							}
							else {
								this.email = this.records[0].email;
								this.paid = this.records[0].paid;	
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
</style>

