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
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 *
 * @type {import('vue-router').RouteRecordRaw[]} - except the `name` and
 * `component` fields which are automatically added in @/src/router/index.js
 */
export default [
  {
    path: '/',
    view: 'Dashboard',
    meta: {
      title: 'Dashboard',
      layout: 'default'
    }
  },
  {
    path: '/graphiql',
    view: 'GraphiQL',
    meta: {
      title: 'GraphiQL',
      layout: 'empty'
    }
  },
  {
    path: '/:catchAll(.*)',
    view: 'NotFound',
    meta: {
      title: 'NotFound',
      layout: 'empty'
    }
  },
  {
    path: '/noAuth',
    view: 'NoAuth',
    meta: {
      title: 'Unauthorized',
      layout: 'noAuth',
    },
  },
]
