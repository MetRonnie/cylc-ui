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

import {
  watch,
  type WatchOptions,
  type WatchSource,
} from 'vue'

/**
 * Watch source until it is truthy, then call the callback (and stop watching).
 *
 * Immediate by default.
 */
export function when<T> (
  source: WatchSource<T>,
  callback: (value: NonNullable<T>) => unknown,
  options: WatchOptions = {}
): void {
  const unwatch = watch(
    source,
    (value) => {
      if (value) {
        unwatch()
        callback(value)
      }
    },
    { immediate: true, ...options }
  )
}

/**
 * Return a promise that resolves when the source becomes truthy.
 *
 * Awaitable version of when().
 */
export function until (
  source: WatchSource,
  options: WatchOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    when(source, resolve, options)
  })
}
