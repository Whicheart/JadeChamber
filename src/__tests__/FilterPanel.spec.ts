import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import FilterPanel from '../components/FilterPanel.vue'
import type { FilterGroup, FilterSelection } from '../types/filter'

const groups: FilterGroup[] = [
  {
    key: 'elements',
    name: '元素',
    buttons: [
      { label: '火', value: 'Fire' },
      { label: '水', value: 'Water' },
    ],
  },
]

describe('FilterPanel', () => {
  it('emits the next selection when an option is clicked', async () => {
    const modelValue: FilterSelection = { elements: [] }
    const wrapper = mount(FilterPanel, { props: { groups, modelValue } })

    await wrapper.get('.filter-option').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[{ elements: ['Fire'] }]])
  })

  it('removes an option that is already selected', async () => {
    const modelValue: FilterSelection = { elements: ['Fire'] }
    const wrapper = mount(FilterPanel, { props: { groups, modelValue } })

    await wrapper.get('.filter-option').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[{ elements: [] }]])
  })
})
