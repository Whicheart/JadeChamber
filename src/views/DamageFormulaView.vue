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
  amplifyBase: '水 → 火 蒸发 2.0\n火 → 水 蒸发 1.5\n火 → 冰 融化 2.0\n冰 → 火 融化 1.5',
}

const finalDamageLatex = String.raw`\begin{aligned}
\text{最终伤害} ={}& (\htmlData{term=base}{\text{基础值}} + \htmlData{term=aggravate}{\text{激化值}} + \htmlData{term=baseBonus}{\text{基础值加成}}) \\
&\times (1 + \htmlData{term=dmgBonus}{\text{增伤}}\% + \htmlData{term=vulnBonus}{\text{易伤}}\% - \htmlData{term=dmgReduction}{\text{减伤}}\%) \\
&\times \text{抗性系数} \times \text{防御系数} \times \text{暴击区} \times \htmlData{term=amplify}{\text{蒸发融化系数}}
\end{aligned}`

const resistanceLatex = String.raw`\text{抗性系数} = \begin{cases}
1 - \frac{\text{抗性}}{2} & \text{抗性} \leq 0 \\
1 - \text{抗性} & 0 \leq \text{抗性} \leq 75\% \\
\frac{1}{4 \times \text{抗性} + 1} & 75\% \leq \text{抗性}
\end{cases}`

const defenseAttackLatex = String.raw`\text{防御系数} = \frac{\text{角色等级} + 100}{(\text{角色等级} + 100) + (\text{敌人等级} + 100) \times (1 - \text{减防}) \times (1 - \text{无视防御})}`

const defenseDefendLatex = String.raw`\text{防御系数} = \frac{5 \times \text{敌人等级} + 500}{5 \times \text{敌人等级} + 500 + \text{角色防御}}`

const amplifyLatex = String.raw`\text{蒸发融化系数} = \htmlData{term=amplifyBase}{\text{基础系数}} \times \left(1 + \frac{2.78 \times \text{元素精通}}{\text{元素精通} + 1400} + \text{反应增伤}\%\right)`
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

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">防御与抗性</h2>
      <p class="damage-formula__caption">抗性通用公式：</p>
      <FormulaBlock :latex="resistanceLatex" />
      <p class="damage-formula__caption">角色攻击敌人时：</p>
      <FormulaBlock :latex="defenseAttackLatex" />
      <p class="damage-formula__caption">敌人攻击角色时：</p>
      <FormulaBlock :latex="defenseDefendLatex" />
      <p class="damage-formula__note">注：来自角色的减防不能超过 90%，无视防御不能超过 100%。</p>
    </section>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">增幅反应</h2>
      <p class="damage-formula__note">增幅反应包括：蒸发、融化</p>
      <FormulaBlock :latex="amplifyLatex" :terms="terms" />
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

.damage-formula__caption {
  color: $color-text-secondary;
}

.damage-formula__note {
  color: $color-text-secondary;
}
</style>
