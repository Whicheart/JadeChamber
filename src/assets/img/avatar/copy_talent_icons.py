#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""根据数据库里的命座描述, 为每个角色生成三命 / 五命的技能图标。

用法:
    python copy_talent_icons.py            # 直接执行
    python copy_talent_icons.py --dry-run  # 只打印结果, 不复制文件

流程:
    1. 连本后端使用的 MongoDB (mongodb://localhost:27017/GI);
    2. avatar (角色) --skillDepotId--> avatar_skill_depot.talents[2] / [4]
       --id--> avatar_talent.descTextMapHash --hash--> text_map_chs_medium.text
       得到三命 / 五命的命座描述 (形如 "XXX的技能等级提高3级。");
    3. 从描述里取出被提升的技能名, 与角色的
       元素战技名 (avatar_skill_depot.skills[1]) 和
       元素爆发名 (avatar_skill_depot.energySkill) 比对, 判定生效技能;
    4. 遍历 img/avatar 下纯英文名的角色文件夹, 把
       UI_AvatarIcon_<文件夹名>_Constellation_3 / _5 各复制一份, 命名为
       UI_AvatarIcon_<文件夹名>_Talent_ElementSkill 或 _Talent_ElementBurst。

命座提升的既不是元素战技也不是元素爆发时 (例如提升「普通攻击·XXX」), 跳过该命座。
"""

import json
import os
import re
import shutil
import sys

from pymongo import MongoClient

BASE = os.path.dirname(os.path.abspath(__file__))
MAP_FILE = os.path.join(BASE, "avatarNameMap.json")
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "GI"

DRY_RUN = "--dry-run" in sys.argv

SKILL = "ElementSkill"
BURST = "ElementBurst"

# 命座描述里可能出现的技能类型前缀
TYPE_PREFIX = {"元素战技": SKILL, "元素爆发": BURST, "普通攻击": None}

stats = {
    "folders": 0,
    "copied": 0,
    "skipped": [],
    "missing": [],
    "rows": [],
}


def log(msg):
    print(("[dry-run] " if DRY_RUN else "") + msg)


def strip_markup(text):
    """去掉 <color=...> 标签、{LINK#...} 占位符和字面 \\n。"""
    text = re.sub(r"<[^>]*>", "", text)
    text = re.sub(r"\{[^}]*\}", "", text)
    return text.replace("\\n", " ")


def parse_level_up(desc):
    """解析 "元素战技XXX的技能等级提高3级" 这类句子。

    返回 (技能名, 类型提示) ; 类型提示为 SKILL / BURST / None(普通攻击或未标注)。
    """
    if not desc:
        return None, None
    cleaned = strip_markup(desc)
    for seg in re.split(r"[。\n]", cleaned):
        m = re.search(r"(.+?)的技能等级(?:提高|提升)\d+级", seg)
        if not m:
            continue
        target = m.group(1).strip()
        hint = "unmarked"
        for prefix, kind in TYPE_PREFIX.items():
            if target.startswith(prefix):
                target = target[len(prefix):].strip(" ·「」")
                hint = kind if kind else "normal"
                break
        return target.strip("「」 "), hint
    return None, None


def load_name_map():
    with open(MAP_FILE, encoding="utf-8") as f:
        return json.load(f)  # {中文名: 英文名}


def main():
    name_map = load_name_map()
    en_to_cn = {en: cn for cn, en in name_map.items()}

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    tm = {str(d["_id"]): d["text"] for d in db["text_map_chs_medium"].find({}, {"text": 1})}
    depots = {d["_id"]: d for d in db["avatar_skill_depot"].find({})}
    talents = {t["_id"]: t for t in db["avatar_talent"].find({})}
    skills = {s["_id"]: s for s in db["avatar_skill"].find({})}

    def skill_name(sid):
        s = skills.get(sid)
        return tm.get(str(s.get("nameTextMapHash"))) if s else None

    avatar_by_cn = {}
    for av in db["avatar"].find({}):
        cn = tm.get(str(av.get("nameTextMapHash")))
        if cn and cn not in avatar_by_cn:
            avatar_by_cn[cn] = av

    folders = sorted(
        entry
        for entry in os.listdir(BASE)
        if os.path.isdir(os.path.join(BASE, entry)) and re.fullmatch(r"[A-Za-z0-9_\-]+", entry)
    )
    stats["folders"] = len(folders)

    for folder in folders:
        cn = en_to_cn.get(folder)
        av = avatar_by_cn.get(cn) if cn else None
        if not av:
            stats["missing"].append((folder, "角色 %s" % cn))
            log("跳过 %s: 数据库里找不到角色 (中文名 %s)" % (folder, cn))
            continue

        depot = depots.get(av.get("skillDepotId"))
        talent_ids = (depot or {}).get("talents") or []
        if not depot or len(talent_ids) < 6:
            stats["missing"].append((folder, "skillDepot"))
            log("跳过 %s: 命座数据不完整 (depot %s)" % (folder, av.get("skillDepotId")))
            continue

        sk = depot.get("skills") or []
        elem_skill = skill_name(sk[1]) if len(sk) > 1 and sk[1] else None
        burst = skill_name(depot.get("energySkill"))

        # depot.talents 按命座 1~6 排列, 下标 2 / 4 即三命 / 五命
        for level, idx in ((3, 2), (5, 4)):
            talent = talents.get(talent_ids[idx])
            desc = tm.get(str(talent.get("descTextMapHash")), "") if talent else ""
            target, hint = parse_level_up(desc)

            if target is None:
                stats["skipped"].append((folder, level, "无「技能等级提高」描述", desc[:40]))
                log("跳过 %s C%d: 描述里没有技能等级提升" % (folder, level))
                continue

            if target == burst:
                kind = BURST
            elif target == elem_skill:
                kind = SKILL
            elif hint in (SKILL, BURST):
                kind = hint
            else:
                stats["skipped"].append((folder, level, "提升的是「%s」" % target, "非元素战技/爆发"))
                log("跳过 %s C%d: 提升的是「%s」, 不是元素战技/元素爆发" % (folder, level, target))
                continue

            src = os.path.join(BASE, folder, "UI_AvatarIcon_%s_Constellation_%d.webp" % (folder, level))
            if not os.path.isfile(src):
                stats["missing"].append((folder, "C%d 图标" % level))
                log("跳过 %s C%d: 找不到图标 %s" % (folder, level, os.path.basename(src)))
                continue

            dst = os.path.join(BASE, folder, "UI_AvatarIcon_%s_Talent_%s.webp" % (folder, kind))
            log("%s C%d: 「%s」 -> %s" % (folder, level, target, os.path.basename(dst)))
            if not DRY_RUN:
                shutil.copy2(src, dst)
            stats["copied"] += 1
            stats["rows"].append((folder, level, kind, target))

    print("\n===== 统计 =====")
    print("扫描英文角色文件夹: %d" % stats["folders"])
    print("生成图标: %d" % stats["copied"])
    print("跳过(提升的不是元素战技/爆发): %d" % len(stats["skipped"]))
    for item in stats["skipped"]:
        print("   ", item)
    print("跳过(数据/文件缺失): %d" % len(stats["missing"]))
    for item in stats["missing"]:
        print("   ", item)

    both = sorted({r[0] for r in stats["rows"] if r[1] == 3} & {r[0] for r in stats["rows"] if r[1] == 5})
    print("\n同时有两个图标的角色: %d" % len(both))
    print("ElementSkill 图标: %d, ElementBurst 图标: %d"
          % (sum(1 for r in stats["rows"] if r[2] == SKILL), sum(1 for r in stats["rows"] if r[2] == BURST)))


if __name__ == "__main__":
    main()
