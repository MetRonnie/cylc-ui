<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
  <div class="c-info">
    <!-- The task summary

    * The "-40" comes from the GraphNode offset, see the GraphNode component.
    * The height is "200" + "40".
    * The "99999" is the maximum component width (because we don't know
      how wide it will be until we render it).
    * The "overflow-x: hidden" prevents this 99999 width from causing
      horizontal scrolling.
    * The "8em" is the height that this SVG will be scaled to fill.
    -->
    <div style="overflow-x: hidden;">
      <svg
        preserveAspectRatio="xMinYMin"
        viewBox="-40 -40 99999 200"
        height="6em"
      >
        <GraphNode
          :task="task"
          :jobs="task.children"
          :jobTheme="jobTheme"
        />
      </svg>
    </div>

    <!-- The task information -->
    <v-expansion-panels
      multiple
      v-model="panelExpansion"
      flat
      static
      color="blue-grey-lighten-3"
      bg-color="grey-lighten-4"
      rounded="lg"
    >
      <v-defaults-provider :defaults="{
        VExpansionPanelTitle: {
          class: 'text-title-small py-2',
        },
        VExpansionPanelText: {
          class: 'mt-2',
        },
        VTable: {
          density: 'compact',
          class: 'bg-transparent',
        },
      }">
        <!-- The metadata -->
        <v-expansion-panel
          value="metadata"
          class="metadata-panel"
        >
          <v-expansion-panel-title>
            Metadata
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <dl>
              <dt>Title</dt>
              <dd>{{ taskMetadata.title }}</dd>
              <v-divider />
              <dt>Description</dt>
              <dd><span class="markup">{{ taskMetadata.description }}</span></dd>
              <template v-if="taskMetadata.URL">
                <v-divider />
                <dt>URL</dt>
                <dd>
                  <!--
                      NOTE: for security reasons, always display the full URL
                      that the link directs to
                  -->
                  <a
                    :href="taskMetadata.URL"
                    target="_blank"
                  >
                    {{ taskMetadata.URL }}
                  </a>
                </dd>
              </template>
              <template v-for="(value, key) in customMetadata" :key="key">
                <v-divider />
                <dt>{{ key }}</dt>
                <dd><span class="markup">{{ value }}</span></dd>
              </template>
            </dl>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel
          value="runMode"
          class="run-mode-panel"
        >
          <v-expansion-panel-title>
            Run Mode
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="d-flex align-center gap-2">
              <v-icon :icon="runModeIcon"/>{{ runMode }}
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel
          v-if="inheritance?.length > 1"
          value="inheritance"
          data-cy="inheritance-panel"
        >
          <v-expansion-panel-title>
            <template #default="{ expanded }">
              Inheritance
              <v-icon
                v-if="expanded"
                :icon="mdiHelpCircleOutline"
                class="ml-2"
                v-tooltip="{
                  text: 'Shows the linearised family inheritance hierarchy for this task. The order of precedence is determined by the C3 algorithm used in Python.',
                  location: 'top',
                }"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-breadcrumbs :items="inheritance">
              <template #divider>
                <span>::</span>
              </template>
            </v-breadcrumbs>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel
          v-if="xtriggers.length"
          value="xtriggers"
          class="xtriggers-panel"
        >
          <v-expansion-panel-title>
            Xtriggers
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>ID</th>
                  <th>Is satisfied</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="xt in xtriggers" :key="xt.id">
                  <td>{{ xt.label }}</td>
                  <td class="text-mono">{{ xt.id }}</td>
                  <td><v-icon>{{ xt.satisfactionIcon }}</v-icon></td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- The prereqs -->
        <v-expansion-panel
          value="prereqs"
          class="prerequisites-panel"
        >
          <v-expansion-panel-title>
            Prerequisites
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ul>
              <li
                v-for="prereq in prereqs"
                :key="prereq.expression"
                class="my-1"
              >
                <v-chip v-bind="prereqChipProps(prereq.expression, prereq.satisfied)"/>
                <ul>
                  <li
                    v-for="condition in prereq.conditions"
                    :key="condition.taskAlias"
                    class="my-1"
                  >
                    <v-chip v-bind="prereqChipProps(condition.exprAlias, condition.satisfied)"/>
                    <span style="margin-left: 0.5em; font-size: 0.9em;">
                      {{ condition.taskId }}:{{ condition.reqState }}
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- The outputs -->
        <v-expansion-panel
          value="outputs"
          class="outputs-panel"
        >
          <v-expansion-panel-title>
            Outputs
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ul>
              <li v-for="output in outputs" :key="output.label">
                <v-chip
                  :text="output.label"
                  variant="text"
                  v-bind="output.satisfied ? {
                    prependIcon: mdiCheckCircleOutline,
                  } : {
                    prependIcon: mdiProgressHelper,
                    class: 'text-grey',
                  }"
                  data-cy="output-chip"
                />
              </li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- The completion -->
        <v-expansion-panel
          value="completion"
          class="completion-panel"
        >
          <v-expansion-panel-title>
            Completion
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <!-- TODO: We don't have an "is complete" field yet so we cannot
              display an aggregate status-->
            <ul>
              <li
                v-for="([complete, indent, line], index) in formatCompletion(completion, outputs)"
                :key="index"
              >
                <span
                  class="condition"
                  :class="{satisfied: complete, blank: (complete === null)}"
                >
                  <!-- Indent the line as required -->
                  <span :style="`margin-left: ${1 * indent}em;`"></span>
                  {{ line }}
                </span>
              </li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-defaults-provider>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useJobTheme } from '@/composables/localStorage'
