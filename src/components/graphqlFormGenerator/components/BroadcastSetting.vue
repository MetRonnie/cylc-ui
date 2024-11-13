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
  <v-text-field
    v-model="model"
    :rules="[isValid]"
  >
    <template #append-inner>
      <HelpIcon :tooltip="help" />
    </template>
    <!-- pass the "append" slot onto the VTextField component -->
    <template #append="slotProps">
      <slot name="append" v-bind="slotProps" />
    </template>
  </v-text-field>
</template>

<script>
import { ref, watch } from 'vue'
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import HelpIcon from '@/components/graphqlFormGenerator/components/HelpIcon.vue'
import { nonNullRule } from '@/components/graphqlFormGenerator/components/NonNull.vue'

/**
 * Split a given string from the left.
 *
 * @param {string} string_ - The string to split.
 * @param {string} separator - The string to split it by.
 * @param {number} n - The maximum number of times to split the string.
 * @returns {string[]}
 */
function lsplit (string_, separator, n) {
  const split = string_.split(separator)
  if (split.length <= n) {
    return split
  }
  return [split.shift(), split.join(separator)]
}

/** Convert a string 'x=y' into an object { 'x': 'y' } */
function fromString (string_) {
  const [lhs, rhs] = lsplit(string_, '=', 2)
  if (rhs === undefined) {
    return null
  }
  // const [lhs, rhs] = JavaSplit(string_, '=', 2)
  if (lhs === 'inherit') {
    return null
    // return 'ERROR: cannot broadcast inheritance'
  }
  const rdict = {}
  let tail = lhs
  const re = /^\[([^\]]*)\](.*)$/
  let sect = null
  let curDict = rdict
  let match = null
  while (tail) {
    match = tail.match(re)
    if (match) {
      sect = match[1]
      tail = match[2]
      if (tail) {
        curDict[sect.trim()] = {}
        curDict = curDict[sect.trim()]
      } else {
        curDict[sect.trim()] = rhs.trim()
      }
    } else {
      curDict[tail.trim()] = rhs.trim()
      tail = null
    }
  }
  return rdict
}

export default {
  name: 'g-broadcast-setting',

  components: {
    HelpIcon,
  },

  mixins: [formElement],

  inheritAttrs: false,

  setup (props, { emit }) {
    const model = ref(null)
    watch(model, (val) => {
      emit('update:modelValue', fromString(val))
    })

    return {
      model,
    }
  },

  methods: {
    isValid (val) {
      const nonNullOutcome = nonNullRule(val)
      return nonNullOutcome === true
        ? (this.modelValue != null) || 'Invalid'
        : nonNullOutcome
    }
  },
}
</script>
