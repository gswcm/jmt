<template>
	<b-btn 
		variant="outline-dark"
		@click="refresh">
		<span class="oi oi-reload"></span>
	</b-btn>
</template>

<script>
	export default {
		data: () => ({
			records: []
		}),
		created() {
			this.refresh();
		},
		methods: {
			refresh() {
				this.axios.post("/api/records", {
					filter: {
						account: {
							admin: {
								$in: [ true, false ]
							}
						},
						registration: {
							"main.misc.meals": {
								$gt: 0
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
						console.log(JSON.stringify(response.data.records,null,3));
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
