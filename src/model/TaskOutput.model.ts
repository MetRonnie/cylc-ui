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

export enum TaskOutput {
  // @see: https://cylc.github.io/cylc-admin/proposal-state-names.html#outputs
  // @see: https://github.com/cylc/cylc-flow/blob/bb79a6e03437927ecf97deb6a34fa8f1e7ab0835/cylc/flow/task_outputs.py
  EXPIRED = 'expired',
  SUBMITTED = 'submitted',
  SUBMIT_FAILED = 'submit-failed',
  STARTED = 'started',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export const TASK_OUTPUT_NAMES: readonly TaskOutput[] = [
  TaskOutput.SUBMITTED,
  TaskOutput.STARTED,
  TaskOutput.SUCCEEDED,
  TaskOutput.SUBMIT_FAILED,
  TaskOutput.FAILED,
  TaskOutput.EXPIRED
]
