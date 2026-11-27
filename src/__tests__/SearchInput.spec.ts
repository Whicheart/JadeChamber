import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import SearchInput from '../components/SearchInput.vue'

describe('SearchInput', () => {
  it('emits the typed value', async () => {
    const wrapper = mount(SearchInput, { props: { modelValue: '' } })

    await wrapper.get('input').setValue('米提亚')

    expect(wrapper.emitted('update:modelValue')).toEqual([['米提亚']])
  })

  it('emits enter when the user presses Enter', async () => {
    const wrapper = mount(SearchInput, { props: { modelValue: '米' } })

    await wrapper.get('input').trigger('keydown.enter')

    expect(wrapper.emitted('enter')).toHaveLength(1)
  })

  it('clears the value when the clear button is clicked', async () => {
    const wrapper = mount(SearchInput, { props: { modelValue: '米' } })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })
})
