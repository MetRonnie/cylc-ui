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
<template>
  <v-btn
    :color="isActive ? activeColor : undefined"
    v-bind="$attrs"
    @click="toggleActive?.()"
    :role="toggleActive ? 'switch' : undefined"
    :aria-checked="toggle"
  >
    <v-icon :icon="displayIcon"/>
    <template v-if="$slots.default" #default>
      <!-- Ensure icon is still rendered when parent overrides default slot -->
      <v-icon :icon="displayIcon"/>
      <slot/>
    </template>
  </v-btn>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  activeColor: {
    type: String,
    default: 'blue',
  },
  activeIcon: {
    type: String,
  },
})

const toggle = defineModel('toggle', {
  type: [Boolean, Array],
  default: null,
})

/** Toggle active state only if `v-model:toggle` is provided (and is not an array) */
const toggleActive = toggle.value == null || Array.isArray(toggle.value)
  ? null
  : () => {
      toggle.value = !toggle.value
    }

const isActive = computed(
  () => Boolean(toggle.value?.length ?? toggle.value)
)

const displayIcon = computed(
  () => (isActive.value && props.activeIcon) || props.icon
)

</script>
