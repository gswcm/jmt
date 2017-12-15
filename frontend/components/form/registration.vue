<template>
	<div>
		<div class="bg-light p-3 text-info border-info border" v-if="options.debug">
			<pre>{{JSON.stringify(runtime,null,3)}}</pre>	
			<pre>{{JSON.stringify(status,null,3)}}</pre>	
		</div>
		<sponsor
			:value="runtime.value.sponsor"
			@input="update('sponsor', $event)">
		</sponsor>
		<team
			:value="runtime.value.team"
			@input="update('team', $event)">
		</team>
	</div>
</template>

<script>
	const _ = require('lodash');
	import sponsor from './sponsor.vue';
	import team from './team.vue';
	export default {
		components: {
			sponsor, team
		},
		props: {			
			value: Object,
		},
		data: () => ({
			runtime: {
				value: {},
				status: {}
			},
			status: false,
			options: {
				debug: true,
				verbose: true,
				ro: false
			}
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
			},
		},
	}
</script>

