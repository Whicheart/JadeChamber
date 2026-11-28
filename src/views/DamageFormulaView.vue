<script setup lang="ts">
import FormulaBlock from '../components/FormulaBlock.vue'

const terms: Record<string, string> = {
  moonDirectMultiplier: '月感电 3\n月结晶 1.6\n月绽放 1',
  baseBoost: '如角色天赋14%',
  extraBoost: '如兹白天赋「太阴降」效果',
  moonReactionMultiplier: '月感电 1.8\n月结晶 0.96',
  base: '角色模板 × 技能倍率',
  baseBonus: '描述中带有「造成的伤害提高 x%」的效果',
  dmgBonus: '描述中带有「我方造成的伤害提升 x%」的效果',
  vulnBonus: '描述中带有「目标受到的伤害提升 x%」的效果',
  dmgReduction: '描述中带有「目标受到的伤害降低 x%」的效果',
  aggravate: '见「激化反应」章节',
  amplify: '见「增幅反应」章节',
  resistanceDefense: '见「抗性与防御」章节',
  amplifyBase: '水 → 火 蒸发 2.0\n火 → 水 蒸发 1.5\n火 → 冰 融化 2.0\n冰 → 火 融化 1.5',
  extraBonus: '如梦见月瑞希1命、菈乌玛元素爆发等\n不受益于精通增伤、反应增伤',
  reactionMultiplier:
    '燃烧 0.25\n扩散 0.6\n超导 1.5\n感电 2\n超载 2.75\n碎冰 3\n绽放 2\n烈绽放 3\n超绽放 3',
}

const finalDamageLatex = String.raw`\begin{aligned}
\text{最终伤害} ={}& (\htmlData{term=base}{\text{基础值}} + \htmlData{term=aggravate}{\text{激化值}} + \htmlData{term=baseBonus}{\text{基础值加成}}) \\
&\times (1 + \htmlData{term=dmgBonus}{\text{增伤}}\% + \htmlData{term=vulnBonus}{\text{易伤}}\% - \htmlData{term=dmgReduction}{\text{减伤}}\%) \\
&\times \htmlData{term=resistanceDefense}{\text{抗性系数}} \times \htmlData{term=resistanceDefense}{\text{防御系数}} \times \text{暴击区} \times \htmlData{term=amplify}{\text{蒸发融化系数}}
\end{aligned}`

const resistanceLatex = String.raw`\text{抗性系数} = \begin{cases}
1 - \frac{\text{抗性}}{2} & \text{抗性} \leq 0 \\
1 - \text{抗性} & 0 \leq \text{抗性} \leq 75\% \\
\frac{1}{4 \times \text{抗性} + 1} & 75\% \leq \text{抗性}
\end{cases}`

const defenseAttackLatex = String.raw`\text{防御系数} = \frac{\text{角色等级} + 100}{(\text{角色等级} + 100) + (\text{敌方等级} + 100) \times (1 - \text{减防}) \times (1 - \text{无视防御})}`

const defenseDefendLatex = String.raw`\text{防御系数} = \frac{5 \times \text{敌方等级} + 500}{5 \times \text{敌方等级} + 500 + \text{角色防御}}`

const amplifyLatex = String.raw`\text{蒸发融化系数} = \htmlData{term=amplifyBase}{\text{基础系数}} \times \left(1 + \frac{2.78 \times \text{元素精通}}{\text{元素精通} + 1400} + \text{反应增伤}\%\right)`

const transformBaseLatex = String.raw`\text{剧变基础} = 1446.85 \times \htmlData{term=reactionMultiplier}{\text{反应倍率}} \times \left(1 + \frac{16 \times \text{元素精通}}{\text{元素精通} + 2000} + \text{反应增伤}\%\right)`

const transformFinalLatex = String.raw`\text{最终伤害} = (\text{剧变基础} + \htmlData{term=extraBonus}{\text{额外提升}}) \times \htmlData{term=resistanceDefense}{\text{抗性系数}}`

const crystallizeLatex = String.raw`\text{结晶盾量} = 1851.06 \times \left(1 + \frac{4.44 \times \text{元素精通}}{\text{元素精通} + 1400}\right)`

const aggravateDurationLatex = String.raw`\text{原激化元素持续时间} = (6 + 5 \times \text{元素量})\ \text{秒}`

const aggravateValueLatex = String.raw`\text{超激化值} = 1446.85 \times 1.15 \times \left(1 + \frac{5 \times \text{元素精通}}{\text{元素精通} + 1200} + \text{超激化提高}\%\right)`

