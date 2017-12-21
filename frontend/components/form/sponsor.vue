<template>
	<fieldset class="mt-3">
		<legend :class="[status ? '' : 'text-danger']">
			Sponsor information
		</legend>
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
							:disabled="ro"
							:state="state(runtime.status.name)"
							:value="runtime.value.name"
							@input="update([],'name',$event)"
							placeholder="don't leave me empty">
						</b-form-input>
					</b-col>		
				</b-row>
			</b-form-group>
			<b-form-group 										
				label-for="phone"
				v-show="!ro || (ro && runtime.value.phone.length > 0)">
				<b-row align-v="center">
					<b-col cols="12" sm="auto">
						<label>Sponsor's phone number</label>
					</b-col>
					<b-col col sm>
						<b-form-input 
							type="tel" 
							:disabled="ro"
							:value="runtime.value.phone"
							@input="update([],'phone',$event)"
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
			ro: {
				type: Boolean,
				default: false
			}
		},
		data: () => ({
			runtime: {
				value: {},
				status: {}
			},
			status: false,
		}),
		created() {
			this.runtime.value = _.cloneDeep(this.value);
			Object.keys(this.runtime.value).forEach(key => {
				this.runtime.status[key] = this.validate(key);
			});
			this.update();
		},
		watch: {
			value() {
				this.runtime.value = _.cloneDeep(this.value);
			}
		},
		methods: {
			update(path = [], key, value) {
				let query = [...path, key][0];
				if(query) { 
					path.reduce((target,key) => target[key],this.runtime.value)[key] = value;
					this.runtime.status[query] = this.validate(query)
				}
				this.status = Object.keys(this.runtime.status).reduce((a,i) => a && this.runtime.status[i], true);
				this.$emit('input', {
					value: _.cloneDeep(this.runtime.value),
					status: this.status
				});
			},
			validate(query) {
				let subj = this.runtime.value[query];
				switch (query) {
					case "name":
						return /^[a-zA-Z0-9 '.,-]+$/.test(subj); 
					case "phone":
						return true;
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
	.disabled,
	:disabled {
		cursor: not-allowed;
	}
</style>

