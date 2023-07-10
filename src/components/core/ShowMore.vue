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

<!--
Component that gives a "show more" buton for expanding content.

The criterion for showing the button is given either by the maxHeight prop
or if the v-slot:extended is used.
-->

<template>
  <div
    class="d-flex flex-column"
  >
    <div
      class="overflow-hidden"
      :style="maxHeight && !isExpanded ? { maxHeight }: null"
      ref="content"
    >
      <slot></slot>
      <slot name="extended" v-if="isExpanded"></slot>
    </div>
    <v-btn
      v-if="showButton"
      @click="isExpanded = !isExpanded"
      variant="plain"
      class="mt-2"
    >
      Show {{ isExpanded ? 'less' : 'more' }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'ShowMore',

  props: {
    /** Set max height of unexpanded content (include units). */
    maxHeight: {
      type: String,
    },
  },

  data () {
    return {
      isExpanded: false,
      showButton: false,
    }
  },

  mounted () {
    // Work around lack of initial ref
    this.$watch(
      '$refs',
      () => {
        this.showButton = (
          this.$slots.extended ??
          this.$refs.content?.clientHeight < this.$refs.content?.scrollHeight
        )
      },
      { immediate: true }
    )
  },

}
</script>