const spreadValueLatex = String.raw`\text{蔓激化值} = 1446.85 \times 1.25 \times \left(1 + \frac{5 \times \text{元素精通}}{\text{元素精通} + 1200} + \text{蔓激化提高}\%\right)`

const moonDirectBaseLatex = String.raw`\text{直伤基础} = \htmlData{term=moonDirectMultiplier}{\text{直伤基础倍率}} \times \text{基础值} \times (1 + \htmlData{term=baseBoost}{\text{基础提升}}\%) \times \left(1 + \frac{6 \times \text{元素精通}}{\text{元素精通} + 2000} + \text{反应增伤}\%\right)`

const moonDirectFinalLatex = String.raw`\text{最终直伤} = (\text{直伤基础} + \htmlData{term=extraBoost}{\text{额外提升}}) \\
 \times \htmlData{term=resistanceDefense}{\text{抗性系数}} \times \text{暴击区} \times \text{擢升}`

const moonReactionLatex = String.raw`\text{反应伤害} = 1446.85 \times \htmlData{term=moonReactionMultiplier}{\text{反应基础倍率}} \times (1 + \htmlData{term=baseBoost}{\text{基础提升}}\%) \times \left(1 + \frac{6 \times \text{元素精通}}{\text{元素精通} + 2000} + \text{反应增伤}\%\right) \times \htmlData{term=resistanceDefense}{\text{抗性系数}} \times \text{暴击区} \times \text{擢升}`

const moonReactionFinalLatex = String.raw`\text{最终伤害} = \text{伤害最高角色} + \frac{1}{2}\text{第二高角色} + \frac{1}{12}\text{第三高角色} + \frac{1}{12}\text{第四高角色}`
</script>

