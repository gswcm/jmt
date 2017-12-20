<template>
	<div>
		<!-- <b-btn 
			variant="outline-dark"
			@click="refresh">
			<span class="oi oi-reload"></span>
		</b-btn> -->
		<b-row>
			<b-col cols="12" sm="auto">
				<h4>Filters</h4>
				<div class="bg-light p-3 my-3">
					<b-form-group label="Payment status">
						<b-form-radio-group v-model="paid">
							<b-form-radio :value="true">Paid</b-form-radio>
							<b-form-radio :value="false">Not paid</b-form-radio>
							<b-form-radio :value="null">Any</b-form-radio>
						</b-form-radio-group>
					</b-form-group>
				</div>
			</b-col>
			<b-col cols="auto" class="d-none d-sm-block px-0 border-left"></b-col>
			<b-col cols="12" sm>
				<div v-if="options.length" class="mt-3">	
					<b-row align-v="center">
						<b-col cols="auto">
							<label><strong>Sponsor's email</strong></label>
						</b-col>
						<b-col col cols>
							<b-form-select v-model="email" :options="options"/>
						</b-col>	
					</b-row>
				</div>
				<b-alert v-else show variant="warning">
					<h5>No records found</h5>
				</b-alert>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	export default {
		data: () => ({
			records: [],
			paid: false,
			email: ''
		}),
		created() {
			this.refresh();
		},
		watch: {
			paid() {
				this.refresh()
			}
		},
		computed: {
			options() {
				return this.records.map(i => i.email);
			},
		},
		methods: {
			refresh() {
				this.axios.post("/api/records", {
					filter: {
						account: {
							admin: false
						},
						registration: {
							paid: {
								$in: this.paid === null ? [true,false] : [this.paid]
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
						this.email = this.records.length ? this.records[0].email : null;
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

