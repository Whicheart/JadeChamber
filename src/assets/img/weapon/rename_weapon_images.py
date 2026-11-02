#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按对照表重命名 img/weapon 下各系列文件夹中的武器图像资源。

用法:
    python rename_weapon_images.py            # 直接执行
    python rename_weapon_images.py --dry-run  # 只打印将要做什么, 不改动文件

对照表 (严格匹配文件名主干, 扩展名保持不变):
    UI_Gacha_EquipIcon_<type>_<enName> -> UI_EquipIcon_<type>_<enName>_Gacha

不在对照表里的文件 (UI_EquipIcon_<type>_<enName>、
UI_EquipIcon_<type>_<enName>_Awaken 等) 一律不动。
重复执行是安全的: 已改过名的文件不再匹配上述前缀。
目标文件已存在时跳过并告警, 不会覆盖。
"""

import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))

# 视为图像资源的扩展名
IMAGE_EXT = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".avif", ".ico"}

# 原前缀 -> 新前缀, 新名字末尾追加的后缀
OLD_PREFIX = "UI_Gacha_EquipIcon_"
NEW_PREFIX = "UI_EquipIcon_"
SUFFIX = "_Gacha"

DRY_RUN = "--dry-run" in sys.argv[1:]

stats = {
    "dirs": 0,
    "renamed": 0,
    "untouched": 0,
    "conflicts": [],
    "errors": [],
}


def log(msg):
    print(("[dry-run] " if DRY_RUN else "") + msg)


def is_image(name):
    return os.path.splitext(name)[1].lower() in IMAGE_EXT


def build_new_stem(stem):
    """UI_Gacha_EquipIcon_<type>_<enName> -> UI_EquipIcon_<type>_<enName>_Gacha"""
    if not stem.startswith(OLD_PREFIX):
        return None
    rest = stem[len(OLD_PREFIX):]
    # <type>_<enName> 至少要有 type 与 enName 两段
    if "_" not in rest:
        return None
    return NEW_PREFIX + rest + SUFFIX


def series_dirs():
    return [
        entry
        for entry in sorted(os.listdir(BASE))
        if os.path.isdir(os.path.join(BASE, entry)) and not entry.startswith("__")
    ]


def rename_in(folder):
    root = os.path.join(BASE, folder)
    for fn in sorted(os.listdir(root)):
        path = os.path.join(root, fn)
        if not os.path.isfile(path) or not is_image(fn):
            continue

        stem, ext = os.path.splitext(fn)
        new_stem = build_new_stem(stem)
        if new_stem is None:
            stats["untouched"] += 1
            continue

        new_name = new_stem + ext
        dst = os.path.join(root, new_name)
        if new_name == fn:
            stats["untouched"] += 1
            continue
        if os.path.exists(dst):
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
    folders = series_dirs()
    stats["dirs"] = len(folders)
    for folder in folders:
        rename_in(folder)

    print("\n===== 统计 =====")
    print("扫描文件夹: %d" % stats["dirs"])
    print("重命名图像: %d" % stats["renamed"])
    print("未匹配对照表(保持原样): %d" % stats["untouched"])
    if stats["conflicts"]:
        print("同名冲突跳过: %d" % len(stats["conflicts"]))
    if stats["errors"]:
        print("出错: %d" % len(stats["errors"]))
        for folder, fn, msg in stats["errors"][:10]:
            print("  %s/%s: %s" % (folder, fn, msg))
    return 1 if stats["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
