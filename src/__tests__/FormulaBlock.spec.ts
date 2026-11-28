import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'

import FormulaBlock from '../components/FormulaBlock.vue'

const latex = String.raw`\htmlData{term=base}{\text{基础值}} + 1`

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('FormulaBlock', () => {
  it('renders the formula with a term marker', () => {
    wrapper = mount(FormulaBlock, { props: { latex, terms: { base: '基础值说明' } } })

    const term = wrapper.find('[data-term="base"]')
    expect(term.exists()).toBe(true)
    expect(term.text()).toContain('基础值')
  })

  it('shows the tooltip on hover', async () => {
    wrapper = mount(FormulaBlock, { props: { latex, terms: { base: '基础值说明' } } })

    await wrapper.find('[data-term="base"]').trigger('mouseenter')

    expect(document.body.textContent).toContain('基础值说明')
  })

  it('keeps the tooltip visible when a click immediately follows mouseenter', async () => {
    vi.useFakeTimers()
    try {
      wrapper = mount(FormulaBlock, { props: { latex, terms: { base: '基础值说明' } } })
      const term = wrapper.find('[data-term="base"]')

      await term.trigger('mouseenter')
      await term.trigger('click')

      expect(document.body.textContent).toContain('基础值说明')
    } finally {
      vi.useRealTimers()
    }
  })

  it('hides the tooltip when clicking after the hover timestamp window', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-28T00:00:00Z'))
    try {
      wrapper = mount(FormulaBlock, { props: { latex, terms: { base: '基础值说明' } } })
      const term = wrapper.find('[data-term="base"]')

      await term.trigger('mouseenter')
      vi.setSystemTime(new Date('2026-11-28T00:00:01Z'))
      await term.trigger('click')

      expect(document.body.textContent).not.toContain('基础值说明')
    } finally {
      vi.useRealTimers()
    }
  })
})
