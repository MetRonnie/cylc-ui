<template>
  <v-container
    fill-height
    fluid
    grid-list-xl
  >
    <v-layout
      justify-center
      wrap
    >
      <v-flex
        md12
      >
          <v-alert
            prominent
            color="grey lighten-3"
            icon="mdi-settings"
          >
            <h3 class="headline">{{ $t('Workflows.tableHeader') }}</h3>
          </v-alert>
        <v-data-table
          :headers="headers"
          :items="workflows"
          :loading="isLoading"
        >
          <template slot="no-data" v-if="!isLoading">
            <v-alert
              :value="true"
              color="error"
              icon="warning">
              No workflows found for the current user
            </v-alert>
          </template>
          <template
            slot="headerCell"
            slot-scope="{ header }"
          >
            <span
              class="subheading font-weight-light text-success text--darken-3"
              v-text="header.text"
            />
          </template>
          <v-progress-linear slot="progress" color="green" indeterminate></v-progress-linear>
          <template
            slot="item"
            slot-scope="{ item }"
          >
            <tr style="cursor:pointer" @click="viewWorkflow(item)">
              <td>{{ item.name }}</td>
              <td>{{ item.owner }}</td>
              <td>{{ item.host }}</td>
              <td>{{ item.port }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { mixin } from '@/mixins/index'
import i18n from '@/i18n'
import { WORKFLOWS_TABLE_QUERY } from '@/graphql/queries'

// query to retrieve all workflows
const QUERIES = {
  root: WORKFLOWS_TABLE_QUERY
}

export default {
  mixins: [mixin],
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflows')
    }
  },
  data: () => ({
    viewID: 'GScan: ' + Math.random(),
    subscriptions: {},
    isLoading: true,
    headers: [
      {
        sortable: true,
        text: i18n.t('Workflows.tableColumnName'),
        value: 'name'
      },
      {
        sortable: true,
        text: i18n.t('Workflows.tableColumnOwner'),
        value: 'owner'
      },
      {
        sortable: true,
        text: i18n.t('Workflows.tableColumnHost'),
        value: 'host'
      },
      {
        sortable: false,
        text: i18n.t('Workflows.tableColumnPort'),
        value: 'port'
      }
    ]
  }),

  computed: {
    ...mapState('workflows', ['workflows'])
  },

  created () {
    this.$workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')
  },

  beforeDestroy () {
    this.$workflowService.unregister(this)
  },

  methods: {
    viewWorkflow (workflow) {
      this.$router.push({ path: `/workflows/${workflow.name}` })
    },

    subscribe (queryName) {
      const id = this.$workflowService.subscribe(
        this,
        QUERIES[queryName],
        this.setActive
      )
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] = {
          id,
          active: false
        }
      }
    },

    unsubscribe (queryName) {
      if (queryName in this.subscriptions) {
        this.$workflowService.unsubscribe(
          this.subscriptions[queryName].id
        )
      }
    },

    setActive (isActive) {
      this.isLoading = !isActive
    }
  }
}
</script>
