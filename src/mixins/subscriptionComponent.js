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

import subscriptionMixin from '@/mixins/subscription'
import { uniqueId } from 'lodash'

/**
 * A mixin for components that declare GraphQL Query subscriptions. An example
 * of such component is the GScan component, which declares a query used to
 * list the workflows of the system in the UI sidebar.
 *
 * Uses Vue component lifecycle methods (e.g. created, beforeUnmount) to
 * coordinate when a subscription is created in the WorkflowService service.
 *
 * @see Subscription
 * @see SubscriptionQuery
 * @see WorkflowService
 */
export default {
  mixins: [
    subscriptionMixin
  ],
  beforeCreate () {
    // Uniquely identify this component/view so we can keep track of which
    // ones are sharing subscriptions.
    this._uid = `${uniqueId()}_${this.$options.name}`
  },
  beforeMount () {
    if (this.query) {
      this.$workflowService.subscribe(this)
      this.$workflowService.startSubscriptions()
    }
  },
  beforeUnmount () {
    this._updateQuery(null, this.query)
  },
  methods: {
    _updateQuery (newVal, oldVal) {
      if (oldVal) {
        this.$workflowService.unsubscribe(this)
      }
      if (newVal) {
        this.$workflowService.subscribe(this)
        this.$workflowService.startSubscriptions()
      }
    }
  },
  watch: {
    query (newVal, oldVal) {
      // if the query changes, unsubscribe & re-subscribe
      this._updateQuery(newVal, oldVal)
    }
  }
}