<template>
  <article class="damage-formula">
    <h1 class="damage-formula__title">伤害公式</h1>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">常规伤害</h2>
      <FormulaBlock :latex="finalDamageLatex" :terms="terms" />
      <p class="damage-formula__note">注：</p>
      <p class="damage-formula__note">若攻击没有出现伤害数字，则本次伤害不会计算蒸发融化系数。</p>
    </section>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">抗性与防御</h2>
      <p class="damage-formula__caption">抗性通用公式：</p>
      <FormulaBlock :latex="resistanceLatex" />
      <p class="damage-formula__caption">角色攻击敌方时：</p>
      <FormulaBlock :latex="defenseAttackLatex" />
      <p class="damage-formula__caption">敌方攻击角色时：</p>
      <FormulaBlock :latex="defenseDefendLatex" />
      <p class="damage-formula__note">注：</p>
      <p class="damage-formula__note">来自角色的减防不能超过 90%，无视防御不能超过 100%。</p>
    </section>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">增幅反应</h2>
      <p class="damage-formula__note">增幅反应包括：蒸发、融化。</p>
      <FormulaBlock :latex="amplifyLatex" :terms="terms" />
    </section>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">剧变反应</h2>
      <p class="damage-formula__note">
        剧变反应包括：超载、超导、感电、燃烧、碎冰、扩散、绽放、超绽放、烈绽放。
      </p>
      <p class="damage-formula__note">
        剧变反应造成的伤害不受益于常规增伤/易伤/减伤，且无视防御力、不能暴击。
      </p>
      <FormulaBlock :latex="transformBaseLatex" :terms="terms" />
      <FormulaBlock :latex="transformFinalLatex" :terms="terms" />
      <p class="damage-formula__note">注：</p>
      <p class="damage-formula__note">触发剧变反应没有冷却，但剧变反应的伤害有冷却：</p>
      <ul class="damage-formula__list">
        <li>每 0.5s 最多 1 次：超载</li>
        <li>每 0.5s 最多 2 次：超导、碎冰、扩散、绽放、烈绽放、超绽放</li>
        <li>每 0.25s 1 次：燃烧</li>
      </ul>
      <p class="damage-formula__note">当敌人触发上述反应时，原本的 1446.85 的数值有变化：</p>
      <ul class="damage-formula__list">
        <li>90级：1202.81</li>
        <li>95级：1411.74</li>
        <li>100级：1674.81</li>
        <li>105级：1884.98</li>
        <li>110级：1963.85</li>
      </ul>
    </section>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">结晶反应</h2>
      <p class="damage-formula__note">
        触发结晶反应时，会掉落对应火/水/雷/冰元素的晶片，拾取后可获得护盾。
      </p>
      <p class="damage-formula__note">结晶护盾对其自身属性的伤害有 250% 的吸收效率。</p>
      <FormulaBlock :latex="crystallizeLatex" />
      <p class="damage-formula__note">注：</p>
      <p class="damage-formula__note">
        角色具有护盾时，护盾量还会受护盾强效影响，护盾强效取决于持有护盾的角色，而非创造晶片的角色。
      </p>
    </section>

    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">激化反应</h2>
      <p class="damage-formula__note">
        当雷元素触及草元素时，会按照 1 : 1 : 1 的比例互相消耗并生成原激化元素。
      </p>
      <p class="damage-formula__note">
        原激化元素可以发生绽放和燃烧反应，在这些反应中的表现和草元素相同。
      </p>
      <FormulaBlock :latex="aggravateDurationLatex" />
      <p class="damage-formula__note">雷和草不共存，但原激化和雷、原激化和草都可以共存。</p>
      <p class="damage-formula__note">
        当附着雷/草元素的攻击命中具有原激化的目标时，将分别引发超激化/蔓激化反应，不消耗任何元素，但为本次伤害贡献激化值（完整公式见「常规伤害」章节）。
      </p>
      <p class="damage-formula__caption">超激化/蔓激化伤害计算公式：</p>
      <FormulaBlock :latex="aggravateValueLatex" />
      <FormulaBlock :latex="spreadValueLatex" />
      <p class="damage-formula__note">注：</p>
      <p class="damage-formula__note">
        当敌人触发上述反应时，原本的 1446.85 的数值有变化：见「剧变反应」章节。
      </p>
    </section>
    <section class="damage-formula__section">
      <h2 class="damage-formula__heading">月曜反应</h2>
      <p class="damage-formula__caption">月曜反应直伤伤害计算公式：</p>
      <FormulaBlock :latex="moonDirectBaseLatex" :terms="terms" />
      <FormulaBlock :latex="moonDirectFinalLatex" :terms="terms" />
      <p class="damage-formula__caption">月曜反应反应伤害计算公式：</p>
      <FormulaBlock :latex="moonReactionLatex" :terms="terms" />
      <FormulaBlock :latex="moonReactionFinalLatex" :terms="terms" />
      <div class="damage-formula__notes">
        <p class="damage-formula__note">注：</p>
        <p class="damage-formula__note damage-formula__note--title">反应月感电：</p>
        <p class="damage-formula__note">
          特定情况下，雷元素触及水元素时，会生成一片不可移动的雷暴云，持续6秒。触发月感电时，若附近已有雷暴云，则会刷新持续时间。
        </p>
        <p class="damage-formula__note">
          雷暴云每2秒攻击一次附近所有同时具有雷和水元素的目标，并消耗0.4元素量的雷和水元素。
        </p>
        <p class="damage-formula__note">
          造成反应月感电伤害时，所有参与反应的角色都会提供伤害值，但除伤害最高的角色外，其余角色提供的伤害值会降低。
        </p>
        <p class="damage-formula__note">
          该伤害可以暴击（取决于每个角色自己的暴击率和暴击伤害），若原本伤害最高的角色没有暴击，则有可能另一名暴击的角色成为伤害值最高。
        </p>
        <p class="damage-formula__note">
          角色自身的暴击率仅用于计算该角色在一次反应月感电伤害之中提供的伤害值，只要本次反应月感电伤害成功暴击，则视为所有参与本次反应月感电的角色全部暴击（用于触发西风效果等）。
        </p>
        <p class="damage-formula__note damage-formula__note--title">反应月结晶：</p>
        <p class="damage-formula__note">
          特定情况下，岩元素触及水元素时，会产生三枚月笼。每触发三次月结晶反应，会触发一次月笼协奏，三枚月笼各造成一次月结晶伤害。
        </p>
        <p class="damage-formula__note">
          该伤害视为反应月结晶伤害，伤害结算方式与反应月感电伤害相同。
        </p>
        <p class="damage-formula__note damage-formula__note--title">反应月绽放：</p>
        <p class="damage-formula__note">
          特定情况下，草元素触及水元素时，会产生草原核，并为队伍提供「草露」，可被特定角色消耗。
        </p>
        <p class="damage-formula__note">
          这种情况下产生的草原核伤害不算做月绽放伤害，月绽放伤害只包括直伤伤害，没有反应伤害。
        </p>
      </div>
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

.damage-formula__section + .damage-formula__section {
  padding-top: $space-5;
  border-top: 1px solid $color-border;
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

.damage-formula__notes {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.damage-formula__note--title {
  margin-top: $space-4;
  color: $color-text-primary;
}

.damage-formula__list {
  margin: 0;
  padding-left: $space-5;
  color: $color-text-secondary;
  line-height: 1.7;
}

.damage-formula__list li + li {
  margin-top: $space-1;
}
</style>
