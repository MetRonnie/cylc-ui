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

<style lang="scss">
// make the toolbar sit alongside the workflow|job selector
// and put some space between them
.c-log .c-view-toolbar {
  display: inline-block;
  margin-left: 1em;
}
</style>

<template>
  <v-container
    class="c-log h-100 pa-0 d-flex flex-column"
    fluid
  >
    <v-container fluid>
      <!-- the controls -->
      <v-row
        dense
        class="flex-0-0"
      >
        <v-col class="pt-0">
          <v-btn-toggle
            v-model="jobLog"
            divided
            mandatory
            variant="outlined"
            color="primary"
            density="comfortable"
          >
            <v-btn data-cy="workflow-toggle">Workflow</v-btn>
            <v-btn data-cy="job-toggle">Job</v-btn>
          </v-btn-toggle>
          <ViewToolbar
            :groups="controlGroups"
            @setOption="setOption"
            :size="toolbarBtnSize"
          />
        </v-col>
      </v-row>

      <!-- the inputs -->
      <v-row
        dense
        class="flex-0-0"
      >
        <v-col cols="8">
          <v-text-field
            v-if="jobLog"
            data-cy="job-id-input"
            class="flex-grow-1 flex-column"
            v-model="inputID"
            :rules="[validateInputID]"
            placeholder="cycle/task/job"
            clearable
          >
            <template #prepend-inner>
              <v-btn
                :disabled="!relativeTokens || jobNode === false"
                v-bind="toolbarBtnProps"
                size="medium"
                variant="plain"
                @click="() => jobNode ?? fetchJobData()"
                data-cy="job-info-btn"
              >
                <v-icon :icon="$options.icons.mdiInformationOutline"/>
                <v-menu
                  activator="parent"
                  :close-on-content-click="false"
                >
                  <v-card class="pa-2">
                    <v-skeleton-loader
                      v-if="!jobNode"
                      type="text@6"
                    />
                    <JobDetails
                      v-else
                      :node="jobNode"
                      density="compact"
                      hover
                    >
                      <template #header>
                        {{ new Tokens(jobNode.id).relativeID }}
                      </template>
                    </JobDetails>
                  </v-card>
                </v-menu>
              </v-btn>
            </template>
          </v-text-field>
          <v-text-field
            v-else
            data-cy="workflow-id-input"
            v-model="workflowID"
            disabled
          />
        </v-col>
        <v-col
          cols="4"
          class="d-flex align-start col-gap-2"
        >
          <v-select
            data-cy="file-input"
            :label="fileLabel"
            :disabled="fileDisabled"
            :items="logFiles"
            v-model="file"
            :menu-props="{ 'data-cy': 'file-input-menu' }"
          />
          <v-btn
            @click="() => this.updateLogFileList()"
            v-bind="toolbarBtnProps"
            data-cy="refresh-files"
          >
            <v-icon :icon="$options.icons.mdiFolderRefresh"/>
            <v-tooltip>Refresh file list</v-tooltip>
          </v-btn>
        </v-col>
      </v-row>

      <!-- the status line -->
      <v-row
        dense
        class="flex-0-0"
      >
        <v-col
          v-if="logLines || results.connected != null"
          class="d-flex align-center"
        >
          <v-chip
            data-cy="connected-icon"
            variant="outlined"
            class="flex-shrink-0"
            v-bind="connectionChipProps"
          >
            <template #prepend v-if="showCachedLogs">
              <v-progress-circular
                indeterminate
                size="16"
                width="2"
                class="ml-n1 mr-2"
              />
            </template>
          </v-chip>
          <template v-if="results.path">
            <div
              data-cy="log-path"
              class="ml-2 mr-1 d-flex text-medium-emphasis text-pre overflow-x-hidden"
            >
              <span>{{ results.host }}:</span>
              <span class="flex-shrink-1 text-truncate">{{ parentPath }}</span>
              <span>/{{ file }}</span>
            </div>
            <CopyBtn
              :text="results.path"
              tooltip="Copy path"
            />
          </template>
        </v-col>
      </v-row>
      <v-alert
        v-if="results.error"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-2"
        :icon="$options.icons.mdiFileAlertOutline"
      >
        <span class="text-pre-wrap text-break">
          {{ results.error }}
        </span>
      </v-alert>
    </v-container>

    <!-- the log file viewer -->
    <log-component
      v-if="logLines"
      data-cy="log-viewer"
      :logs="logLines"
      :timestamps="timestamps"
      :word-wrap="wordWrap"
      v-model:autoScroll="autoScroll"
      :class="showCachedLogs ? 'text-medium-emphasis' : ''"
    />
    <v-skeleton-loader
      v-else-if="id && file && results.connected == null"
      type="text@5"
      class="align-content-start"
    />
  </v-container>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { computedAsync, refWithControl, usePrevious, whenever } from '@vueuse/core'
