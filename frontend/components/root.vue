<template>
	<div class="root">
		<b-navbar sticky toggleable="md" type="dark" variant="dark">
			<b-nav-toggle target="nav_collapse"></b-nav-toggle>
			<b-navbar-brand to="/">
				<span class="d-inline-block">
					Junior Math Tournament <br class="d-sm-none"/> GSW
				</span>
			</b-navbar-brand>
			<b-collapse is-nav id="nav_collapse">
				<b-navbar-nav class="ml-auto">
					<b-nav-item href="/about">About</b-nav-item>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
		<!-- <keep-alive> -->
		<router-view></router-view>
		<!-- </keep-alive> -->
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import types from '../store/mutations';
	import moment from 'moment';
	export default {
		data: () => ({
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
				eventDate: 'getEventDate',
			}),
		},
		created() {
			this.getEventDate();
		},
		methods: {
			getEventDate() {
				this.axios
				.post("/api/mtn/timeline", {
					update: false
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						if(response.data.timeline && response.data.timeline.eventDate) {
							this.$store.commit(types.SET_EVENT_DATE, response.data.timeline.eventDate);
						}
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
	}
</script>

<style>
	.root {
		min-width: 420px;
	}
</style>

