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

import { Widget } from '@lumino/widgets'
import { eventBus } from '@/services/eventBus'
import { type Message } from '@lumino/messaging'

/**
 * This is a valid Lumino widget, that contains only a dummy div
 * element.
 *
 * It will be created and added to the Lumino panel, then a Vue component
 * will be created elsewhere, and attached to the div.
 *
 * Events in the widget will be propagated to the Vue component. Event
 * listeners much be attached to the DOM element with the widget ID.
 */
export default class LuminoWidget extends Widget {
  /**
   * Create a LuminoWidget object.
   * @param id - unique ID of the widget
   * @param name - text displayed in the widget tab
   * @param closable - flag that controls whether the tab can be closed or not
   */
  constructor (
    id: string,
    public name: string,
    public readonly closable: boolean = true
  ) {
    super({ node: LuminoWidget.createNode(id) })
    this.id = id
    // classes and flags
    this.setFlag(Widget.Flag.DisallowLayout)
    this.addClass('content')
  }

  /**
   * Return a dummy div to be used as parent for the Vue component element.
   * @param id - widget id
   */
  static createNode (id: string): HTMLElement {
    const div = document.createElement('div')
    div.setAttribute('id', id)
    return div
  }

  onBeforeAttach (msg: Message) {
    // Set tab title as this is not handled automatically for some reason.
    // NOTE: We do this in the onBeforeAttach hook rather than in the constructor
    // because the constructor does not get called when we restore layout to the
    // dock panel.
    // Setting these properties are handled by setters in the @lumino/widgets code
    // which cause the tab panel to be updated.
    this.title.label = this.name
    this.title.closable = this.closable
    super.onBeforeAttach(msg)
  }

  // // TODO: currently unused, but leaving it here for future reference
  // onActivateRequest (msg) {
  //   // Emit an event so that the Vue component knows that it was activated
  //   eventBus.emit('lumino:activated', this._getEventDetails())
  //   super.onActivateRequest(msg)
  // }

  onCloseRequest (msg: Message) {
    // Emit an event so that the Vue component knows that it needs to be removed too
    eventBus.emit('lumino:deleted', this.id)
    super.onCloseRequest(msg)
  }

  onAfterShow (msg: Message) {
    // Emit an event so that the Vue component knows that this widget is visible again
    eventBus.emit(`lumino:show:${this.id}`)
    super.onAfterShow(msg)
  }
}
