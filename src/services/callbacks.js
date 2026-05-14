/*
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

export class DeltasCallback {
  /**
   * Run before all other methods, upon receiving deltas.
   * @param {Deltas} deltas
   */
  before (deltas) {}

  /**
   * Run after all other methods, upon receiving deltas.
   * @param {Deltas} deltas
   */
  after (deltas) {}

  /**
   * Run when stopping the subscription.
   */
  tearDown () {}

  /**
   * Run on `added` deltas only.
   * @param {DeltasAdded|Object} added
   */
  onAdded (added) {}

  /**
   * Run on `updated` deltas only.
   * @param {DeltasUpdated|Object} updated
   */
  onUpdated (updated) {}

  /**
   * Run on `pruned` deltas only.
   * @param {DeltasPruned|Object} pruned -
   */
  onPruned (pruned) {}
}
