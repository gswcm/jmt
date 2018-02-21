<template>
	<div>
		<h4>Day of the event</h4>
		<p>
			Here you can specify when the tournament will take place next time. Based on that date the 2 more dates are calculated on fly:
			<ol>
				<li>Payment deadline (1 month before)</li>
				<li>Deadline for create/update registrations (2 weeks before)</li>
			</ol>
		</p>
		<b-row align-v="center" class="my-2">
			<b-col cols="12">
				<label><strong>Day of the tournament</strong></label>
			</b-col>
			<b-col cols="12">
				<datepicker 
					:disabled="datepickingDisabled"
					:class="['border', 'rounded', 'p-1', 'datepicker', 'd-inline-block', eventDate ? 'border-dark' : 'border-danger']" 
					placeholder="Select date" 
					v-model="eventDate"/>
			</b-col>
		</b-row>
		<b-btn :disabled="!eventDate" class="ml-auto d-block" variant="outline-danger" @click="updateEventDate(true)">Update</b-btn>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import Datepicker from 'vuejs-datepicker'
export default {
	data: () => ({
		eventDate: null,
		datepickingDisabled: {
			//-- Dates can be set up to 5 days before today's date
			to: (() => {
				let d = new Date();
				d.setDate(d.getDate()-365);
				return d;
			})()
		}
	}),
	created() {
		this.updateEventDate()
	},
	components: {
		Datepicker
	},
	computed: {
		...mapGetters({
			credentials: 'getCredentials',
		}),
	},
	methods: {
		updateEventDate(update = false) {
			this.axios
			.post("/api/mtn/timeline", {
				credentials: this.credentials,
				eventDate: this.eventDate,
				update
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					if(response.data.timeline && response.data.timeline.eventDate) {
						this.eventDate = response.data.timeline.eventDate;
					}
					if(update) {
						this.$noty.success(`Event date has been updated`);
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
};
</script>

<style>
	.datepicker input {
		border: none;
	}
</style>

