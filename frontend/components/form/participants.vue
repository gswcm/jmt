<template>
	<fieldset class="mt-3">
		<legend :class="[status ? '' : 'text-danger']">
			Participant(s)
		</legend>
		<div class="fieldset p-3 bg-light rounded">
			<!-- Registration type -->
			<b-row align-h="between" align-v="center" class="my-3">
				<b-col cols="auto">
					<h5 class="text-info">Registration type</h5>
				</b-col>
			</b-row>
			<b-form-group>
				<b-form-radio-group :disabled="ro" :checked="runtime.value.registration" @input="update([],'registration', $event)">
					<b-form-radio value="school">School <span v-if="runtime.value.registration === 'school' && !ro">(see note below)</span></b-form-radio>
					<b-form-radio value="individual">Individual<span v-if="runtime.value.registration === 'individual' && !ro">($20 per person)</span></b-form-radio>
				</b-form-radio-group>
			</b-form-group>
			<transition name="flipInX">
				<div v-if="runtime.value.registration === 'school'">
					<b-form-group 																
						label-for="school"
						:state="state(runtime.status.school)"
						v-show="!ro || (ro && runtime.value.school.length)"
						class="mt-3">
						<b-row align-v="center">
							<b-col cols="12" sm="auto">
								<label>School name</label>
							</b-col>
							<b-col col sm>
								<b-form-input 
									type="text" 
									:disabled="ro"
									:state="state(runtime.status.school)"
									:value="runtime.value.school"
									@input="update([],'school',$event)"
									placeholder="school name">
								</b-form-input>
							</b-col>		
						</b-row>
					</b-form-group>
					<p v-show="!ro" class="mt-3 pl-3 border border-bottom-0 border-top-0 border-right-0 border-dark">
						<strong>Note</strong>: The registration cost per school team is calculated based on the payment date:
						<ul>
							<li>
								If paid <strong>before {{dates.payment.format('LL')}}</strong> the cost is <strong>$50</strong> regardless to the number of students (up to 10 per grade)
							</li>
							<li>
								If paid <strong>after {{dates.payment.format('LL')}}</strong> the cost is <strong>$75</strong>
							</li>
						</ul>
						The <strong>Total</strong> amount below is adjusted to account today's date.
					</p>
				</div>
			</transition>
			<hr class="my-4">
			<!-- Grades -->
			<b-row align-h="between" align-v="center" class="my-3">
				<b-col cols="auto">
					<h5 class="text-info">Grades <small>(up to 10 per grade)</small> </h5>
				</b-col>
				<b-col cols="auto" v-show="!ro">
					<b-btn 
						variant="outline-info"
						@click="addGrade">
						Add more...
					</b-btn>
				</b-col>
			</b-row>
			<b-form-group 	
				v-for="(grade,index) in runtime.value.grades"
				:key="`grade_${index}`">						
				<b-row align-v="center">
					<b-col col sm="auto">	
						<label>Grade/Qty</label>
					</b-col>
					<b-col col sm>
						<b-select
							:disabled="ro"
							:value="grade.type"
							:state="grade.type !== null ? null : false"
							@input="update(['grades',`${index}`],'type',$event)">
							<option :value="null">Please select the grade</option>
							<optgroup label="Elementary">
								<option value="3">3<span class="superscript">rd</span></option>
								<option value="4">4<span class="superscript">th</span></option>
								<option value="5">5<span class="superscript">th</span></option>
							</optgroup>
							<optgroup label="Junior">
								<option value="6">6<span class="superscript">th</span></option>
								<option value="7">7<span class="superscript">th</span></option>
								<option value="8">8<span class="superscript">th</span></option>
							</optgroup>
						</b-select>		
					</b-col>
					<b-col cols="2">
						<b-form-input 
							:disabled="ro"
							type="number" 
							min="0"
							max="10"
							:value="grade.qty"
							@input="update(['grades',`${index}`],'qty',$event)"
							:state="grade.qty > 0 && grade.qty <= 10 ? null : false">
						</b-form-input>	
					</b-col>
					<b-col col sm="auto" v-show="!ro">
						<b-btn 
							variant="outline-secondary" 
							:disabled="runtime.value.grades.length < 2"
							@click="removeGrade(index)">
							Remove
						</b-btn>
					</b-col>
				</b-row>
			</b-form-group>
		</div>
	</fieldset>
</template>

<script>
import "vue-animate-transitions/dist/vue-animate-transitions.min.css";
import moment from 'moment';
import { mapGetters } from 'vuex';
const { cloneDeep } = require("lodash");
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
		...mapGetters({
			eventDate: 'getEventDate',
			isAdmin: 'getIsAdmin'
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
		Object.keys(this.runtime.value).forEach(key => {
			this.runtime.status[key] = this.validate(key);
		});
		this.update();
	},
	watch: {
		value() {
			this.runtime.value = cloneDeep(this.value);
		}
	},
	methods: {
		removeGrade(index) {
			this.runtime.value.grades.splice(index, 1);
			this.runtime.status.grades = this.validate("grades");
			this.update();
		},
		addGrade() {
			this.runtime.value.grades.push({
				type: null,
				qty: 1
			});
			this.runtime.status.grades = this.validate("grades");
			this.update();
		},
		update(path = [], key, value) {
			let query = [...path, key][0];
			if (query) {
				path.reduce((target, key) => target[key], this.runtime.value)[key] = value;
				this.runtime.status[query] = this.validate(query);
			}
			this.status = Object.keys(this.runtime.status).reduce((a, i) => a && this.runtime.status[i],true);
			this.$emit("input", {
				value: cloneDeep(this.runtime.value),
				status: this.status
			});
		},
		validate(query) {
			let subj = this.runtime.value[query];
			switch (query) {
				case "grades":
					return subj.reduce(
						(a, i) => a && i.type !== null && i.qty > 0 && i.qty <= 10,
						true
					);
				case "registration":
					return ["school", "individual"].indexOf(subj) > -1;
				case "school":
					return true;
			}
		},
		state(isValid) {
			return isValid ? null : false;
		}
	}
};
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
	.superscript {
		vertical-align: super;
	}
	.fade-enter-active, 
	.fade-leave-active {
		transition: opacity 0.25s ease-out;
	}
	.fade-enter, 
	.fade-leave-to {
		opacity: 0;
	}
</style>

