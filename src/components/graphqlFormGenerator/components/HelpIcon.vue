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

<!-- Help icon with tooltip -->

<template>
  <v-tooltip>
    <template #activator="{ props }">
      <v-icon
        v-bind="{ ...props, ...$attrs }"
        style="cursor: default"
        :icon="mdiHelpCircleOutline"
      />
    </template>
    <Markdown :markdown="tooltip" />
  </v-tooltip>
</template>

<script setup>
import { mdiHelpCircleOutline } from '@mdi/js'
import Markdown from '@/components/Markdown.vue'

defineOptions({
  inheritAttrs: false,
})

defineProps({
  tooltip: {
    type: String,
    required: true,
  },
})
</script>
