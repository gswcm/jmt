<template>
	<b-container fluid class="my-3">
		<b-row align-h="center">
			<b-col cols="12" lg="10" xl="8">
				<b-card
					bg-variant="transparent"
					class="border-0"
					title="Welcome"
					img-src="logo.png"
					sub-title="Thank you for using our registration portal">
					<p class="card-text mt-3 text-justify">
						This portal is designed to support registration of School team(s) and individual students for the upcoming Junior Math Tournamnet. Start the process by clicking the button below, and have in mind that you will always be able to revise the registration by visiting this application again while using the same e-mail address. 
					</p>
					<hr>
					<p v-if="showStat" class="text-center">
						So far we received registrations from <span class="text-danger">{{summary.numTeams}} teams</span> bringing <span class="text-danger">{{summary.numStudents}} students</span>.
					</p>
					<b-btn variant="primary" to="/start" class="d-block">Let's Get Started</b-btn>
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
			this.$store.commit(types.SET_EMAIL_VALUE, '');
			/* 
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
			*/
		}
	}
</script>

<style>
	.card-img {
		max-width: 75%;
		display: block;
		margin: 0 auto;
	}
</style>

