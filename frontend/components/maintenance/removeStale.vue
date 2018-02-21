<template>
	<div>
		<h4>Remove stale database entries</h4>
		<p class="mt-3 text-justify">
			Stale (partially empty, unused) database records are created as a result of improper user actions and have to be eliminated. Both "accounts" and "registrations" collections are subjects of such processing. The following types of records will be removed:
			<ul>
				<li>Records from "accounts" without matching "registrations"</li>
				<li>Records from "registrations" with both <strong>main</strong> and <strong>temp</strong> attributes set to <strong>null</strong></li>	
			</ul>
		</p>
		<b-btn class="ml-auto d-block" variant="outline-danger" @click="removeStaleData">Remove stale data</b-btn>
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
		removeStaleData() {
			this.axios
			.post("/api/mtn/removeStale", {
				credentials: this.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`Stale records have been removed`);
					console.log(JSON.stringify(response.data.stat,null,3));
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

