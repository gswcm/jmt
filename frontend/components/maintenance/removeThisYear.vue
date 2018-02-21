<template>
	<div>
		<h4>Remove this year tournament data</h4>
		<p class="mt-3 text-justify">
			Rolling out to the next cycle requires cleaning up existing records. Using this interface you can remove all <i>registrations</i>, <i>questions</i>, and <i>scans</i>. This action has to be performed 6 months after the last tournament event, but before setting up the next tournament date.  
		</p>
		<b-btn class="ml-auto d-block" variant="outline-danger" @click="removeThisYear">Remove this year data</b-btn>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
	data: () => ({
	}),
	computed: {
		...mapGetters({
			credentials: 'getCredentials',
		}),
	},
	created() {
	},
	methods: {
		removeThisYear() {
			this.axios
			.post("/api/mtn/removeThisYear", {
				credentials: this.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`You can now roll to the next year cycle`);					
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
	}
};
</script>

