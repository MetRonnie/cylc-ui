import { GQuery } from '@/services/gquery'
import store from '@/store/'
import Alert from '@/model/Alert.model'

class LiveWorkflowService extends GQuery {
  /**
     * WorkflowService for on-line work.
     * This class provides the functionality required for polling the GraphQL
     * endpoint.
     */

  constructor () {
    super(/* enableWebSockets */ false)
    this.polling = null
  }

  destructor () {
    clearInterval(this.polling)
  }

  subscribe (view, query) {
    const ret = super.subscribe(view, query)
    if (!this.polling) {
      // start polling when we receive the first subscription
      this.polling = setInterval(() => {
        this.request()
      }, 5000)
      this.request()
    }
    return ret
  }
}

class SubscriptionWorkflowService extends GQuery {
  constructor () {
    super(/* enableWebSockets */ true)
    /**
     * @type {object}
     */
    this.observable = null
  }

  destructor () {
    if (this.observable) {
      this.observable.unsubscribe()
    }
    this.observable = null
  }

  subscribe (view, query) {
    this.observable = this.request()
    return super.subscribe(view, query)
  }

  recompute () {
    this.destructor()
    super.recompute()
    // query has been recomputed, so subscribe to request again
    this.observable = this.request()
  }

  request () {
    /**
     * Perform a REST GraphQL request for all subscriptions.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.debug('graphql request:', this.query)
    }
    if (!this.query) {
      return null
    }
    const vm = this
    return this.apolloClient.subscribe({
      query: this.query,
      fetchPolicy: 'no-cache'
    }).subscribe({
      next (response) {
        // commit results
        store.dispatch(
          'workflows/set',
          response.data.workflows
        )
        // set all subscriptions to active
        vm.subscriptions
          .filter(s => s.active === false)
          .forEach(s => { s.active = true })
        // run callback functions on the views
        vm.callbackActive()
      },
      error (err) {
        store.dispatch(
          'setAlert',
          new Alert(err.message, null, 'error')
        )
      }
    })
  }
}

export { LiveWorkflowService, SubscriptionWorkflowService }
export default SubscriptionWorkflowService
