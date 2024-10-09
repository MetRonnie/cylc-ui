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
  <div data-cy="workspace-view">
    <Toolbar
      :views="allViews"
      :workflow-name="workflowName"
    />
    <div
      class="workflow-panel"
      :style="$options.panelStyle"
    >
      <Lumino
        ref="lumino"
        @emptied="empty = true"
        @widgetAdded="empty = false"
        :workflow-name="workflowName"
        :allViews="allViews"
      />
      <!-- <v-empty-state
        v-if="empty"
        title="To get started, add a view from the toolbar above"
        class="text-disabled"
      /> -->
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { allViews } from '@/views/views.js'
import { workflowName } from '@/mixins/graphql'
import Lumino from '@/components/cylc/workspace/Lumino.vue'
import Toolbar from '@/components/cylc/workspace/Toolbar.vue'
import { toolbarHeight } from '@/utils/toolbar'

export default {
  name: 'Workspace',

  components: {
    Lumino,
    Toolbar
  },

  props: {
    workflowName,
  },

  setup () {
    /** Template ref */
    const lumino = ref(null)

    /** No tabs open */
    const empty = ref(false)

    onBeforeRouteUpdate((to, from) => {
      lumino.value.changeLayout(to.params.workflowName)
    })

    return {
      allViews,
      empty,
      lumino,
    }
  },

  panelStyle: {
    height: `calc(100vh - ${toolbarHeight}px)`,
  },
}
</script>
