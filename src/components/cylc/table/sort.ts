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

/**
 * Comparator function for sorting datetime strings.
 *
 * @param a - The first element for comparison.
 * @param b - The second element for comparison.
 * @return A number > 0 if a > b, or < 0 if a < b, or 0 if a === b
 */
export function datetimeComparator (a: string | number, b: string | number): number {
  return new Date(a).valueOf() - new Date(b).valueOf()
}

/**
 * Comparator function for sorting numbers.
 */
export function numberComparator (a: number, b: number): number {
  return a - b
}
