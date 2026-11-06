import { test } from 'node:test'
import assert from 'node:assert/strict'

import { asset, materialIcon } from '../src/utils/getImage.js'

test('asset：UI_ 前缀的两段名放进同名目录', () => {
  assert.ok(
    asset('UI_AvatarIcon_Ayaka').endsWith('/assets/img/UI_AvatarIcon/UI_AvatarIcon_Ayaka.webp'),
  )
  assert.ok(
    asset('UI_Gacha_AvatarImg_Ayaka').endsWith(
      '/assets/img/UI_Gacha/UI_Gacha_AvatarImg_Ayaka.webp',
    ),
  )
  assert.ok(
    asset('UI_Gacha_AvatarIcon_Vodyanitsa').endsWith(
      '/img/UI_Gacha/UI_Gacha_AvatarIcon_Vodyanitsa.webp',
    ),
  )
  assert.ok(
    asset('UI_EquipIcon_Bow_Alkonost').endsWith('/img/UI_EquipIcon/UI_EquipIcon_Bow_Alkonost.webp'),
  )
  assert.ok(asset('UI_ItemIcon_104161').endsWith('/img/UI_ItemIcon/UI_ItemIcon_104161.webp'))
  assert.ok(asset('UI_RelicIcon_15048_4').endsWith('/img/UI_RelicIcon/UI_RelicIcon_15048_4.webp'))
  assert.ok(asset('UI_Talent_S_Ayaka_01').endsWith('/img/UI_Talent/UI_Talent_S_Ayaka_01.webp'))
  assert.ok(
    asset('UI_Costume_AyakaCostumeFruhling').endsWith(
      '/img/UI_Costume/UI_Costume_AyakaCostumeFruhling.webp',
    ),
  )
  assert.ok(asset('UI_Icon_Element_Fire').endsWith('/img/UI_Icon/UI_Icon_Element_Fire.webp'))
  assert.ok(asset('UI_TeyvatNumIcon_5').endsWith('/img/UI_TeyvatNumIcon/UI_TeyvatNumIcon_5.webp'))
  assert.ok(
    asset('UI_GachaTypeIcon_Pole').endsWith('/img/UI_GachaTypeIcon/UI_GachaTypeIcon_Pole.webp'),
  )
})

test('asset：没有两段前缀的两个家族走特例目录', () => {
  assert.ok(asset('Skill_A_01').endsWith('/assets/img/Skill/Skill_A_01.webp'))
  assert.ok(asset('Skill_E_Ayaka').endsWith('/img/Skill/Skill_E_Ayaka.webp'))
  assert.ok(asset('QUALITY_ORANGE').endsWith('/assets/img/UI_QualityBg/QUALITY_ORANGE.webp'))
  assert.ok(asset('QUALITY_ORANGE_SP').endsWith('/img/UI_QualityBg/QUALITY_ORANGE_SP.webp'))
})

test('asset：空值返回空串，避免 <img> 拿到 undefined', () => {
  assert.equal(asset(''), '')
  assert.equal(asset(null), '')
  assert.equal(asset(undefined), '')
})

test('materialIcon：优先 iconName，缺失时按 id 兜底', () => {
  assert.ok(
    materialIcon({ iconName: 'UI_ItemIcon_104161', id: 104161 }).endsWith(
      '/img/UI_ItemIcon/UI_ItemIcon_104161.webp',
    ),
  )
  // 天赋书的 iconName 后端仍为 null，素材名恰好是 UI_ItemIcon_<id>
  assert.ok(
    materialIcon({ iconName: null, id: 104369 }).endsWith(
      '/img/UI_ItemIcon/UI_ItemIcon_104369.webp',
    ),
  )
  assert.equal(materialIcon({ iconName: '', id: 0 }), '')
  assert.equal(materialIcon(null), '')
})
