/**
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

import { createStore } from 'vuex'
import { vi, expect } from 'vitest'
import sinon from 'sinon'
import { print } from 'graphql/language'
import gql from 'graphql-tag'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import { store } from '@/store/index'
import storeOptions from '@/store/options'
import { Subscription } from '@/model/Subscription.model'
import { SubscriptionQuery } from '@/model/SubscriptionQuery.model'
import { WorkflowService } from '@/services/workflow.service'
import ViewState from '@/model/ViewState.model'
import { defineComponent } from 'vue'
import { useComponentSubscription } from '@/mixins/subscriptionComponent'
import { mount } from '@vue/test-utils'

vi.mock('@/graphql/index', () => ({
  createApolloClient: () => ({
    query: vi.fn(),
    subscribe: () => ({
      subscribe: vi.fn(),
    }),
  }),
}))

const sandbox = sinon.createSandbox()

describe('WorkflowService', () => {
  /**
   * @type {String}
   */
  const url = '/graphql'
  /**
   * @type {WorkflowService}
   */
  let workflowService
  /**
   * @type {DocumentNode}
   */
  let query
  /**
   * @type {SubscriptionQuery}
   */
  let subscriptionQuery
  let uid
  /**
   * @type {Subscription}
   */
  let subscription

  beforeEach(() => {
    sandbox.stub(console, 'debug')
    // TODO: really load some mutations
    sandbox.stub(WorkflowService.prototype, 'loadTypes').returns(
      Promise.resolve({
        mutations: [],
        types: [],
      })
    )
    workflowService = new WorkflowService(url)
    // subscription query
    query = gql`
        query {
          workflows {
            id
          }
        }`
    subscriptionQuery = new SubscriptionQuery(
      query,
      {
        workflowID: '~cylc/test',
      },
      'root',
    )
    // Subscription
    subscription = new Subscription(subscriptionQuery, true)
    workflowService.subscriptions[subscriptionQuery.name] = subscription
    // Add one View as subscriber to Subscription
    uid = 'view'
    workflowService.subscribe(uid, subscriptionQuery)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('constructor', () => {
    it('should create an object correctly', () => {
      expect(workflowService.apolloClient).not.toBeNullable()
    })
  })

  describe('getOrCreateSubscription', () => {
    it('should return existing subscriptions', () => {
      const existingSubscription = workflowService.getOrCreateSubscription(subscriptionQuery)
      expect(existingSubscription).to.deep.equal(subscription)
    })

    it('should create new subscriptions and add to local cache', () => {
      delete workflowService.subscriptions[subscriptionQuery.name]
      expect(Object.keys(workflowService.subscriptions).length).to.equal(0)
      const newSubscription = workflowService.getOrCreateSubscription(subscriptionQuery)
      expect(Object.keys(workflowService.subscriptions).length).to.equal(1)
      expect(workflowService.subscriptions[subscriptionQuery.name]).to.deep.equal(newSubscription)
    })
  })

  describe('startSubscriptions', () => {
    it('should start pending subscriptions', () => {
      const spy = sandbox.spy(workflowService, 'startSubscription')
      workflowService.startSubscriptions()
      expect(spy.calledOnce).to.equal(true)
    })
  })

  describe('startSubscription', () => {
    it('should stop the subscription if already started, before starting again', () => {
      const observable = { unsubscribe: () => {} }
      const spy = sandbox.spy(observable, 'unsubscribe')
      subscription.observable = observable
      workflowService.startSubscription(subscription)
      expect(spy.calledOnce).to.equal(true)
    })

    it('should call the subscription callback', () => {
      vi.spyOn(workflowService, 'startCylcSubscription').mockImplementation(() => ({
        subscribe () {},
      }))
      subscription.reload = true
      workflowService.startSubscription(subscription)
      // after a subscription has been started, the reload flag must be set to false
      expect(subscription.reload).to.equal(false)
    })

    describe('ViewState', () => {
      const store = createStore(storeOptions)
      let wrapper

      beforeEach(() => {
        const Component = defineComponent({
          setup: () => ({
            ...useComponentSubscription('MyView', null),
          }),
          render: () => null,
        })
        wrapper = mount(Component, {
          global: {
            plugins: [store],
            provide: { workflowService },
          },
        })

        workflowService.subscribe(wrapper.vm.uid, subscriptionQuery)
      })

      it('should set the view state to COMPLETE when it successfully starts a subscription', () => {
        expect(wrapper.vm.viewState).to.equal(ViewState.NO_STATE)
        workflowService.startSubscription(subscription)
        expect(wrapper.vm.viewState).to.equal(ViewState.COMPLETE)
      })

      it('should set the view state to ERROR if it fails to start the deltas subscription', () => {
        expect(wrapper.vm.viewState).to.equal(ViewState.NO_STATE)
        const stub = sandbox.stub(workflowService, 'startCylcSubscription')
        stub.throws()
        sandbox.stub(console, 'error')
        workflowService.startSubscription(subscription)
        expect(wrapper.vm.viewState).to.equal(ViewState.ERROR)
      })

      it('should set the view state to COMPLETE when it successfully starts a subscription', () => {
        expect(wrapper.vm.viewState).to.equal(ViewState.NO_STATE)
        vi.spyOn(workflowService, 'startCylcSubscription').mockImplementation(() => ({
          subscribe ({ error }) {
            error('test')
          },
        }))
        const spy = vi.spyOn(subscription, 'handleViewState')
        sandbox.stub(console, 'error')
        workflowService.startSubscription(subscription)
        // The error happens, but immediately, so the view state is set to COMPLETE. In
        // real-life, there will be a few milliseconds delay between the JS creation of
        // the object, and the first WebSockets message with an error, so we will use
        // a spy here instead.
        // Called first time to set as LOADING. Then as ERROR. Finally COMPLETE.
        expect(spy.mock.calls.map(x => x[0].enumKey)).toEqual([
          'LOADING',
          'ERROR',
          'COMPLETE',
        ])
      })
    })
  })

  describe('startCylcSubscription', () => {
    // the bulk of tests for startCylcSubscription are e2e tests, here we only test
    // a few simple scenarios
    it('should throw an error if no query provided', () => {
      expect(() => { workflowService.startCylcSubscription(null, null, null) }).to.throw()
    })
  })

  describe('merge', () => {
    it('should merge two queries correctly', () => {
      const query1 = new SubscriptionQuery(
        gql`
        query {
          workflows {
            id
          }
        }`,
        subscriptionQuery.variables,
        'root',
      )
      workflowService.subscribe('view1', query1)
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = print(query1.query)
      const initialQuery = print(workflowService.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(initialQuery)

      const query2 = new SubscriptionQuery(
        gql`
        query {
          workflows {
            name
          }
        }`,
        subscriptionQuery.variables,
        'root',
      )
      workflowService.subscribe('view2', query2)
      // now the queries must have been merged
      const finalQuery = print(workflowService.subscriptions.root.query.query)
      expect(finalQuery).to.contain('name')
    })
  })

  describe('recompute', () => {
    it('should not change query if no views were added', () => {
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = print(subscriptionQuery.query)
      const initialQuery = print(workflowService.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(initialQuery)
      // calling recompute with the same query shouldn't change the original query
      workflowService.recompute(workflowService.subscriptions.root)
      const finalQuery = print(workflowService.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(finalQuery)
    })

    it('should add all deltas hooks as callbacks', () => {
      const onDelta = () => {}
      workflowService.subscribe('view1', new SubscriptionQuery(
        query,
        subscriptionQuery.variables,
        subscriptionQuery.name,
        { onDelta }
      ))
      const onBeforeDelta = () => {}
      workflowService.subscribe('view2', new SubscriptionQuery(
        query,
        subscriptionQuery.variables,
        subscriptionQuery.name,
        { onDelta, onBeforeDelta }
      ))
      expect(subscription.callbacks).to.deep.equal([
        { onDelta },
        { onDelta, onBeforeDelta },
      ])
    })

    it('should throw an error if there are no subscribers', () => {
      delete subscription.subscribers.delete(uid)
      expect(() => { workflowService.recompute(subscription) }).to.throw()
    })

    it('should throw an error if the subscribers have different variables', () => {
      const anotherQuery = new SubscriptionQuery(
        gql`query { workflow { id } }`,
        {
          invalidVariable: true,
        },
        'test',
      )
      subscription.subscribers.set(anotherQuery.name, anotherQuery)
      expect(() => { workflowService.recompute(subscription) }).to.throw()
    })
  })

  describe('unsubscribe', () => {
    it('should warn about queries that do not exist', () => {
      const stub = sandbox.stub(console, 'warn')
      workflowService.unsubscribe('irrelevant_uid', { name: 'missing' })
      expect(stub.calledOnce).to.equal(true)
    })

    it('should call unsubscribe if last subscriber is unsubscribed', () => {
      const stub = sandbox.stub(workflowService, 'stopSubscription')
      workflowService.unsubscribe(uid, subscriptionQuery)
      expect(stub.calledOnce).to.equal(true)
    })

    it('should NOT call unsubscribe if there are still subscribers left', () => {
      workflowService.subscribe('test', subscriptionQuery)
      const stub = sandbox.stub(workflowService, 'stopSubscription')
      workflowService.unsubscribe('test', subscriptionQuery)
      expect(stub.calledOnce).to.equal(false)
    })
  })

  describe('stopSubscription', () => {
    it('should remove the subscription', () => {
      subscription.observable = {
        unsubscribe: () => {},
      }
      expect(workflowService.subscriptions[subscription.query.name]).toBeDefined()
      workflowService.stopSubscription(subscription)
      expect(workflowService.subscriptions[subscription.query.name]).toBeUndefined()
    })
  })

  describe('Global Callback', () => {
    beforeEach(() => {
      store.replaceState(createStore(storeOptions).state)
    })

    it('should wipe workflow children on reloaded deltas', () => {
      // the callback should wipe workflow children when a "reloaded" delta is
      // received - see https://github.com/cylc/cylc-ui/pull/1479
      // Mock the client
      let next
      workflowService.apolloClient.subscribe = () => ({
        subscribe (observable) {
          next = observable.next
        },
      })

      const subscription = workflowService.getOrCreateSubscription(subscriptionQuery)
      workflowService.startSubscription(subscription)

      const { $index } = store.state.workflows.cylcTree

      // send an added delta which adds a workflow with one task
      next({
        data: {
          deltas: {
            id: 123,
            added: {
              id: 123,
              workflow: { id: '~user/foo' },
              taskProxies: { id: '~user/foo//1/a' },
            },
          },
        },
      })

      // the user/workflow//cycle/task should now be in the store
      expect(Object.keys($index)).toEqual([
        '~user',
        '~user/foo',
        '~user/foo//1',
        '~user/foo//1/a',
      ])

      // send a reloaded delta which adds a new task
      next({
        data: {
          deltas: {
            id: 234,
            added: {
              id: 234,
              workflow: { id: '~user/foo', reloaded: true },
              taskProxies: { id: '~user/foo//2/b' },
            },
          },
        },
      })

      // the cycle "1" and task "1/a" should be gone from the store
      // without the need for an explicit "pruned" delta
      expect(Object.keys($index)).toEqual([
        '~user',
        '~user/foo',
        '~user/foo//2',
        '~user/foo//2/b',
      ])
    })
  })
})
