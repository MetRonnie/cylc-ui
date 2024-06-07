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

export interface User {
  /**
   * The authenticated user
   */
  username: string
  /**
   * The UIS owner (i.e. the user who's workflows we are looking at)
   * (this might not be the authenticated user for multi-user setups)
   */
  owner: string
  /**
   * List of permissions
   */
  permissions: string[]
  /**
   * Single or multi user mode
   */
  mode: 'single user' | 'multi user'
  /**
   * User initials
   */
  initials: string
  /**
   * User avatar color if set
   */
  color: string | null
}
