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
  <v-select
    persistent-hint
    v-model="model"
    v-bind="$attrs"
    :items="type.enumValues"
    item-title="name"
    :hint="itemDesc"
    placeholder="Select an option"
  />
</template>

<script setup>
import { formElementProps, useFormElement } from '@/components/graphqlFormGenerator/mixins'
import { computed } from 'vue'

const props = defineProps({
  ...formElementProps,
})

const model = defineModel({ type: String, required: true })

const { type } = useFormElement(props)

const itemDesc = computed(
  () => type.value.enumValues.find(
    ({ name }) => name === props.modelValue
  )?.description ?? ''
)
</script>