import { useStore } from 'vuex'
import {
  mdiClockOutline,
  mdiFolderRefresh,
  mdiPowerPlugOff,
  mdiPowerPlug,
  mdiWrap,
  mdiFileAlertOutline,
  mdiMouseMoveDown,
  mdiInformationOutline,
} from '@mdi/js'
import { btnProps } from '@/utils/viewToolbar'
import { workflowName, useGraphQL } from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'
import LogComponent from '@/components/cylc/log/Log.vue'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { Tokens } from '@/utils/uid'
import gql from 'graphql-tag'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'
import DeltasCallback from '@/services/callbacks'
import { debounce, throttle } from 'lodash-es'
import CopyBtn from '@/components/core/CopyBtn.vue'
import { Alert } from '@/model/Alert.model'
import { getJobLogFileFromState } from '@/model/JobState.model'
import JobDetails from '@/components/cylc/common/JobDetails.vue'
import { useLogWordWrapDefault } from '@/composables/localStorage'
import { eventBus } from '@/services/eventBus'
import { housekeepCache, useLogsCache } from '@/composables/cacheStorage'

/**
 * Query used to retrieve data for the Log view.
 *
 * @type {DocumentNode}
*/
const LOGS_SUBSCRIPTION = gql`
subscription LogData ($id: ID!, $file: String!) {
  logs (id: $id, file: $file) {
    lines
    connected
    path
    error
  }
}
`

/**
 * Query used to retrieve available log files for the Log view.
 *
 * @type {DocumentNode}
*/
const LOG_FILE_QUERY = gql`
query LogFiles($id: ID!) {
  logFiles(id: $id) {
    files
  }
}
`

/**
 * Query used to retrieve data on the Job.
 *
 * @type {DocumentNode}
*/
const JOB_QUERY = gql`
query Jobs($id: ID!, $workflowId: ID!) {
  jobs (live: false, ids: [$id], workflows: [$workflowId]) {
    id
    state
    platform
    jobId
    jobRunnerName
    submittedTime
    startedTime
    finishedTime
  }
}
`

/**
 * The preferred file to start with as a list of patterns.
 * The first pattern with a matching file name will be chosen.
 */

class Results {
  constructor () {
    /** @type {string[]} */
    this.lines = []
    /** @type {?string} */
    this.host = null
    /** @type {?string} */
    this.path = null
    /** @type {?boolean} */
    this.connected = null
    /** @type {?string} */
    this.error = null
  }
}

/** Callback for assembling the log file from the subscription */
class LogsCallback extends DeltasCallback {
  /**
   * @param {Results} results
   */
  constructor (results, cacheFunc) {
    super()
    this.results = results
    this.cacheFunc = cacheFunc
  }

  onAdded (added, store, errors) {
    if (this.results.connected === false) {
      // We have reconnected; clear the current lines otherwise they will be duplicated
      this.results.lines = []
    }
    if (added.lines) {
      this.results.lines.push(...added.lines)
      console.log('Received lines:', this.results.lines.length)
      this.cacheFunc(this.results.lines)
    }
    if (added.connected != null) {
      this.results.connected = added.connected
    }
    if (added.error != null) {
      this.results.error = added.error
    }
    if (added.path != null) {
      [this.results.host, this.results.path] = added.path.split(':', 2)
    }
  }
}

