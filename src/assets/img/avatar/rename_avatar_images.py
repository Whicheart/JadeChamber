#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按对照表重命名 img/avatar 下各角色文件夹中的图像资源。

用法:
    python rename_avatar_images.py            # 直接执行
    python rename_avatar_images.py --dry-run  # 只打印将要做什么, 不改动文件

对照表 (严格匹配文件名主干, 扩展名保持不变):
    gacha            -> UI_AvatarIcon_<文件夹名>_Gacha
    splash[<数字>]   -> UI_AvatarIcon_<文件夹名>_Splash[_<数字>]
    face[<数字>]     -> UI_AvatarIcon_<文件夹名>_Forward[_<数字>]
    side[<数字>]     -> UI_AvatarIcon_<文件夹名>_Side[_<数字>]
    cons-<数字>      -> UI_AvatarIcon_<文件夹名>_Constellation_<数字>
    passive-<数字>   -> UI_AvatarIcon_<文件夹名>_Passive_<数字+1>
    talent-[aeq]     -> UI_AvatarIcon_<文件夹名>_Talent_[NormalAttack/ElementSkill/ElementBurst]
                        (a -> NormalAttack, e -> ElementSkill, q -> ElementBurst)

不在对照表里的文件 (banner / card / face-q / 已重命名过的文件等) 一律不动。
重复执行是安全的: 已改过名的文件不会再匹配到上述格式。

特例: talent-a/e/q 若目标文件已存在, 直接删除原文件 (保留已重命名的那份);
其他映射遇到同名目标仍然跳过并告警, 不会覆盖。
"""

import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))

# 不是角色文件夹的目录, 遍历时跳过
EXCLUDE_DIRS = {"miao-plugin-master"}

# 视为图像资源的扩展名
IMAGE_EXT = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".avif", ".ico"}

DRY_RUN = "--dry-run" in sys.argv

stats = {
    "dirs": 0,
    "renamed": 0,
    "untouched": 0,
    "removed_duplicate": 0,
    "conflicts": [],
    "errors": [],
}


def log(msg):
    print(("[dry-run] " if DRY_RUN else "") + msg)


def is_image(name):
    return os.path.splitext(name)[1].lower() in IMAGE_EXT


def build_new_stem(stem, folder):
    """把文件名主干按对照表映射成新名字; 不匹配则返回 None。"""
    prefix = "UI_AvatarIcon_%s_" % folder

    if stem == "gacha":
        return prefix + "Gacha"

    m = re.fullmatch(r"splash(\d*)", stem)
    if m:
        return prefix + "Splash" + ("_%s" % m.group(1) if m.group(1) else "")

    m = re.fullmatch(r"face(\d*)", stem)
    if m:
        return prefix + "Forward" + ("_%s" % m.group(1) if m.group(1) else "")

    m = re.fullmatch(r"side(\d*)", stem)
    if m:
        return prefix + "Side" + ("_%s" % m.group(1) if m.group(1) else "")

    m = re.fullmatch(r"cons-(\d+)", stem)
    if m:
        return prefix + "Constellation_%s" % m.group(1)

    m = re.fullmatch(r"passive-(\d+)", stem)
    if m:
        return prefix + "Passive_%d" % (int(m.group(1)) + 1)

    m = re.fullmatch(r"talent-([aeq])", stem)
    if m:
        suffix = {"a": "NormalAttack", "e": "ElementSkill", "q": "ElementBurst"}[m.group(1)]
        return prefix + "Talent_" + suffix

    return None


def character_dirs():
    result = []
    for entry in sorted(os.listdir(BASE)):
        path = os.path.join(BASE, entry)
        if not os.path.isdir(path):
            continue
        if entry in EXCLUDE_DIRS:
            continue
        result.append(entry)
    return result


def rename_in(folder):
    root = os.path.join(BASE, folder)
    for fn in sorted(os.listdir(root)):
        path = os.path.join(root, fn)
        if not os.path.isfile(path) or not is_image(fn):
            continue

        stem, ext = os.path.splitext(fn)
        new_stem = build_new_stem(stem, folder)
        if new_stem is None:
            stats["untouched"] += 1
            continue

        new_name = new_stem + ext
        dst = os.path.join(root, new_name)
        if new_name == fn:
            stats["untouched"] += 1
            continue
        if os.path.exists(dst):
            # talent-a/e/q: 目标文件已存在时, 直接删除原文件
            if re.fullmatch(r"talent-[aeq]", stem):
                log("目标已存在, 删除原文件: %s/%s (保留 %s)" % (folder, fn, new_name))
                try:
                    if not DRY_RUN:
                        os.remove(path)
                except OSError as exc:
                    stats["errors"].append((folder, fn, str(exc)))
                    log("失败: %s/%s: %s" % (folder, fn, exc))
                    continue
                stats["removed_duplicate"] += 1
                continue

            stats["conflicts"].append((folder, fn, new_name))
            log("冲突(目标已存在, 跳过): %s/%s -> %s" % (folder, fn, new_name))
            continue

        log("%s: %s -> %s" % (folder, fn, new_name))
        try:
            if not DRY_RUN:
                os.rename(path, dst)
        except OSError as exc:
            stats["errors"].append((folder, fn, str(exc)))
            log("失败: %s/%s: %s" % (folder, fn, exc))
            continue
        stats["renamed"] += 1


def main():
    folders = character_dirs()
    stats["dirs"] = len(folders)
    for folder in folders:
        rename_in(folder)

    print("\n===== 统计 =====")
    print("扫描角色文件夹: %d" % stats["dirs"])
    print("重命名图像: %d" % stats["renamed"])
    print("未匹配对照表(保持原样): %d" % stats["untouched"])
    print("删除重复原文件(talent-*): %d" % stats["removed_duplicate"])
    if stats["conflicts"]:
        print("同名冲突跳过: %d" % len(stats["conflicts"]))
    if stats["errors"]:
        print("出错: %d" % len(stats["errors"]))
        for folder, fn, msg in stats["errors"][:10]:
            print("  %s/%s: %s" % (folder, fn, msg))


if __name__ == "__main__":
    main()
