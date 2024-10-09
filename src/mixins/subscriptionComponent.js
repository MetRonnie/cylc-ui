/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

import { inject, onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue'
import { uniqueId } from 'lodash'
import { useViewState } from '@/mixins/subscription'

/** @typedef {import('@/model/SubscriptionQuery.model').SubscriptionQuery} SubscriptionQuery */

/**
 * A mixin for components that declare GraphQL Query subscriptions. An example
 * of such component is the GScan component, which declares a query used to
 * list the workflows of the system in the UI sidebar.
 *
 * Uses Vue component lifecycle methods (e.g. created, beforeUnmount) to
 * coordinate when a subscription is created in the WorkflowService service.
 *
 * @param {string} name - The name of the component or view.
 * @param {import('vue').Ref<SubscriptionQuery>} query - The GraphQL query.
 */
export function useComponentSubscription (name, query) {
  /** @type {import('@/services/workflow.service').WorkflowService} */
  const workflowService = inject('workflowService')

  /**
   * Unique identifier for this component/view so we can keep track of which
   * ones are sharing subscriptions.
   */
  const uid = uniqueId(name)

  onBeforeMount(() => {
    if (query.value) {
      workflowService.subscribe(uid, query.value)
    }
  })
  onMounted(() => {
    if (query.value) {
      workflowService.startSubscriptions()
    }
  })
  onBeforeUnmount(() => {
    updateQuery(null, query.value)
  })

  /**
   * @param {?DocumentNode} newQuery
   * @param {?DocumentNode} oldQuery
   */
  function updateQuery (newQuery, oldQuery) {
    if (oldQuery) {
      workflowService.unsubscribe(uid, oldQuery)
    }
    if (newQuery) {
      workflowService.subscribe(uid, newQuery)
      workflowService.startSubscriptions()
    }
  }

  watch(query, (newVal, oldVal) => {
    // if the query changes, unsubscribe & re-subscribe
    updateQuery(newVal, oldVal)
  })

  const { isLoading, viewState } = useViewState()

  return {
    isLoading,
    uid,
    viewState,
  }
}