export default {
  name: 'Log',

  mixins: [
    subscriptionComponentMixin
  ],

  components: {
    CopyBtn,
    LogComponent,
    ViewToolbar,
    JobDetails,
  },
  emits: [
    updateInitialOptionsEvent,
  ],

  props: {
    initialOptions,
    /** ID of widget if the log view is in a Lumino tab. */
    widgetID: {
      type: String,
      required: false,
      default: null,
    },
    workflowName,
  },

  setup (props, { emit }) {
    const store = useStore()

    const { workflowID } = useGraphQL(props)

    /**
     * The task/job ID.
     * @type {import('vue').Ref<string>}
     */
    const relativeID = useInitialOptions('relativeID', { props, emit })

    const previousRelativeID = usePrevious(relativeID)

    /**
     * Toggle between viewing workflow logs (0) and job logs (1).
     * Default to displaying workflow logs unless initial task/job ID is provided.
     */
    const jobLog = ref(relativeID.value == null ? 0 : 1)

    /**
     * The user input for task/job ID.
     * Set the value of relativeID at most every 0.5 seconds.
     */
    const inputID = refWithControl(relativeID.value, {
      onChanged: debounce((value) => {
        relativeID.value = value
      }, 500)
    })

    function validateInputID (input) {
      return !input || (Tokens.validate(input, true) ?? true)
    }

    /** @type {import('vue').Ref<Tokens>} */
    const relativeTokens = computed(() => {
      if (relativeID.value) {
        try {
          const tokens = new Tokens(relativeID.value, true)
          if (tokens.task) {
            return tokens.job ? tokens : tokens.clone({ job: 'NN' })
          }
        } catch {}
      }
      return null
    })

    /** Tokens for the workflow this view was opened for */
    const workflowTokens = computed(() => new Tokens(workflowID.value))

    /** The ID of the workflow/task/job we are subscribed to or null if not subscribed */
    const id = computed(() => {
      if (jobLog.value) {
        return relativeTokens.value?.clone(workflowTokens.value)?.id
      }
      return workflowID.value
    })

    /**
     * The selected log file name.
     * @type {import('vue').Ref<string>}
     */
    const file = useInitialOptions('file', { props, emit })

    /** Toggle timestamps in log files */
    const timestamps = useInitialOptions('timestamps', { props, emit }, true)

    /* Wrap lines? */
    const wordWrapDefault = useLogWordWrapDefault()
    const wordWrap = useInitialOptions('wordWrap', { props, emit }, wordWrapDefault.value)
    watch(wordWrap, (value) => {
      wordWrapDefault.value = value
    })

    /** The log subscription results */
    const results = ref(new Results())

    function reset () {
      results.value = new Results()
    }

    /** The path of the log file parent dir minus the trailing slash. */
    const parentPath = computed(
      () => results.value.path?.substring(0, results.value.path.length - file.value.length - 1)
    )

    whenever(
      () => store.state.offline,
      () => { results.value.connected = false }
    )

    const logsCache = useLogsCache()
    const logsCacheExpiryMs = 3600e3
    const logsCacheKey = computed(
      () => (logsCache && id.value && file.value) ? `${id.value}::${file.value}` : null
    )

    const cachedLogLines = computedAsync(async () => {
      if (!logsCacheKey.value) return
      const cache = await logsCache
      const response = await cache.match(logsCacheKey.value)
      if (!response) return
      const { lines, expiry } = await response.json()
      if (Date.now() > expiry) {
        cache.delete(logsCacheKey.value)
        return
      }
      housekeepCache(cache)
      return lines.length ? lines : undefined
    })

    async function putLogsCache (lines) {
      if (!logsCacheKey.value) return
      console.log('Caching lines:', lines.length)
      const cache = await logsCache
      await cache.put(logsCacheKey.value, new Response(
        JSON.stringify({ lines, expiry: Date.now() + logsCacheExpiryMs })
      ))
    }

    const showCachedLogs = computed(
      () => results.value.connected == null && cachedLogLines.value?.length
    )

    /** AutoScroll? */
    const autoScroll = useInitialOptions('autoScroll', { props, emit }, true)

    /** View toolbar button size */
    const toolbarBtnSize = '40'

    const logLines = computed(
      () => results.value.lines?.length ? results.value.lines : cachedLogLines.value
    )

    return {
      // the log subscription query
      query: ref(null),
      // list of log files for the selected workflow/task/job
      logFiles: ref([]),
      logLines,
      results,
      showCachedLogs,
      putLogsCache,
      parentPath,
      id,
      relativeID,
      previousRelativeID,
      inputID,
      validateInputID,
      relativeTokens,
      workflowTokens,
      Tokens,
      file,
      // the label for the file input
      fileLabel: ref('Select File'),
      // turns the file input off (e.g. when the file list is being loaded)
      fileDisabled: ref(false),
      jobLog,
      timestamps,
      wordWrap,
      autoScroll,
      reset,
      toolbarBtnSize,
      toolbarBtnProps: btnProps(toolbarBtnSize),
      jobNode: ref(null),
      workflowID,
    }
  },

  mounted () {
    // Watch id & file together:
    this.$watch(
      () => ({
        id: this.id ?? undefined, // (do not trigger the callback on null ⇄ undefined)
        file: this.file ?? undefined
      }),
      async ({ id, file }, old) => {
        // update the widget tab caption when the id or file change
        if (this.widgetID) {
          const prefix = this.relativeID ? `${this.relativeID} – ` : ''
          eventBus.emit(
            `lumino:update-tab:${this.widgetID}`,
            {
              title: `Log: ${this.jobLog ? 'Job' : 'Workflow'}`,
              caption: `${prefix}${file ?? 'No file selected'}`,
            }
          )
        }
        // update the query when the id or file change
        this.updateQuery()
        // refresh the file & file list when the id changes
        if (id !== old?.id) {
          await this.setNewFile(!old)
        }
      },
      { immediate: true }
    )
  },

  computed: {
    connectionChipProps () {
      if (this.showCachedLogs) {
        return {
          text: 'Cached',
          color: 'blue-grey',
          prependIcon: mdiPowerPlugOff,
        }
      }
      if (this.results.connected) {
        return {
          text: 'Connected',
          color: 'success',
          prependIcon: mdiPowerPlug,
        }
      }
      return {
        text: 'Reconnect',
        color: 'error',
        prependIcon: mdiPowerPlugOff,
        onClick: this.updateQuery,
      }
    },
    controlGroups () {
      return [
        {
          title: 'Log',
          controls: [
            {
              title: 'Timestamps',
              icon: mdiClockOutline,
              action: 'toggle',
              value: this.timestamps,
              key: 'timestamps'
            },
            {
              title: 'Word wrap',
              icon: mdiWrap,
              action: 'toggle',
              value: this.wordWrap,
              key: 'wordWrap',
            },
            {
              title: 'Auto scroll',
              icon: mdiMouseMoveDown,
              action: 'toggle',
              value: this.autoScroll,
              key: 'autoScroll',
            },
          ]
        }
      ]
    }
  },

  methods: {
    setOption (option, value) {
      // used by the ViewToolbar to update settings
      this[option] = value
    },
    updateQuery () {
      // update the subscription query
      // wipe the log lines from any previous subscription
      this.reset()
      // check that there is something to subscribe to
      if (!this.file || !this.id) {
        this.query = null
        return
      }
      // update the subscription
      this.query = new SubscriptionQuery(
        LOGS_SUBSCRIPTION,
        { id: this.id, file: this.file },
        `log-query-${this._uid}`,
        [
          new LogsCallback(this.results, throttle(this.putLogsCache, 5e3))
        ],
        /* isDelta */ false,
        /* isGlobalCallback */ false
      )
    },
    /**
     * Query job data.
     *
     * @returns {Object|false} The job node, or false if no data/the query failed.
     */
    async fetchJobData () {
      let result
      this.jobNode = null
      try {
        if (this.relativeTokens) {
          // get the latest job state
          result = await this.$workflowService.query2(
            JOB_QUERY,
            {
              id: this.relativeTokens.id,
              workflowId: this.workflowTokens.workflow
            }
          )
        }
      } catch (err) {
        // the query failed
        console.error(err)
        return false
      }
      this.jobNode = result?.data?.jobs?.[0] ?? false
      return this.jobNode
    },
    /**
     * Get the default workflow log file from the given log filenames, if there is a
     * matching filename. Relies on the filenames having been sorted in descending
     * order.
     *
     * @returns {?string}
     */
    getDefaultWorkflowLog () {
      return this.logFiles.find((fileName) => fileName.startsWith('scheduler/'))
    },
    async updateLogFileList () {
      if (!this.id) {
        this.handleNoLogFiles()
        return
      }
      // update the list of log files
      this.fileLabel = 'Updating available files...'
      this.fileDisabled = true
      let result
      try {
        // get the list of available log files
        result = await this.$workflowService.apolloClient.query({
          query: LOG_FILE_QUERY,
          variables: { id: this.id }
        })
      } catch (err) {
        // the query failed
        this.handleLogFileListingErr(err)
        this.handleNoLogFiles()
        return
      }

      if (!this.id) {
        // id has been cleared while we were waiting for the query to return
        return
      }

      const logFiles = result.data.logFiles?.files ?? []

      // update the file input
      if (logFiles.length) {
        this.fileLabel = 'Select File'
        this.fileDisabled = false
        this.logFiles = logFiles
      } else {
        if (result.errors?.length) {
          this.handleLogFileListingErr(result.errors[0].message)
        }
        this.handleNoLogFiles()
      }
    },
    /**
     * Set the appropriate workflow or job log file.
     *
     * @param {boolean} initialLoad - is this the initial load of the log view?
     */
    async setNewFile (initialLoad) {
      const promises = [this.updateLogFileList()]
      if (this.jobLog && !initialLoad) {
        // (Don't query job state on initial load, as it will either be pre-populated or empty)
        promises.push(
          this.fetchJobData().then((result) => {
            this.file = getJobLogFileFromState(result?.state)
          })
        )
      }
      // Simultaneously wait for the log file list and the job state result
      await Promise.all(promises)
      if (!this.jobLog) {
        this.file = this.getDefaultWorkflowLog()
      }
    },
    handleNoLogFiles () {
      this.fileLabel = this.id ? `No log files for ${this.id}` : 'Enter a task/job ID'
      this.fileDisabled = true
      this.logFiles = []
    },
    handleLogFileListingErr (err) {
      this.$store.dispatch('setAlert', new Alert(err, 'error'))
    },
  },

  watch: {
    jobLog (val, old) {
      // reset the filename when the log mode changes
      this.file = null
      // go back to last chosen job if we are switching back to job logs
      this.relativeID = val ? this.previousRelativeID : null
    }
  },

  // Misc options
  icons: {
    mdiFolderRefresh,
    mdiPowerPlug,
    mdiPowerPlugOff,
    mdiFileAlertOutline,
    mdiInformationOutline,
  }
}
</script>
