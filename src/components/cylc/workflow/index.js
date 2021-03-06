import Vue from 'vue'
import { Widget } from '@lumino/widgets'
import Tree from '@/components/cylc/tree/Tree'
import Graph from '@/components/cylc/graph/Graph'
// import Mutations from '@/components/cylc/Mutations'
import Mutations from '@/views/Mutations'
import VSkeletonLoader from 'vuetify/lib/components/VSkeletonLoader'

/**
 * A widget that will have just a single HTML element to be referenced by the Vue component.
 * Based on the example-dockpanel class ContentWidget.
 */
class ContentWidget extends Widget {
  /**
   * @param {string} id - widget id
   * @param {string} name - widget name (displayed in the tab bar)
   */
  constructor (id, name) {
    super({ node: ContentWidget.createNode(id) })
    this.id = id
    // classes and flags
    this.setFlag(Widget.Flag.DisallowLayout)
    this.addClass('content')
    // tab title
    this.title.label = name
    this.title.closable = true
  }

  /**
   * Return a dummy div to be used as parent for the Vue component element.
   * @param {string} id - widget id
   * @return HTMLElement
   */
  static createNode (id) {
    const div = document.createElement('div')
    div.setAttribute('id', id)
    div.setAttribute('class', 'fill-height')
    return div
  }

  onCloseRequest (msg) {
    // remove the Vue component
    const event = new Event('delete:widgetcomponent')
    document.getElementById(this.id).dispatchEvent(event)
    // close widget
    super.onCloseRequest(msg)
  }

  onActivateRequest (msg) {
    // Offer an opportunity for components to act when the widget is activated
    const event = new Event('activate:widgetcomponent')
    document.getElementById(this.id).dispatchEvent(event)
  }
}

const TreeWrapper = Vue.component('tree-wrapper', {
  name: 'TreeWrapper',
  props: {
    widgetId: {
      type: String,
      required: true
    },
    workflows: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  components: {
    tree: Tree,
    VSkeletonLoader
  },
  mounted () {
    const widgetElement = document.getElementById(this.widgetId)
    widgetElement.appendChild(this.$refs[this.widgetId].$el)
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', this.delete)
  },
  beforeDestroy () {
    document.getElementById(this.widgetId).removeEventListener('delete:widgetcomponent', this.delete)
  },
  methods: {
    delete () {
      // This is captured by the View, that holds subscriptions, and then used to tell which subscription must be turned off
      EventBus.$emit('delete:widget', { id: this.widgetId })
      this.$destroy()
    }
  },
  template: `
    <div>
      <v-skeleton-loader
        :ref="widgetId"
        :loading="isLoading"
        type="list-item-avatar-three-line"
        >
        <tree :workflows="workflows" />
      </v-skeleton-loader>
    </div>
  `
})

const GraphWrapper = Vue.component('graph-wrapper', {
  name: 'GraphWrapper',
  props: {
    widgetId: {
      type: String,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  components: {
    graph: Graph,
    VSkeletonLoader
  },
  mounted () {
    const widgetElement = document.getElementById(this.widgetId)
    widgetElement.appendChild(this.$refs[this.widgetId].$el)
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', this.delete)
    document.getElementById(this.widgetId).addEventListener('activate:widgetcomponent', this.activate)
  },
  beforeDestroy () {
    document.getElementById(this.widgetId).removeEventListener('delete:widgetcomponent', this.delete)
    document.getElementById(this.widgetId).removeEventListener('activate:widgetcomponent', this.activate)
  },
  methods: {
    delete () {
      // This is captured by the View, that holds subscriptions, and then used to tell which subscription must be turned off
      EventBus.$emit('delete:widget', { id: this.widgetId })
      this.$destroy()
    },
    activate () {
      // when this widget is activated, we want to tell the wrapped graph that it needs to force-repaint to avoid blank graphs
      const children = this.$refs[this.widgetId].$children
      if (children && children.length > 0) {
        children[0].resizeGraph()
      }
    }
  },
  template: `
    <div>
      <v-skeleton-loader
        :ref="widgetId"
        :loading="isLoading"
        height="100"
        type="list-item-avatar-three-line"
      >
        <graph :workflow-name="workflowName" />
      </v-skeleton-loader>
    </div>
  `
})

const MutationsWrapper = Vue.component('mutations-wrapper', {
  name: 'MutationsWrapper',
  props: {
    widgetId: {
      type: String,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Mutations,
    VSkeletonLoader
  },
  methods: {
    delete () {
      // This is captured by the View, that holds subscriptions, and then used to tell which subscription must be turned off
      EventBus.$emit('delete:widget', { id: this.widgetId })
      this.$destroy()
    }
  },
  mounted () {
    const widgetElement = document.getElementById(this.widgetId)
    widgetElement.appendChild(this.$refs[this.widgetId].$el)
    const vm = this
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', () => {
      EventBus.$emit('delete:widget', { id: vm.widgetId })
      vm.$destroy()
    }, false)
  },
  beforeDestroy () {
    document.getElementById(this.widgetId).removeEventListener('delete:widgetcomponent', this.delete)
    document.getElementById(this.widgetId).removeEventListener('activate:widgetcomponent', this.activate)
  },
  template: `
    <div>
      <component
        is="VSkeletonLoader"
        :ref="widgetId"
        :loading="isLoading"
        height="100"
        type="list-item-avatar-three-line"
      >
        <Mutations :workflow-name="workflowName" />
      </component>
    </div>
  `
})

const EventBus = new Vue()

export {
  ContentWidget, TreeWrapper, GraphWrapper, MutationsWrapper, EventBus
}
