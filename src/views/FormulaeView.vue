<script setup>
import { onMounted } from 'vue'
import renderMathInElement from 'katex/dist/contrib/auto-render'
import 'katex/dist/katex.min.css'

onMounted(() => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  })
})
</script>

<template>
  <div id="body">
    <div class="abc">
      <div class="title">防御力 抗性</div>
      <div class="contant">
        <p>抗性通用公式：</p>
        $$抗性系数 = \begin{cases} 1 - \frac{抗性}{2} & \text{抗性} \leq 0 \\ 1 - 抗性 & 0 \leq
        \text{抗性} \leq 75\% \\ \frac{1}{4 \times 抗性 + 1} & 75\% \leq \text{抗性} \end{cases}$$
        <p>角色攻击敌人时的防御系数</p>
        $$防御系数 = \frac{角色等级 + 100}{(角色等级 + 100) + (敌人等级 + 100) \times (1 - 减防)
        \times (1 - 无视防御)}$$
        <p>来自角色的减防不能超过90%，无视防御不能超过100%</p>
        <p>敌人攻击角色时的防御系数</p>
        $$防御系数 = \frac{5 \times 敌人等级 + 500}{5 \times 敌人等级 + 500 + 角色防御}$$
      </div>
    </div>
    <div class="abc">
      <div class="title">常规伤害</div>
      <div class="contant">
        <p>角色造成的常规伤害：</p>
        $$最终伤害 = (基础值 + 激化值 + 基础值加成) \times (1 + 增伤\% + 易伤\% - 减伤\%) \times
        抗性系数 \times 防御系数 \times 暴击区 \times 蒸发融化系数$$
        <p>注：若攻击没有出现伤害数字（例如命中护盾等），则本次伤害不会计算蒸发融化系数</p>
        <p>基础值：$角色模板（如攻击力、生命值、防御力、元素精通） \times 技能倍率$</p>
        <p>基础值加成：描述中带有【造成的伤害提高X】的效果</p>
        <p>增伤：描述中带有【我方造成的伤害提升X%】的效果</p>
        <p>易伤：描述中带有【目标受到的伤害提升X%】的效果</p>
        <p>减伤：描述中带有【目标受到的伤害降低X%】的效果</p>
        <p>激化值：见【激化反应】章节</p>
        <p>蒸发融化系数：见【增幅反应】章节</p>
      </div>
    </div>
    <div class="abc">
      <div class="title">月反应</div>
      <div class="contant">
        <p>月反应伤害无视敌方防御力</p>
        <p>月反应直伤伤害计算公式：</p>
        $$直伤基础 = 直伤基础倍率 \times 基础值 \times (1 + 基础提升\%) \times (1 + \frac{6 \times
        元素精通}{元素精通 + 2000} + 反应增伤\%)$$ $$最终直伤 = (直伤基础 + 额外提升) \times
        抗性系数 \times 暴击区 \times 擢升$$
        <p>直伤基础倍率：</p>
        <p>- 月感电 3</p>
        <p>- 月结晶 1.6</p>
        <p>- 月绽放 1</p>
        <p>基础提升：如角色天赋14%</p>
        <p>额外提升：如兹白天赋「太阴降」效果</p>
        <p>月反应反应伤害计算公式：</p>
        $$反应伤害 = 1446.85 \times 反应基础倍率 \times (1 + 基础提升\%) \times (1 + \frac{6 \times
        元素精通}{元素精通 + 2000} + 反应增伤\%) \times 抗性系数 \times 暴击区 \times 擢升$$
        $$最终伤害 = 伤害最高角色 + \frac{1}{2}第二高角色 + \frac{1}{12}第三高角色 +
        \frac{1}{12}第四高角色$$
        <p>反应基础倍率：</p>
        <p>- 月感电 1.8</p>
        <p>- 月结晶 0.96</p>
        <p>
          反应月感电：特定情况下，雷元素触及水元素时，会生成一片不可移动的雷暴云，持续6秒。雷暴云每2秒攻击一次附近所有同时具有雷和水元素的目标，并消耗0.4元素量的雷和水元素。触发月感电时，若附近已有雷暴云，则会刷新持续时间。造成反应月感电伤害时，所有参与反应的角色都会提供伤害值，但除伤害最高的角色外，其余角色提供的伤害值会降低。该伤害可以暴击（取决于每个角色自己的暴击率和暴击伤害），若原本伤害最高的角色没有暴击，则有可能另一名暴击的角色成为伤害值最高
        </p>
        <p>
          反应月结晶：特定情况下，岩元素触及水元素时，会产生三枚月笼。每触发三次月结晶反应，会触发一次月笼协奏，三枚月笼各造成一次月结晶伤害。该伤害视为反应月结晶伤害，伤害结算方式与反应月感电伤害相同
        </p>
        <p>
          反应月绽放：特定情况下，草元素触及水元素时，会产生草原核，并为队伍提供「草露」，可被特定角色消耗。这种情况下产生的草原核伤害不算做月绽放伤害，月绽放伤害只包括直伤伤害，没有反应伤害
        </p>
      </div>
    </div>
    <div class="abc">
      <div class="title">激化反应</div>
      <div class="contant">
        <p>当雷元素触及草元素时，会按照$1 : 1 : 1$的比例互相消耗并生成原激化元素</p>
        <p>原激化元素可以发生绽放和燃烧反应，在这些反应中的表现和草元素相同</p>
        <p>原激化元素的持续时间：$(6 + 5 \times 元素量)$秒</p>
        <p>雷和草不共存，但原激化和雷、原激化和草都可以共存</p>
        <p>
          当附着雷/草元素的攻击命中具有原激化的目标时，将分别引发超激化/蔓激化反应，不消耗任何元素，但为本次伤害贡献激化值（完整公式见【常规伤害】章节）
        </p>
        <p>超激化/蔓激化伤害计算公式：</p>
        $$超激化值 = 1446.85 \times 1.15 \times (1 + \frac{5 \times 元素精通}{元素精通 + 1200} +
        超激化提高\%)$$ $$蔓激化值 = 1446.85 \times 1.25 \times (1 + \frac{5 \times
        元素精通}{元素精通 + 1200} + 蔓激化提高\%)$$
        <p>当敌人触发上述反应时，原本的 1446.85 的数值有变化：见【剧变反应】章节</p>
      </div>
    </div>
    <div class="abc">
      <div class="title">剧变反应</div>
      <div class="contant">
        <p>剧变反应包括：超载、超导、感电、燃烧、碎冰、扩散、绽放、超绽放、烈绽放</p>
        <p>剧变反应造成的伤害不受益于常规增伤/易伤/减伤，且无视防御力、不能暴击</p>
        $$剧变基础 = 1446.85 \times 反应倍率 \times (1 + \frac{16 \times 元素精通}{元素精通 + 2000}
        + 反应增伤\%)$$ $$最终伤害 = (剧变基础 + 额外提升) \times 抗性系数$$
        <p>额外提升：梦见月瑞希1命、菈乌玛元素爆发（不受益于精通增伤、反应增伤）</p>
        <p>反应倍率：</p>
        <p>- 燃烧 0.25（每 0.25s 一次）</p>
        <p>- 扩散 0.6</p>
        <p>- 超导 1.5</p>
        <p>- 感电 2</p>
        <p>- 超载 2.75</p>
        <p>- 碎冰 3</p>
        <p>- 绽放 2</p>
        <p>- 烈绽放 超绽放 3</p>
        <p>触发剧变反应没有冷却，但剧变反应的伤害有冷却：</p>
        <p>- 每 0.5s 最多 1 次：超载</p>
        <p>- 每 0.5s 最多 2 次：超导、碎冰、扩散、绽放、烈绽放、超绽放</p>
        <p>当敌人触发上述反应时，原本的 1446.85 的数值有变化：</p>
        <p>- 90级：1202.81</p>
        <p>- 95级：1411.74</p>
        <p>- 100级：1674.81</p>
        <p>- 105级：1884.98</p>
        <p>- 110级：1963.85</p>
      </div>
    </div>
    <div class="abc">
      <div class="title">增幅反应</div>
      <div class="contant">
        <p>增幅反应包括：蒸发、融化</p>
        <p>触发增幅反应时，会为本次伤害附加蒸发融化系数（完整公式见【常规伤害】章节）</p>
        <p>若攻击没有出现伤害数字（例如命中护盾），则本次伤害不会计算蒸发融化系数</p>
        $$蒸发融化系数 = 基础系数 \times (1 + \frac{2.78 \times 元素精通}{元素精通 + 1400} +
        反应增伤\%)$$
        <p>基础系数：</p>
        <p>- $水 \to \text{火 蒸发 2.0}$</p>
        <p>- $火 \to \text{水 蒸发 1.5}$</p>
        <p>- $火 \to \text{冰 融化 2.0}$</p>
        <p>- $冰 \to \text{火 融化 1.5}$</p>
      </div>
    </div>
    <div class="abc">
      <div class="title">结晶反应</div>
      <div class="contant">
        <p>触发结晶反应时，会掉落对应火/水/雷/冰元素的晶片，拾取后可获得护盾</p>
        <p>结晶护盾对其自身属性的伤害有 250% 的吸收效率</p>
        $$结晶盾量 = 1851.06 \times (1 + \frac{4.44 \times 元素精通}{元素精通 + 1400})$$
        <p>
          角色具有护盾时，护盾量还会受护盾强效影响，护盾强效取决于持有护盾的角色，而非创造晶片的角色
        </p>
      </div>
    </div>
    <div class="end"></div>
  </div>
</template>

<style scoped>
* {
  font-family: '微软雅黑';
}
#body {
  width: 100vw;
  height: auto;
  min-width: 800px;
  min-height: 650px;
  margin-top: 70px;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  color: white;
}
.abc {
  width: 80%;
  height: auto;
  border: solid 1px rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 30px 50px 30px 50px;
  margin-top: 30px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  width: 100%;
  text-align: center;
}
.contant {
  font-size: 20px;
}
.end {
  width: 100%;
  height: 50vh;
}
</style>
