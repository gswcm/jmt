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
	const _ = require('lodash');
	import sponsor from './sponsor.vue';
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
		created() {
			this.runtime.value = _.cloneDeep(this.value);
		},
		methods: {
			update(key, data) {
				if(key) {
					this.runtime.value[key] = _.cloneDeep(data.value);
					this.runtime.status[key] = data.status;
				}
				this.status = Object.keys(this.runtime.status).reduce((a,i) => a && this.runtime.status[i], true);
				this.$emit('input', {
					value: _.cloneDeep(this.runtime.value),
					status: this.status
				});
				this.updateTotal()
			},
			updateTotal() {
				let base = this.runtime.value;
				let tshirts = base.misc.tshirts.reduce((a,i) => a + parseInt(i.qty), 0) * 10;
				let meals = parseInt(base.misc.meals) * 7.5;
				if(this.status) {
					if(base.participants.registration === "school") {
						let arr = [50,75].map(i => {
							return i + meals + tshirts
						});
						this.total = `\$${arr[0]} (${arr[1]})`;
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

