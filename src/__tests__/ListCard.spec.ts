import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import ListCard from '../components/ListCard.vue'

describe('ListCard', () => {
  it('renders the character name and initial placeholder', () => {
    const wrapper = mount(ListCard, { props: { name: '米提亚' } })

    expect(wrapper.text()).toContain('米提亚')
    expect(wrapper.text()).toContain('米')
  })

  it('falls back to the placeholder when the image fails to load', async () => {
    const wrapper = mount(ListCard, {
      props: {
        name: '米提亚',
        image: '/images/UI_Gacha/UI_Gacha_AvatarIcon_Mitya.webp',
      },
    })

    expect(wrapper.find('.list-card__placeholder--desktop').exists()).toBe(false)

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('.list-card__placeholder--desktop').exists()).toBe(true)
  })
})
