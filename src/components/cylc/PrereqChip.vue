<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-chip
    :color="satisfied ? 'success' : 'grey'"
    :prepend-icon="satisfied ? mdiCheck : mdiProgressHelper"
    :link="!satisfied"
    :class="satisfied ? 'font-weight-medium' : undefined"
    density="comfortable"
  >
    {{ expression.replace(/c/g, '') }}
    <v-menu
      v-if="!satisfied"
      activator="parent"
    >
      <v-list density="compact">
        <v-list-item
          title="Satisfy"
          :prepend-icon="conditionId ? mdiCheck : mdiCheckAll"
          @click="satisfy"
        />
      </v-list>
    </v-menu>
  </v-chip>
</template>

<script setup>
import { inject } from 'vue'
import { mdiCheck, mdiCheckAll, mdiProgressHelper } from '@mdi/js'

const workflowService = inject('workflowService')

const props = defineProps({
  /** Task ID of the current task whose prereqs we are displaying. */
  taskId: {
    type: String,
    required: true,
  },
  expression: {
    type: String,
    required: true,
  },
  satisfied: {
    type: Boolean,
    required: true,
  },
  /** Child conditions if this is a prerequisite. */
  conditions: {
    type: Array,
  },
  /** ID including `:output` if this is a condition of a prerequisite. */
  conditionId: {
    type: String,
  },
})

function satisfy () {
  workflowService.mutate(
    'set',
    props.taskId,
    {
      prerequisites: props.conditions
        ? props.conditions.map((condition) => `${condition.taskId}:${condition.reqState}`)
        : [props.conditionId],
    }
  )
}
</script>
