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

import { nextTick } from 'vue'
import { vi } from 'vitest'
import {
  updateInitialOptionsEvent,
  useInitialOptions,
} from '@/utils/initialOptions'

describe('useInitialOptions', () => {
  it('updates the initialOptions prop when the ref changes', async () => {
    const emit = vi.fn()
    const initialOptions = {
      name: 'Isaac Clarke',
      ship: 'USG Ishimura',
    }
    const props = { initialOptions }
    const name = useInitialOptions('name', { props, emit })
    // Should not be called immediately (as this leads to unnecessarily saving the workspace layout many times)
    expect(emit).not.toHaveBeenCalled()
    emit.mockClear()
    // Change the value of the ref
    name.value = 'Nicole Brennan'
    await nextTick()
    expect(emit).toHaveBeenCalledWith(
      updateInitialOptionsEvent,
      {
        name: 'Nicole Brennan',
        ship: 'USG Ishimura',
      }
    )
  })

  describe('default value parameter', () => {
    it.each([
      { propVal: 'In Amber Clad', defaultVal: 'Forward Unto Dawn', expected: 'In Amber Clad' },
      { defaultVal: 'Forward Unto Dawn', expected: 'Forward Unto Dawn' },
      { expected: undefined },
    ])('prop: $propVal, default: $defaultVal, expected: $expected', ({ propVal, defaultVal, expected }) => {
      const ctx = {
        props: {
          initialOptions: { ship: propVal },
        },
        emit () {},
      }
      const ship = useInitialOptions('ship', ctx, defaultVal)
      expect(ship.value).toBe(expected)
    })

    it('accepts a function as default value', ({ propVal, defaultCalled, expected }) => {
      const emit = () => {}
      const props = {
        initialOptions: { ship: 'In Amber Clad' },
      }
      const expensiveFunc = vi.fn(() => 'default')

      const ship = useInitialOptions('ship', { props, emit }, expensiveFunc)
      expect(ship.value).toBe('In Amber Clad')
      expect(expensiveFunc).not.toHaveBeenCalled()

      expensiveFunc.mockReset()

      const name = useInitialOptions('name', { props, emit }, expensiveFunc)
      expect(name.value).toBe('default')
      expect(expensiveFunc).toHaveBeenCalled()
    })
  })
})