import GraphNode from '@/components/cylc/GraphNode.vue'
import { formatCompletion } from '@/utils/outputs'
import {
  mdiCheck,
  mdiCheckCircleOutline,
  mdiProgressHelper,
  mdiSkipForward,
  mdiChatQuestion,
  mdiGhostOutline,
  mdiPlay,
  mdiDramaMasks,
  mdiCheckboxOutline,
  mdiCheckboxBlankOutline,
  mdiHelpCircleOutline,
} from '@mdi/js'
import { cloneDeep } from 'lodash-es'
import { formatDatetime } from '@/utils/datetime'

const props = defineProps({
  task: {
    required: true,
  },
})

const panelExpansion = defineModel({
  required: false,
  default: ['metadata'],
})

const inheritance = computed(
  () => props.task?.node?.namespace?.slice(1) ?? []
)

const jobTheme = useJobTheme()

/** Default task metadata sections (title, description, URL) */
const taskMetadata = computed(() => props.task?.node?.task?.meta || {})

/** Used-defined task metadata sections */
const customMetadata = computed(() => props.task?.node?.task?.meta.userDefined || {})

/** Task prerequisite information. */
const prereqs = computed(() => props.task?.node?.prerequisites || {})

const prereqChipProps = (expression, satisfied) => ({
  text: expression.replace(/c/g, ''),
  color: satisfied ? 'success' : 'grey',
  prependIcon: satisfied ? mdiCheck : mdiProgressHelper,
  class: satisfied ? 'font-weight-medium' : undefined,
  density: 'comfortable',
})

/** Task output information. */
const outputs = computed(() => props.task?.node?.outputs || {})

/** Task output completion expression stuff. */
const completion = computed(() => props.task?.node?.runtime.completion)

/** Task Run Mode icon. */
const runModeIcon = computed(() => {
  switch (props.task?.node?.runtime.runMode) {
    case 'Skip': return mdiSkipForward
    case 'Live': return mdiPlay
    case 'Simulation': return mdiGhostOutline
    case 'Dummy': return mdiDramaMasks
    default: return mdiChatQuestion
  }
})

/** Task Run Mode. */
const runMode = computed(() => props.task?.node?.runtime.runMode)

const xtriggers = computed(() => {
  const xtriggers = props.task?.node?.xtriggers?.map((item) => {
    const xtrigger = cloneDeep(item)
    xtrigger.satisfactionIcon = xtrigger.satisfied ? mdiCheckboxOutline : mdiCheckboxBlankOutline
    // Extract the trigger time from the ID
    // Since we've created this date from a Unix timestamp, we can safely assume it is in UTC:
    xtrigger.id = xtrigger.id.replace(
      /trigger_time=(?<unixTime>[0-9.]+)/,
      (match, p1) => `trigger_time=${formatDatetime(new Date(p1 * 1000))}`
    )
    return xtrigger
  })
  // Sort the xtriggers by label, then by ID:
  xtriggers.sort(function (a, b) {
    if (a.label === b.label) {
      return a.id > b.id ? 1 : -1
    }
    return a.label > b.label ? 1 : -1
  })
  return xtriggers
})
</script>

<style scoped lang="scss">
  .c-info {
    padding: 0.5em;

    // for user-defined text where whitespace should be preserved
    .markup {
      white-space: pre-wrap;
    }

    // change the appearance of satisfied/unsatisfied conditions
    .condition {
      opacity: 0.6;
    }
    .condition.satisfied, .condition.blank {
      opacity: 1;
    }

    // for prerequisite task "aliases" (used in conditional expressions)
    .prerequisite-alias {
      font-style: italic;
      color: rgb(100, 100, 255);
    }

    .metadata-panel {
      dl {
        dt {
          font-weight: bold;
        }
        .v-divider {
          margin: 0.4em 0;
        }
      }
    }

    .prerequisites-panel {
      li {
        list-style: none;
      }

      ul li ul {
        margin-left: 2em;
      }
    }

    .outputs-panel {
      li {
        list-style: none;
      }
    }

    .completion-panel {
      li {
        list-style: none;
      }
    }

    .v-breadcrumbs {
      flex-wrap: wrap;
      padding: 0;
    }
  }
</style>
