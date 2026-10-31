// 潜力计算的纯逻辑部分，和组件解耦，方便用 node --test 直接跑

// 每次模拟固定五次升级机会
export const UPGRADE_TIMES = 5

export const DEFAULT_SIMULATE_TIMES = 2000
export const MIN_SIMULATE_TIMES = 1
export const MAX_SIMULATE_TIMES = 1000000

// 分片计算的每批次数：100 万次拆成多批，批与批之间让出主线程，页面才不会假死
export const SIMULATE_CHUNK_SIZE = 20000

export const CRIT_RATE_PROP = 'FIGHT_PROP_CRITICAL'
export const CRIT_DAMAGE_PROP = 'FIGHT_PROP_CRITICAL_HURT'

// 从 /api/reliquary/prop-rank 的 rankLevels 里取对应星级的一档
export function rankRuleOf(rankLevels, rankLevel) {
  return (rankLevels || []).find((rule) => Number(rule?.rankLevel) === Number(rankLevel)) ?? null
}

// 副词条 → 升级档位列表；顺手丢掉 0 之类的占位档位
export function appendTiersOf(rankRule) {
  const tiers = {}

  for (const prop of rankRule?.appendProps ?? []) {
    const values = (prop?.values ?? [])
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0)

    if (values.length) tiers[prop.propType] = values
  }

  return tiers
}

// 主词条满级值：values 的最后一项就是满级（1★ 到 Lv.15，其余到 Lv.20）
export function maxMainValue(rankRule, propName) {
  const prop = (rankRule?.mainProps ?? []).find((item) => item.propType === propName)
  const values = (prop?.values ?? []).map(Number).filter(Number.isFinite)

  return values.length ? values[values.length - 1] : 0
}

// 分数口径：暴击率 ×2 + 暴击伤害，按界面上的百分数算，10% → 10
export function scoreOf(appendProps) {
  const valueOf = (propName) =>
    Number((appendProps || []).find((prop) => prop?.propName === propName)?.propValue) || 0

  return valueOf(CRIT_RATE_PROP) * 100 * 2 + valueOf(CRIT_DAMAGE_PROP) * 100
}

// 一次模拟：五次升级机会，每次均等抽一条副词条、再均等抽该词条的一个档位加上去
export function simulateOnce(appendProps, tiersByProp, random = Math.random) {
  const props = appendProps || []
  const values = props.map((prop) => Number(prop?.propValue) || 0)

  if (!props.length) return { values: [], score: 0 }

  for (let i = 0; i < UPGRADE_TIMES; i += 1) {
    const index = Math.floor(random() * props.length) % props.length
    const tiers = tiersByProp?.[props[index].propName] ?? []

    if (!tiers.length) continue

    values[index] += tiers[Math.floor(random() * tiers.length) % tiers.length]
  }

  const score = scoreOf(
    props.map((prop, index) => ({ propName: prop.propName, propValue: values[index] })),
  )

  return { values, score }
}

// 累加器：只按分数档位累计次数，不留每一次的明细。
// 100 万次模拟若逐个留样本要占几百 MB，这里的内存只跟「不同分数档位数」有关。
export function createAccumulator(digits = 2) {
  const buckets = new Map()

  let times = 0
  let sum = 0
  let best = -Infinity
  let worst = Infinity

  function add(values, score) {
    times += 1
    sum += score
    if (score > best) best = score
    if (score < worst) worst = score

    // 升级档位是小数，0.1 + 0.2 这类误差会把同一个分数拆成好几档，先按位归并
    const key = Number(Number(score).toFixed(digits))
    const bucket = buckets.get(key)

    if (bucket) bucket.count += 1
    else buckets.set(key, { score: key, count: 1, values })
  }

  // points 按分数升序；mode 是出现次数最多的那一档（并列时取分数较低的）
  function finish() {
    const points = [...buckets.values()].sort((a, b) => a.score - b.score)

    let mode = null

    for (const point of points) {
      if (!mode || point.count > mode.count) mode = point
    }

    return {
      times,
      average: times ? sum / times : 0,
      best: times ? best : 0,
      worst: times ? worst : 0,
      points,
      mode,
    }
  }

  return { add, finish }
}

// 跑一批模拟并累加进 accumulator，返回同一个 accumulator 方便链式接
export function simulateBatch(times, appendProps, tiersByProp, accumulator, random = Math.random) {
  const total = Math.max(Math.floor(Number(times) || 0), 0)

  for (let i = 0; i < total; i += 1) {
    const { values, score } = simulateOnce(appendProps, tiersByProp, random)

    accumulator.add(values, score)
  }

  return accumulator
}

// 一次性跑完直接给结果（同步版，测试与小次数用）
export function simulateDistribution(times, appendProps, tiersByProp, random = Math.random) {
  const accumulator = createAccumulator()

  simulateBatch(times, appendProps, tiersByProp, accumulator, random)

  return accumulator.finish()
}

// 输入框的钳制：空值/非数字按最小值，超出范围截到边界
export function clampSimulateTimes(value) {
  const num = Math.round(Number(value))

  if (!Number.isFinite(num)) return MIN_SIMULATE_TIMES

  return Math.min(Math.max(num, MIN_SIMULATE_TIMES), MAX_SIMULATE_TIMES)
}
