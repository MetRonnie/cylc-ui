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

import { createApp } from 'vue'

// Plugins
import { vuetifyOptions } from '@/plugins/vuetify'
import ServicesPlugin from '@/services/plugin'
import Default from '@/layouts/Default.vue'
import Empty from '@/layouts/Empty.vue'

// Application imports
import App from '@/App.vue'
import router from '@/router/index'
import { store } from '@/store/index'
import { createVuetify } from 'vuetify'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(createVuetify(vuetifyOptions))
app.use(ServicesPlugin)

app.component('default-layout', Default)
app.component('empty-layout', Empty)

// https://router.vuejs.org/guide/migration/#removal-of-router-app
router.app = app

router.isReady().then(() => app.mount('#app'))
