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
  <div class="c-view-toolbar">
    <v-defaults-provider :defaults="vuetifyDefaults">
      <div
        class="group"
        v-for="group in groups"
        :key="group.name"
      >
        <component
          :is="control.component"
          :key="index"
          v-for="(control, index) in group.controls"
          v-tooltip="`${control.title}`"
          :data-cy="`control-${control.key}`"
        />
      </div>
    </v-defaults-provider>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { camelCase } from 'lodash'
import { activeColor } from './util'

const instance = getCurrentInstance()

const groups = computed(() => {
  const groups = []
  for (const [name, controls] of Object.entries(instance.slots)) {
    groups.push({
      name,
      controls: controls().map((control) => {
        return {
          title: control.props.title,
          key: camelCase(control.props.title),
          component: control
        }
      })
    })
  }
  return groups
})

const vuetifyDefaults = ref({
  VBtn: {
    size: 40,
    variant: 'text',
    density: 'compact',
    rounded: 'lg',
  },
  VBtnToggle: {
    divided: true,
    variant: 'outlined',
    color: activeColor,
    density: 'comfortable',
    VBtn: {
      size: 'default',
      variant: 'text',
      density: 'compact',
      rounded: 'false',
    },
  },
  VTextField: {
    variant: 'outlined',
    density: 'compact',
  },
})
</script>

<style lang="scss">
  .c-view-toolbar {
    display: flex;

    .group {
      display: flex;
      align-items: center;

      $spacing: 0.5rem;

      &:not(:first-child):before {
        // place a divider between groups
        content: '';
        height: 70%;
        width: 0.15em;
        border-radius: 0.15em;
        background: rgb(0, 0, 0, 0.18);
        // put a bit of space between the groups
        margin: 0 $spacing;
      }

      > :not(button + button):not(:first-child) {
        margin-left: $spacing;
      }
    }
  }
</style>
