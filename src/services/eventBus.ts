/*
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

import mitt from 'mitt'

/**
 * Mitt event for adding a view to the workspace.
 */
export interface AddViewEvent {
  /** The view to add */
  name: string
  /** Prop passed to the view component */
  initialOptions?: Record<string, unknown>
}

/**
 * Mitt event for showing the mutations menu.
 */
export interface ShowMutationsMenuEvent {
  node: any, // TODO
  target: HTMLElement,
}

type Events = {
  'add-view': AddViewEvent,
  'show-mutations-menu': ShowMutationsMenuEvent,
  'lumino:deleted': string,
  'lumino:show': string,
}

/**
 * Global event bus for the app.
 *
 * @see https://github.com/developit/mitt
 */
export const eventBus = mitt<Events>()
