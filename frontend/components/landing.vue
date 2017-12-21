<template>
	<b-container fluid class="my-3">
		<b-row align-h="center">
			<b-col cols="12" lg="10" xl="8">
				<b-card
					bg-variant="transparent"
					class="border-0">
					<img src="../logo.png" class="card-img card-img-top img-fluid" />					
					<b-card-body
						title="Welcome"
						sub-title="Thank you for using our registration portal">
						<p class="card-text mt-3 text-justify">
							This portal is designed to support registration of School team(s) and individual students for the upcoming <strong>Junior Math Tournament</strong>. Start the process by clicking the button below, and have in mind that you will always be able to revise the registration by visiting this application again. 
						</p>
						<p>
							Registration portal will close on <strong>February 16<span class="superscript">th</span>, 2018</strong>.
						</p>
						<hr>
						<p v-if="showStat" class="text-center">
							So far we received registrations from <span class="text-danger">{{summary.numTeams}} schools/individuals </span> bringing <span class="text-danger">{{summary.numStudents}} students</span>.
						</p>
						<b-btn variant="success" to="/start" class="d-block">Let's Get Started</b-btn>
					</b-card-body>
				</b-card>
			</b-col>
		</b-row> 
	</b-container>
</template>

<script>
	import types from '../store/mutations'
	export default {
		data: () => ({
			showStat: false,
			summary: {}
		}),
		created() {
			this.$store.commit(types.SET_IS_ADMIN, false);
			this.$store.commit(types.SET_EMAIL, '');
			
			this.axios.post('/api/statistics')
			.then(response => {
				if(!response.data.status) {
					this.showStat = true;
					this.summary = response.data.summary;
				}
			})
			.catch(error => {
				console.error(error.message);
			}); 
			
		}
	}
</script>

<style>
	.card-img {
		max-width: 75%;
		display: block;
		margin: 0 auto;
	}
	.superscript {
		vertical-align: super;
	}
</style>

