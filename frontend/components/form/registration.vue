<template>
	<div>
		<div class="bg-light p-3 text-info border-info border" v-if="options.debug">
			<pre>{{JSON.stringify(runtime,null,3)}}</pre>
			<pre>{{JSON.stringify(status,null,3)}}</pre>
		</div>
		<sponsor
			:value="runtime.value.sponsor"
			:ro="options.ro"
			@input="update('sponsor', $event)">
		</sponsor>
		<participants
			:value="runtime.value.participants"
			:ro="options.ro"
			@input="update('participants', $event)">
		</participants>
		<misc
			:value="runtime.value.misc"
			:ro="options.ro"
			@input="update('misc', $event)">
		</misc>
		<b-row align-h="end">
			<b-col cols="auto" >
				<h2 class="p-3">Total: {{total}}</h2>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	import { cloneDeep } from 'lodash';
	import { mapGetters } from "vuex";
	import sponsor from './sponsor.vue';
	import moment from 'moment';
	import misc from './misc.vue';
	import participants from './participants.vue';
	export default {
		components: {
			sponsor, misc, participants
		},
		props: {
			value: Object,
			options: {
				type: Object,
				default: () => ({
					debug: false,
					ro: false
				})
			}
		},
		data: () => ({
			runtime: {
				value: {},
				status: {}
			},
			status: false,
			total: ""
		}),
		computed: {
			...mapGetters({
				eventDate: 'getEventDate',
			}),
			dates() {
				let event = moment(this.eventDate).startOf('day');
				let payment = moment(event).subtract(1,'months');
				return {
					event, payment
				};
			},
		},
		created() {
			this.runtime.value = cloneDeep(this.value);
		},
		watch: {
			value() {
				this.runtime.value = cloneDeep(this.value);
			}
		},
		methods: {
			update(key, data) {
				if(key) {
					this.runtime.value[key] = cloneDeep(data.value);
					this.runtime.status[key] = data.status;
				}
				this.status = Object.keys(this.runtime.status).reduce((a,i) => a && this.runtime.status[i], true);
				this.$emit('input', {
					value: cloneDeep(this.runtime.value),
					status: this.status
				});
				this.updateTotal()
			},
			updateTotal() {
				let base = this.runtime.value;
				let tshirts = base.misc.tshirts.reduce((a,i) => a + parseInt(i.qty), 0) * 10;
				let meals = parseInt(base.misc.meals) * 8;
				if(this.status) {
					if(base.participants.registration === "school") {
						let arr = [50,75].map(i => {
							return i + meals + tshirts
						});
						this.total = moment().isBefore(this.dates.payment) ? `\$${arr[0]}` : `\$${arr[1]}`;
					}
					else {
						this.total = `\$${base.participants.grades.reduce((a,i) => a + parseInt(i.qty), 0) * 20 + meals + tshirts}`;
					}
				}
				else
					this.total = "N/A";
			}
		},
	}
</script>

