#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""整理 img/avatar 下的角色素材。

用法:
    python build_avatar_assets.py            # 直接执行
    python build_avatar_assets.py --dry-run  # 只打印将要做什么, 不改动文件

执行顺序:
    1. 把 miao-plugin-master/resources/meta-gs/character/ 下的角色子文件夹
       整体移动到 img/avatar/, 并按 avatarNameMap.json (中文名 -> 英文名) 重命名;
    2. 逐个角色文件夹删除非图像资源 (data.json / calc.js / artis.js 等);
    3. 把子文件夹中的图像移动到角色文件夹根目录, 然后删除空文件夹;
    4. 确认 miao-plugin-master 已空, 清掉空目录并整体删除。

特殊名单 (荧 / 奇偶·男性 / 奇偶·女性 / 旅行者 / 空) 同样会被提取到 img/avatar/,
并删除其中的非图像资源; 但它们保留原有的元素级子目录结构, 不做扁平化处理
(扁平化会让 旅行者 的 anemo/cryo/... 下的同名图像互相冲突)。
"""

import json
import os
import shutil
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC_ROOT = os.path.join(BASE, "miao-plugin-master")
SRC = os.path.join(SRC_ROOT, "resources", "meta-gs", "character")
MAP_FILE = os.path.join(BASE, "avatarNameMap.json")

# 这些文件夹同样提取, 但保留子目录结构, 不做扁平化
NESTED = {"荧", "奇偶·男性", "奇偶·女性", "旅行者", "空"}

# 视为"图像资源"的扩展名, 其余一律算非图像资源
IMAGE_EXT = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".avif", ".ico"}

DRY_RUN = "--dry-run" in sys.argv

stats = {
    "moved": 0,
    "renamed": 0,
    "unmapped": [],
    "nested": [],
    "non_image": 0,
    "flattened": 0,
    "renamed_on_conflict": [],
    "removed_dirs": 0,
    "source_removed": False,
}


def is_image(name):
    return os.path.splitext(name)[1].lower() in IMAGE_EXT


def log(msg):
    print(("[dry-run] " if DRY_RUN else "") + msg)


def load_name_map():
    with open(MAP_FILE, encoding="utf-8") as f:
        # {中文名: 英文名}
        return json.load(f)


def ensure_parent(path):
    parent = os.path.dirname(path)
    if parent and not os.path.isdir(parent):
        os.makedirs(parent)


# --------------------------------------------------------------------------
# 步骤 1: 提取角色文件夹并按对照表重命名
# --------------------------------------------------------------------------
def step1_extract(name_map):
    if not os.path.isdir(SRC):
        sys.exit("找不到源目录: %s" % SRC)

    moved_dirs = []
    for entry in sorted(os.listdir(SRC)):
        src_path = os.path.join(SRC, entry)
        if not os.path.isdir(src_path):
            continue

        target_name = name_map.get(entry)
        if target_name:
            stats["renamed"] += 1
        else:
            # 对照表里没有, 保留原文件夹名, 只做后续清理
            stats["unmapped"].append(entry)
            target_name = entry
            log("警告: 对照表中没有 '%s', 保留原名" % entry)

        dst_path = os.path.join(BASE, target_name)
        if os.path.exists(dst_path):
            log("错误: 目标已存在, 跳过 '%s' -> '%s'" % (entry, target_name))
            continue

        log("提取: %s -> %s" % (entry, target_name))
        if not DRY_RUN:
            shutil.move(src_path, dst_path)
        stats["moved"] += 1
        # dry-run 时文件夹还没真正搬过去, 后续步骤继续在源路径上模拟
        moved_dirs.append((target_name, dst_path if not DRY_RUN else src_path))

    return moved_dirs


# --------------------------------------------------------------------------
# 步骤 2: 删除角色文件夹中的非图像资源
# --------------------------------------------------------------------------
def step2_remove_non_images(character_dirs):
    for _name, root in character_dirs:
        if not os.path.isdir(root):
            continue
        for dirpath, _dirnames, filenames in os.walk(root):
            for fn in filenames:
                if is_image(fn):
                    continue
                path = os.path.join(dirpath, fn)
                log("删除非图像: %s" % os.path.relpath(path, BASE))
                if not DRY_RUN:
                    os.remove(path)
                stats["non_image"] += 1


# --------------------------------------------------------------------------
# 步骤 3: 把子文件夹中的图像提升到角色文件夹根目录, 并删除空文件夹
# --------------------------------------------------------------------------
def step3_flatten_images(character_dirs):
    for name, root in character_dirs:
        if not os.path.isdir(root):
            continue
        if name in NESTED:
            log("保留子目录结构(不扁平化): %s" % name)
            stats["nested"].append(name)
            continue
        # 记录根目录上已被占用的文件名 (含本次已计划落地的文件), 用于冲突判定
        occupied = {f for f in os.listdir(root) if os.path.isfile(os.path.join(root, f))}
        # 自底向上遍历, 先处理深层目录
        for dirpath, dirnames, filenames in os.walk(root, topdown=False):
            if os.path.abspath(dirpath) == os.path.abspath(root):
                continue
            for fn in filenames:
                if not is_image(fn):
                    continue
                src = os.path.join(dirpath, fn)
                dst = os.path.join(root, fn)
                if fn in occupied or os.path.exists(dst):
                    # 同名冲突: 用"子目录路径_文件名"区分, 仍冲突则追加序号
                    parent = os.path.relpath(dirpath, root).replace(os.sep, "-")
                    stem, ext = os.path.splitext(fn)
                    new_name = "%s_%s%s" % (parent, stem, ext)
                    n = 2
                    while new_name in occupied:
                        new_name = "%s_%s_%d%s" % (parent, stem, n, ext)
                        n += 1
                    dst = os.path.join(root, new_name)
                    stats["renamed_on_conflict"].append(
                        (name, os.path.relpath(src, root), os.path.basename(dst))
                    )
                log("提升: %s -> %s" % (os.path.relpath(src, BASE), os.path.relpath(dst, BASE)))
                if not DRY_RUN:
                    shutil.move(src, dst)
                occupied.add(os.path.basename(dst))
                stats["flattened"] += 1

        # 删除所有空文件夹 (自底向上)
        for dirpath, _dirnames, _filenames in os.walk(root, topdown=False):
            if os.path.abspath(dirpath) == os.path.abspath(root):
                continue
            if not os.listdir(dirpath):
                log("删除空文件夹: %s" % os.path.relpath(dirpath, BASE))
                if not DRY_RUN:
                    os.rmdir(dirpath)
                stats["removed_dirs"] += 1


# --------------------------------------------------------------------------
# 步骤 4: 源码目录清空后整体删除
# --------------------------------------------------------------------------
def step4_drop_source_tree():
    if not os.path.isdir(SRC_ROOT):
        log("miao-plugin-master 已不存在, 无需处理")
        stats["source_removed"] = True
        return

    leftovers = []
    for dirpath, _dirnames, filenames in os.walk(SRC_ROOT):
        for fn in filenames:
            leftovers.append(os.path.relpath(os.path.join(dirpath, fn), SRC_ROOT))

    if leftovers:
        log("miao-plugin-master 非空, 保留 %d 个文件, 例如: %s"
            % (len(leftovers), leftovers[:5]))
        return

    # 只剩空目录: 自底向上清理, 最后删掉 miao-plugin-master 本身
    for dirpath, _dirnames, _filenames in os.walk(SRC_ROOT, topdown=False):
        log("删除空目录: %s" % os.path.relpath(dirpath, BASE))
        if not DRY_RUN:
            os.rmdir(dirpath)
    stats["source_removed"] = True


def main():
    name_map = load_name_map()
    character_dirs = step1_extract(name_map)
    step2_remove_non_images(character_dirs)
    step3_flatten_images(character_dirs)
    step4_drop_source_tree()

    print("\n===== 统计 =====")
    print("提取角色文件夹: %d" % stats["moved"])
    print("其中按对照表重命名: %d" % stats["renamed"])
    print("对照表缺失(保留原名): %s" % (stats["unmapped"] or "无"))
    print("保留子目录结构(不扁平化): %s" % (stats["nested"] or "无"))
    print("删除非图像文件: %d" % stats["non_image"])
    print("提升图像文件: %d" % stats["flattened"])
    print("删除空文件夹: %d" % stats["removed_dirs"])
    print("miao-plugin-master 已删除: %s" % ("是" if stats["source_removed"] else "否"))
    if stats["renamed_on_conflict"]:
        print("同名冲突已改名:")
        for char, rel, new in stats["renamed_on_conflict"]:
            print("  %s: %s -> %s" % (char, rel, new))


if __name__ == "__main__":
    main()
