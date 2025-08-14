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
  <div
    class="c-view-toolbar"
    :class="roundedClass"
  >
    <v-defaults-provider
    :defaults="{
        VBtn: btnProps(size, rounded),
        VMenu: {
          activator: 'parent',
          closeOnContentClick: false,
        },
      }"
    >
      <slot/>
    </v-defaults-provider>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { btnProps } from '@/utils/viewToolbar'

const props = defineProps({
  /** Button size in px or vuetify named size */
  size: {
    type: String,
    default: 'default',
  },
  /** @see https://vuetifyjs.com/en/styles/border-radius/ */
  rounded: {
    type: [String, Boolean],
    default: true,
  },
})

const roundedClass = computed(() => {
  if (!props.rounded) return
  if (props.rounded === true) return 'rounded'
  return `rounded-${props.rounded}`
})

</script>

<!-- <style lang="scss">
  .c-view-toolbar {
    > div {
      display: flex;
      align-items: center;

      $spacing: 0.5rem;

      &:not(:first-child):before {
        // place a divider between groups
        content: '';
        height: 70%;
        width: 2px;
        background: rgb(0, 0, 0, 0.22);
        // put a bit of space between the groups
        margin: 0 $spacing;
      }
    }
  }
</style> -->
