<template>
	<fieldset class="mt-3">
		<legend :class="[status ? '' : 'text-danger']">
			The Team
		</legend>
		<div class="bg-light p-3 text-info border-info border" v-if="options.debug">
			<pre>{{JSON.stringify(runtime,null,3)}}</pre>	
			<pre>{{JSON.stringify(status,null,3)}}</pre>	
		</div>
		<div class="fieldset p-3 bg-light rounded">
			<!-- Meals -->
			<b-row align-h="between" align-v="center"class="my-3">
				<b-col cols="auto">
					<h5 class="text-info">Meals <small v-show="options.verbose">($7.5 each)</small></h5>
				</b-col>
			</b-row>
			<b-form-group> 	
				<b-row align-v="center">
					<b-col cols="auto" sm="auto">	
						<label>Number of meal tickets</label>
					</b-col>
					<b-col col sm="">
						<b-form-input 
							:disabled="options.ro"
							type="number" 
							:value="runtime.value.meals"
							:state="state(runtime.status.meals)"
							@input="update('meals',$event)">
						</b-form-input>	
					</b-col>
				</b-row>
			</b-form-group>
		</div>
	</fieldset>
</template>

<script>
	const _ = require('lodash');
	export default {
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
				debug: false,
				verbose: true,
				ro: false
			}
		}),
		created() {
			this.runtime.value = _.cloneDeep(this.value);
			Object.keys(this.runtime.value).forEach(key => {
				this.runtime.status[key] = this.validate(key);
			});
			this.update();
		},
		methods: {
			update(key, value) {
				if(key) { 
					this.runtime.value[key] = _.cloneDeep(value);
					this.runtime.status[key] = this.validate(key);
				}
				this.status = Object.keys(this.runtime.status).reduce((a,i) => a && this.runtime.status[i], true);
				this.$emit('input', {
					value: _.cloneDeep(this.runtime.value),
					status: this.status
				});
			},
			validate(key) {
				switch (key) {
					case "meals": return /[0-9]+/.test(this.runtime.value.meals) && parseInt(this.runtime.value.meals) >= 0;
				}
			},
			state(isValid) {
				return isValid ? null : false;
			},
		},
	}
</script>

<style>
	.form-control:focus,
	.form-control.is-invalid:focus,
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
</style>

