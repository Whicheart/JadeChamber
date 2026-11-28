<script setup lang="ts">
import FormulaBlock from '../components/FormulaBlock.vue'

const terms: Record<string, string> = {
  base: '角色模板 × 技能倍率。',
  baseBonus: '描述中带有「造成的伤害提高 x%」的效果。',
  dmgBonus: '描述中带有「我方造成的伤害提升 x%」的效果。',
  vulnBonus: '描述中带有「目标受到的伤害提升 x%」的效果。',
  dmgReduction: '描述中带有「目标受到的伤害降低 x%」的效果。',
  aggravate: '见「激化反应」章节。',
  amplify: '见「增幅反应」章节。',
}

const finalDamageLatex = String.raw`\begin{aligned}
\text{最终伤害} ={}& (\htmlData{term=base}{\text{基础值}} + \htmlData{term=aggravate}{\text{激化值}} + \htmlData{term=baseBonus}{\text{基础值加成}}) \\
&\times (1 + \htmlData{term=dmgBonus}{\text{增伤}}\% + \htmlData{term=vulnBonus}{\text{易伤}}\% - \htmlData{term=dmgReduction}{\text{减伤}}\%) \\
&\times \text{抗性系数} \times \text{防御系数} \times \text{暴击区} \times \htmlData{term=amplify}{\text{蒸发融化系数}}
\end{aligned}`
</script>

<template>
  <article class="damage-formula">
    <h1 class="damage-formula__title">伤害公式</h1>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">常规伤害</h2>
      <FormulaBlock :latex="finalDamageLatex" :terms="terms" />
      <p class="damage-formula__note">
        注：若攻击没有出现伤害数字（例如命中护盾等），则本次伤害不会计算蒸发融化系数。
      </p>
    </section>
  </article>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.damage-formula {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.damage-formula__title {
  color: $color-text-primary;
  font-family: $font-family-base;
  font-size: $font-size-2xl;
}

.damage-formula__section {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.damage-formula__heading {
  color: $color-text-primary;
  font-size: $font-size-xl;
}

.damage-formula__note {
  color: $color-text-secondary;
}
</style>
