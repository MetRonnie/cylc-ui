/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { createSharedComposable } from '@vueuse/core'
import { useStore } from 'vuex'

/**
 * A composable that contains data used for a GraphQL subscription, such as the
 * query variables.
 *
 * To be used in Views that are bound to Vue-Router routes that contain the
 * :workflowName param.
 *
 * NOTE: The state of this composable is shared across all components that use it.
 * This is because the route and user are already shared state, and we want to avoid creating multiple
 * computed properties (one for each view) that are the same for all views anyway.
 * DO NOT add any state to this composable that is not shared across all views.
 */
export const useGraphQL = createSharedComposable(() => {
  const store = useStore()
  const route = useRoute()
  const user = inject('user')

  const workflowName = computed(() => route.params?.workflowName)

  /**
   * Compute the workflow ID using the Vue route parameter
   * `workflowName` and the user.
   */
  const workflowID = computed(
    () => `~${user.owner}/${workflowName.value}`
  )

  /**
   * A list of the workflow IDs this view is "viewing"
   *
   * NOTE: we plan multi-workflow functionality so we are writing views
   * to be mult-workflow compatible in advance of this feature arriving
   */
  const workflowIDs = computed(() => [workflowID.value])

  /** Data store nodes for the workflows this view is viewing. */
  const workflows = computed(() => store.getters['workflows/getNodes']('workflow', workflowIDs.value))

  /** GraphQL query variables. */
  const variables = computed(() => ({
    workflowID: workflowID.value,
  }))

  return {
    workflowName,
    workflowID,
    workflowIDs,
    workflows,
    variables,
  }
})
