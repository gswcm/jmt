<template>
	<div class="mt-3 p-3">
		<b-alert show variant="danger">
			This interface is intended for direct manipulation of selected database tables. <strong>Use with caution</strong>. 
		</b-alert>
		<!-- Remove stale data -->
		<remove-stale/>
		<hr>
		<!-- Remove this year data (registrations, questions, scans) -->
		<remove-this-year/>
		<hr>
		<!-- Set tournament dates -->
		<timeline/>
		<!-- Spacer -->
		<div class="py-5 mt-5"></div>
	</div>
</template>

<script>
import removeStale from './removeStale.vue';
import removeThisYear from './removeThisYear.vue';
import timeline from './timeline.vue';
export default {
	components: {
		removeStale, removeThisYear, timeline
	}
};
</script>


