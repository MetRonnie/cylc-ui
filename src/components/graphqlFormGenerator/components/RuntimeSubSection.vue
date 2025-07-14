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

<!-- Form input component for "key = value" pair -->

<template>
  <v-list class="ma-2">
    <v-list-item
      v-for="key in Object.keys(items)"
      :key="key"
    >
      <v-list-item-title>{{ startCase(key) }}</v-list-item-title>
      <v-text-field
        v-model="items[key]"
        v-bind="$attrs"
      />
    </v-list-item>
  </v-list>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import { startCase } from 'lodash-es'

export default {
  name: 'g-runtime-sub-section',

  mixins: [
    formElement
  ],

  setup (props) {
    return {
      items: props.modelValue,
      startCase
    }
  },

  inheritAttrs: false,
}
</script>
