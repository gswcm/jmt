<template>
	<fieldset class="mt-3" v-show="showMeals || showTShirts">
		<legend :class="[status ? '' : 'text-danger']">
			Miscellaneous
		</legend>
		<div class="fieldset p-3 bg-light rounded">
			<!-- T-Shirts -->
			<b-row align-h="between" align-v="center"class="my-3" v-show="showTShirts">
				<b-col cols="auto">
					<h5 class="text-info">T-Shirts <small>($10 each)</small> </h5>
				</b-col>
				<b-col cols="auto" v-show="!ro">
					<b-btn 
						variant="outline-info"
						@click="addTShirt">
						Add more...
					</b-btn>
				</b-col>
			</b-row>
			<b-form-group 	
				v-for="(tshirt,index) in runtime.value.tshirts"
				:key="`tshirt_${index}`"
				v-show="showTShirts">						
				<b-row align-v="center">
					<b-col col sm="auto">	
						<label>Size/Qty</label>
					</b-col>
					<b-col col sm>
						<b-select
							:disabled="ro"
							:value="tshirt.size"
							:state="tshirt.size ? null : false"
							@input="update(['tshirts',`${index}`],'size',$event)">
							<option :value="null">Please select t-shirt size</option>
							<option value="XS">XS</option>
							<option value="S">S</option>
							<option value="M">M</option>
							<option value="L">L</option>
							<option value="XL">XL</option>
							<option value="XXL">XXL</option>
						</b-select>		
					</b-col>
					<b-col cols="2">
						<b-form-input 
							:disabled="ro"
							type="number" 
							:value="tshirt.qty"
							@input="update(['tshirts',`${index}`],'qty',$event)"
							:state="tshirt.qty > 0 ? null : false">
						</b-form-input>	
					</b-col>
					<b-col col sm="auto" v-show="!ro">
						<b-btn 
							variant="outline-secondary" 
							@click="removeTShirt(index)">
							Remove
						</b-btn>
					</b-col>
				</b-row>
			</b-form-group>
			<hr class="my-4" v-show="showTShirts && showMeals">
			<!-- Meals -->
			<b-row align-h="between" align-v="center"class="my-3" v-show="showMeals">
				<b-col cols="auto">
					<h5 class="text-info">Meals <small>($7.5 each)</small></h5>
				</b-col>
			</b-row>
			<b-form-group v-show="showMeals"> 	
				<b-row align-v="center">
					<b-col cols="auto" sm="auto">	
						<label>Number of meal tickets</label>
					</b-col>
					<b-col col sm="">
						<b-form-input 
							:disabled="ro"
							type="number" 
							:value="runtime.value.meals"
							:state="state(runtime.status.meals)"
							@input="update([],'meals',$event)">
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
		computed: {
			showTShirts() {
				return !this.ro || (this.ro && this.runtime.value.tshirts.length > 0)
			},
			showMeals() {
				return !this.ro || (this.ro && parseInt(this.runtime.value.meals) > 0)
			}
		},
		created() {
			this.runtime.value = _.cloneDeep(this.value);
			Object.keys(this.runtime.value).forEach(key => {
				this.runtime.status[key] = this.validate(key);
			});
			this.update();
		},

		methods: {
			removeTShirt(index) {
				this.runtime.value.tshirts.splice(index,1); 
				this.runtime.status.tshirts = this.validate('tshirts');
				this.update();
			},
			addTShirt() {
				this.runtime.value.tshirts.push({
					size: null,
					qty: 0
				});
				this.runtime.status.tshirts = false;
				this.update();
			},
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
					case "meals":
						return /[0-9]+/.test(subj) && parseInt(subj) >= 0; 
					case "tshirts":
						return subj.reduce((a,i) => a && (i.size !== null) && (i.qty > 0), true);
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

