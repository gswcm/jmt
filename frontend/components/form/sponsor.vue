<template>
	<fieldset class="mt-3">
		<legend :class="[status ? '' : 'text-danger']">
			The Sponsor
		</legend>
		<div class="bg-light p-3 text-info border-info border" v-if="options.debug">
			<pre>{{JSON.stringify(runtime,null,3)}}</pre>	
			<pre>{{JSON.stringify(status,null,3)}}</pre>	
		</div>
		<div class="fieldset p-3 bg-light rounded">
			<b-form-group 										
				label-for="name"
				:state="state(runtime.status.name)">
				<b-row align-v="center">
					<b-col cols="12" sm="auto">
						<label>Sponsor's name<span class="text-danger">*</span></label>
					</b-col>
					<b-col col sm>
						<b-form-input 
							type="text" 
							:disabled="options.ro"
							:state="state(runtime.status.name)"
							:value="runtime.value.name"
							@input="update('name',$event)"
							placeholder="don't leave me empty">
						</b-form-input>
					</b-col>		
				</b-row>
			</b-form-group>
			<b-form-group 										
				label-for="phone">
				<b-row align-v="center" v-show="!options.ro || (options.ro && runtime.value.phone.length > 0)">
					<b-col cols="12" sm="auto">
						<label>Sponsor's phone number</label>
					</b-col>
					<b-col col sm>
						<b-form-input 
							type="tel" 
							:disabled="options.ro"
							:value="runtime.value.phone"
							@input="update('phone',$event)"
							placeholder="sponsor's phone number">
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
					case "name": return /^[a-zA-Z0-9 '.,-]+$/.test(this.runtime.value[key]);
					case "phone": return true;
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

