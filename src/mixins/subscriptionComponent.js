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

import { inject, onBeforeMount, onBeforeUnmount, onMounted, watch, toValue, shallowRef, computed } from 'vue'
import { uniqueId } from 'lodash-es'
import ViewState from '@/model/ViewState.model'
import { eventBus } from '@/services/eventBus'
import { isRefOrGetter } from '@/utils/reactivity'

/** @typedef {import('@/model/SubscriptionQuery.model').SubscriptionQuery} SubscriptionQuery */

/**
 * A composable for components that declare GraphQL Query subscriptions. An example
 * of such component is the GScan component, which declares a query used to
 * list the workflows of the system in the UI sidebar.
 *
 * Uses Vue component lifecycle hooks (e.g. onBeforeMount) to
 * coordinate when a subscription is created in the WorkflowService service.
 *
 * @param {string} name - The name of the component or view.
 * @param {import('vue').MaybeRefOrGetter<SubscriptionQuery>} query - The GraphQL query (Note this can be a
 * getter function `() => new SubscriptionQuery(...)`, which is treated the same as a computed ref).
 */
export function useComponentSubscription (name, query) {
  /** @type {import('@/services/workflow.service').WorkflowService} */
  const workflowService = inject('workflowService')

  /**
   * Unique identifier for this component/view so we can keep track of which
   * ones are sharing subscriptions.
   */
  const uid = uniqueId(name)

  const viewState = shallowRef(ViewState.NO_STATE)
  const isLoading = computed(() => viewState.value === ViewState.LOADING)

  onBeforeMount(() => {
    eventBus.on(`set-view-state:${uid}`, (newState) => { viewState.value = newState })
  })
  onMounted(() => {
    updateQuery(toValue(query))
  })
  onBeforeUnmount(() => {
    updateQuery(null, toValue(query))
    eventBus.off(`set-view-state:${uid}`)
  })

  function updateQuery (newQuery, oldQuery) {
    if (oldQuery) {
      workflowService.unsubscribe(uid, oldQuery)
    }
    if (newQuery) {
      workflowService.subscribe(uid, newQuery)
      workflowService.startSubscriptions()
    }
  }

  if (isRefOrGetter(query)) {
    watch(
      query,
      (newVal, oldVal) => {
        // if the query changes, unsubscribe & re-subscribe
        updateQuery(newVal, oldVal)
      },
      {
        // Ensure all component mounts/unmounts take place before running the handler
        // (this is needed to prevent subscription mismatches):
        flush: 'post',
      }
    )
  }

  return {
    uid,
    viewState,
    isLoading,
  }
}
