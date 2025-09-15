<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

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

<!-- GScan workflow icon. -->

<template>
  <v-icon v-bind="{ icon, color }"/>
</template>

<script setup>
import { computed } from 'vue'
import WorkflowState from '@/model/WorkflowState.model'
import {
  mdiAlertCircle,
  mdiHelpCircle,
} from '@mdi/js'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  statusMsg: {
    type: String,
    default: '',
  },
})

const isStalled = computed(() => props.statusMsg.toLowerCase() === 'stalled')

/**
 * Return the workflow icon, based on the status prop. If the state is
 * not valid, we return an unknown state icon.
 * @returns {string} icon
 */
const icon = computed(() => {
  if (isStalled.value) return mdiAlertCircle
  const state = WorkflowState.enumValues.find(({ name }) => name === props.status)
  return state?.icon || mdiHelpCircle
})

const color = computed(() => isStalled.value ? 'amber-darken-4' : null)
</script>
