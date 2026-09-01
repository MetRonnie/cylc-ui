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
  <v-data-table
    v-bind="{ headers }"
    :items="events"
    :items-per-page="25"
    fixed-header
    class="mh-100"
    data-cy="events-table"
  >
    <!-- Special template if there are no events to display -->
    <template #no-data>
      <span class="text-h6 text-disabled">No events</span>
    </template>

    <template #item.level="{ item }">
      <EventChip :level="item.level"/>
    </template>
    <template #item.message="{ item }">
      <div class="py-1">
        {{ item.message }}
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { headers, useWorkflowEvents } from '@/mixins/workflowEvents.js'
import EventChip from '@/components/cylc/EventChip.vue'

const { events } = useWorkflowEvents()
</script>
