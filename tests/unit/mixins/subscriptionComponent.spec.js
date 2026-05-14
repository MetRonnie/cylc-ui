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

import { defineComponent, nextTick, ref } from 'vue'
import { createStore } from 'vuex'
import sinon from 'sinon'
import { cloneDeep } from 'lodash-es'
import { mount } from '@vue/test-utils'
import storeOptions from '@/store/options'
import { useComponentSubscription } from '@/mixins/subscriptionComponent'
import { WorkflowService } from '@/services/workflow.service'
import ViewState from '@/model/ViewState.model'

describe('Subscription Component composable', () => {
  const store = createStore(storeOptions)
  let workflowService, wrapper
  const query = ref()
  beforeEach(() => {
    workflowService = sinon.createStubInstance(WorkflowService)
    store.state.alert = null
    query.value = { foo: 1 }
    const Component = defineComponent({
      setup: () => ({
        ...useComponentSubscription('foo', query),
      }),
      render: () => null,
    })
    wrapper = mount(Component, {
      global: {
        plugins: [store],
        provide: { workflowService },
      },
    })
  })

  it('subscribes & unsubscribes when the component is mounted & destroyed', () => {
    const { vm } = wrapper
    expect(workflowService.subscribe.calledOnceWith(vm.uid, query.value)).to.equal(true)
    expect(workflowService.startSubscriptions.calledOnce).to.equal(true)
    expect(workflowService.unsubscribe.called).to.equal(false)
    wrapper.unmount()
    expect(workflowService.unsubscribe.calledOnceWith(vm.uid, query.value)).to.equal(true)
  })

  it('un- & re-subcribes when the query changes', async () => {
    const { vm } = wrapper
    const oldQuery = cloneDeep(query.value)
    query.value = { foo: 2 }
    await nextTick()
    expect(workflowService.unsubscribe.calledOnceWith(vm.uid, oldQuery)).to.equal(true)
    expect(workflowService.subscribe.calledTwice).to.equal(true)
    expect(workflowService.startSubscriptions.calledTwice).to.equal(true)
  })

  describe('isLoading state', () => {
    it.each([
      {
        viewState: ViewState.NO_STATE,
        expected: false,
      },
      {
        viewState: ViewState.LOADING,
        expected: true,
      },
      {
        viewState: ViewState.COMPLETE,
        expected: false,
      },
      {
        viewState: ViewState.ERROR,
        expected: false,
      },
    ])('$viewState.enumKey -> $expected', ({ viewState, expected }) => {
      const { vm } = wrapper
      vm.viewState = viewState
      expect(vm.isLoading).to.equal(expected)
    })
  })
})
