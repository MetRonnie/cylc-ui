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
  <TreeItem
    v-bind="{ node, depth, filteredOutNodesCache, hoverable }"
    :auto-expand-types="$options.nodeTypes"
    :render-expand-collapse-btn="node.type !== 'workflow'"
    ref="treeItem"
  >
    <WorkflowIcon
      v-if="node.type === 'workflow'"
      :status="node.node.status"
      v-cylc-object="node"
      :class="nodeClass"
      class="flex-shrink-0"
    />
    <v-list-item
      :to="workflowLink"
      :class="nodeClass"
      class="flex-grow-1 flex-shrink-1 px-2 ml-1"
    >
      <div class="d-flex align-center align-content-center flex-nowrap">
        <div class="c-gscan-workflow-name flex-grow-1">
          <span>
            {{ node.name || node.id }}
            <v-tooltip
              location="top"
              style="overflow-wrap: anywhere;"
            >
              {{ node.id }}
            </v-tooltip>
          </span>
        </div>
        <div
          v-if="descendantTaskInfo.latestTasks.size"
          class="d-flex text-right c-gscan-workflow-states flex-grow-0"
        >
          <!-- task summary tooltips -->
          <!-- a v-tooltip does not work directly set on Cylc job component, so we use a div to wrap it -->
          <div
            v-for="state in taskStates"
            :key="`${node.id}-${state}`"
            :class="taskStateClass(state)"
            class="ma-0 pa-0"
            min-width="0"
            min-height="0"
            style="font-size: 120%; width: auto;"
          >
            <Job :status="state" />
            <v-tooltip location="top">
              <!-- tooltip text -->
              <div class="text-grey-lighten-1">
                {{ stateSummaryText(state) }}
              </div>
              <div
                v-for="task in recentTasks(state)"
                :key="task"
              >
                {{ task }}
              </div>
            </v-tooltip>
          </div>
        </div>
      </div>
    </v-list-item>

    <template v-slot:child>
      <!-- Component recursion -->
      <GScanTreeItem
        v-for="child in nodeChildren"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        v-bind="{ filteredOutNodesCache, hoverable }"
      />
    </template>
  </TreeItem>
</template>

<script>
import Job from '@/components/cylc/Job.vue'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon.vue'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import { TaskState } from '@/model/TaskState.model'
import { WorkflowState } from '@/model/WorkflowState.model'

/**
 * @typedef {Object} DescendantTaskInfo
 * @property {Map<string, number>} stateTotals - Task state totals for all descendants of a node.
 * @property {Map<string, string[]>} latestTasks - Latest task states for all descendants of a node.
 */

export const taskStates = [
  TaskState.SUBMIT_FAILED.name,
  TaskState.FAILED.name,
  TaskState.RUNNING.name,
  TaskState.SUCCEEDED.name,
]

const maxRecentTasksDisplayed = 5

/**
 * Get aggregated task state totals and latest task states for all descendants of a node.
 *
 * @param {Object} node
 * @param {Map<string, number>} stateTotals
 * @param {Map<string, string[]>} latestTasks
 * @returns {DescendantTaskInfo}
 */
function traverseChildren (node, stateTotals = new Map(), latestTasks = new Map()) {
  // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
  if (node.type === 'workflow-part' && node.children) {
    // at every branch, recurse all child nodes
    for (const child of node.children) {
      traverseChildren(child, stateTotals, latestTasks)
    }
  } else if (node.type === 'workflow' && node.node.stateTotals) {
    // if we are at the end of a node (or at least, hit a workflow node), stop and merge the latest state tasks from this node with all the others from the tree
    for (const state of taskStates) {
      // Note: more efficient to iterate over taskStates as its length is < stateTotals
      stateTotals.set(state, (stateTotals.get(state) ?? 0) + node.node.stateTotals[state])
    }
    for (const [state, taskNames] of Object.entries(node.node.latestStateTasks)) {
      // Note: more efficient to iterate over latestStateTasks as its length is mostly <= taskStates
      if (taskStates.includes(state)) {
        // concat the new tasks in where they don't already exist
        latestTasks.set(state, [
          ...(latestTasks.get(state) ?? []),
          ...taskNames,
        ].sort().reverse()) // cycle point descending order
      }
    }
  }
  return { stateTotals, latestTasks }
}

export default {
  name: 'GScanTreeItem',

  components: {
    Job,
    TreeItem,
    WorkflowIcon
  },

  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    filteredOutNodesCache: {
      type: WeakMap,
      required: true,
    },
    hoverable: {
      type: Boolean,
    },
  },

  setup () {
    return {
      taskStates,
    }
  },

  computed: {
    workflowLink () {
      return this.node.type === 'workflow'
        ? `/workspace/${ this.node.tokens.workflow }`
        : ''
    },

    /** Task state totals and latest states for all descendants of this node. */
    descendantTaskInfo () {
      return traverseChildren(this.node)
    },

    nodeChildren () {
      return this.node.type === 'workflow'
        ? []
        : this.node.children
    },

    nodeClass () {
      return {
        'c-workflow-stopped': this.node.node?.status === WorkflowState.STOPPED.name,
      }
    },
  },

  methods: {
    taskStateClass (state) {
      return {
        'empty-state': !this.descendantTaskInfo.stateTotals.get(state)
      }
    },

    /**
     * @param {string} state
     * @returns {string}
     */
    stateSummaryText (state) {
      const { stateTotals, latestTasks } = this.descendantTaskInfo
      const num = stateTotals.get(state)
      let ret = `${num} active ${state} task${num === 1 ? '' : 's'}.`
      if (latestTasks.get(state)?.length) ret += ' Recent:'
      return ret
    },

    /**
     * @param {string} state
     * @returns {string[]}
     */
    recentTasks (state) {
      return this.descendantTaskInfo.latestTasks.get(state)?.slice(0, maxRecentTasksDisplayed) ?? []
    },
  },

  nodeTypes: ['workflow-part', 'workflow'],
}
</script>
