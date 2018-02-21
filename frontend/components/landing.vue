<template>
	<b-container fluid class="my-3">
		<b-row align-h="center">
			<b-col cols="12" lg="10" xl="8" class="p-5">
				<img src="../logo.png" class="card-img card-img-top img-fluid" />	
				<h2 class="mt-5">Welcome,</h2>
				<!-- Open registration -->
				<template v-if="isBefore.update">
					<p class="text-justify">
						This portal is designed to support registration of School team(s) and individual students for the upcoming <strong>Junior Math Tournament</strong>. The tournament will take place {{dates.event.fromNow()}} on <strong>{{dates.event.format('LL')}}</strong>. 
					</p>
					<h4 class="mt-4">Registration</h4>	
					<p class="text-justify">
						You can <strong>create new</strong> or <strong> revise existing</strong> registration any time <strong>before {{dates.update.format('LL')}}</strong> by visiting this page and clicking button down below. Changes <strong>after the deadline</strong> can only be made by organizers (see <a href="/about">About</a> page for contact information).
					</p>
					<h4 class="mt-4">Payment</h4>
					<p class="text-justify">
						Payment for the tournament has to be received <strong>before the event</strong>. Registrations paid after <strong>{{dates.payment.format('LL')}}</strong> are associated with the late payment fee.
						<span v-if="isBefore.payment" class="text-justify">
							You have <strong>{{dates.payment.fromNow(true).split(/\s+/).join(" more ")}}</strong> to pay the registration <strong>without late fee</strong>.  
						</span>
					</p>
					<p v-if="!isBefore.payment" class="test-justify">
						It seems that payment deadline has already passed. If you didn't pay yet, please do it at your earliest chance &mdash; go to the registration page to see your <strong>actual</strong> balance.
					</p>
					<b-alert show dismissible variant="info" v-if="showStat" class="text-justify mt-4">
						So far we received registrations from <span class="text-danger">{{summary.numTeams}} schools/individuals</span> bringing <span class="text-danger">{{summary.numStudents}} students</span>.
					</b-alert>
					<div class="d-flex justify-content-center mt-5">
						<b-btn variant="primary" to="/start">
							Let's Get Started
						</b-btn>
					</div>
				</template>
				<!-- Closed registration -->
				<template v-else>
					Unfortunately we can no longer accept new registrations or revisions. Please contact organizers (see <a href="/about">About</a> page for contact information) should you have any questions or concerns. 
				</template>
			</b-col>
		</b-row> 
	</b-container>
</template>

<script>
	import types from '../store/mutations'
	import moment from 'moment';
	import { mapGetters } from 'vuex';
	export default {
		data: () => ({
			showStat: false,
			summary: {}
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
				eventDate: 'getEventDate',
			}),
			dates() {
				let event = moment(this.eventDate).startOf('day');
				let payment = moment(event).subtract(1,'months');
				let update = moment(event).subtract(2,'weeks');
				return {
					event, payment, update
				};
			},
			isBefore() {
				let payment = moment().isSameOrBefore(this.dates.payment);
				let update = moment().isBefore(this.dates.update);
				return { 
					payment, update
				};
			}
		},
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

