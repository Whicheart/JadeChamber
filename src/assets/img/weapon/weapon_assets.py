#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""下载武器图标资源, 按 enName 分文件夹存放到 img/weapon/。

数据来源: https://api.lunaris.moe/data/7.2.0/weaponlist.json
列表里的 weaponIcon 形如 UI_EquipIcon_<type>_<enName>, 例如 UI_EquipIcon_Sword_Blunt。

流程:
    1. 拉取武器列表, 解析出 <type> 与 <enName>;
    2. 在 img/weapon/ 下为每个 <enName> 建文件夹(已存在则跳过);
    3. 依次下载三个图标放进该文件夹:
         https://api.lunaris.moe/data/assets/weapongacha/UI_Gacha_EquipIcon_<type>_<enName>.webp
         https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_<type>_<enName>.webp
         https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_<type>_<enName>_Awaken.webp

用法:
    python weapon_assets.py              # 执行
    python weapon_assets.py --dry-run    # 只打印计划, 不建文件夹不下载
    python weapon_assets.py --overwrite  # 已存在的 webp 也重新下载
    python weapon_assets.py --workers 8  # 并发线程数(默认 12)
    python weapon_assets.py --limit 5    # 只处理前 5 把武器(调试)

说明:
    - 不同武器可能共用同一个 enName(如 Sword_Zephyrus 与 Bow_Zephyrus), 此时共用
      一个文件夹, 但文件名带 type 前缀所以不会互相覆盖;
    - 完全相同的 weaponIcon(不同 id 复用同一张图)只下载一次;
    - 文件已存在默认跳过, 便于中断后重跑续传;
    - 接口返回 404 表示该武器没有这张图(例如部分武器无 _Awaken), 记为 missing。
"""

import argparse
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = os.path.dirname(os.path.abspath(__file__))
LIST_URL = "https://api.lunaris.moe/data/7.2.0/weaponlist.json"
ASSET_BASE = "https://api.lunaris.moe/data/assets"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
ICON_PREFIX = "UI_EquipIcon_"

stats = {
    "weapons": 0,
    "dirs_created": 0,
    "dirs_existed": 0,
    "downloaded": 0,
    "skipped_existing": 0,
    "missing": 0,
    "failed": 0,
    "bytes": 0,
}
missing_items = []
failed_items = []
_lock = threading.Lock()


def http_get(url, timeout=60, retries=3):
    """带 UA 的 GET, 返回 bytes; 404 返回 None; 其他错误重试后抛出。"""
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                return None
            last = exc
        except Exception as exc:  # 网络抖动
            last = exc
        time.sleep(1.0 + attempt)
    raise last


def parse_icons(data):
    """从武器列表解析出 [(type, enName, icon)], 按 icon 去重。"""
    result, seen = [], set()
    for wid, info in data.items():
        icon = (info or {}).get("weaponIcon") or ""
        if not icon.startswith(ICON_PREFIX):
            continue
        rest = icon[len(ICON_PREFIX):]
        if "_" not in rest:
            continue
        wtype, en_name = rest.split("_", 1)
        if icon in seen:
            continue
        seen.add(icon)
        result.append((wtype, en_name, icon))
    return result


def icon_urls(wtype, en_name):
    stem = "%s%s_%s" % (ICON_PREFIX, wtype, en_name)
    return [
        ("gacha", "%s/weapongacha/UI_Gacha_EquipIcon_%s_%s.webp" % (ASSET_BASE, wtype, en_name)),
        ("icon", "%s/weaponicon/%s.webp" % (ASSET_BASE, stem)),
        ("awaken", "%s/weaponicon/%s_Awaken.webp" % (ASSET_BASE, stem)),
    ]


def save_bytes(path, data):
    tmp = path + ".tmp"
    with open(tmp, "wb") as fh:
        fh.write(data)
    os.replace(tmp, path)


def fetch_one(kind, url, dst, overwrite):
    """下载单张图, 返回 (kind, 状态, 字节数)。"""
    if not overwrite and os.path.exists(dst):
        return kind, "skipped", os.path.getsize(dst)
    try:
        data = http_get(url)
    except Exception as exc:
        with _lock:
            failed_items.append((dst, str(exc)))
        return kind, "failed", 0
    if data is None:
        with _lock:
            missing_items.append(dst)
        return kind, "missing", 0
    try:
        save_bytes(dst, data)
    except OSError as exc:
        with _lock:
            failed_items.append((dst, str(exc)))
        return kind, "failed", 0
    return kind, "downloaded", len(data)


def process_weapon(index, total, wtype, en_name, overwrite):
    folder = os.path.join(BASE, en_name)
    if os.path.isdir(folder):
        with _lock:
            stats["dirs_existed"] += 1
    else:
        try:
            os.makedirs(folder)
            with _lock:
                stats["dirs_created"] += 1
        except OSError as exc:
            with _lock:
                failed_items.append((folder, str(exc)))
                stats["failed"] += 1
            return

    tasks = [(kind, url, os.path.join(folder, os.path.basename(url))) for kind, url in icon_urls(wtype, en_name)]
    parts, got = [], 0
    # 三张图并行下载, 单把武器失败不影响其他武器
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda t: fetch_one(*t, overwrite), tasks))
    for (kind, status, size) in results:
        parts.append("%s:%s" % (kind, status if status != "downloaded" else "ok"))
        with _lock:
            if status == "downloaded":
                stats["downloaded"] += 1
                stats["bytes"] += size
                got += 1
            elif status == "skipped":
                stats["skipped_existing"] += 1
                got += 1
            elif status == "missing":
                stats["missing"] += 1
            else:
                stats["failed"] += 1
    print("[%3d/%3d] %-22s %-10s %d/3  %s" % (index, total, en_name, wtype, got, " ".join(parts)))


def main():
    parser = argparse.ArgumentParser(description="下载武器图标到 img/weapon/<enName>/")
    parser.add_argument("--dry-run", action="store_true", help="只打印计划, 不建文件夹不下载")
    parser.add_argument("--overwrite", action="store_true", help="已存在的 webp 也重新下载")
    parser.add_argument("--workers", type=int, default=12, help="并发线程数 (default: 12)")
    parser.add_argument("--limit", type=int, default=0, help="只处理前 N 把武器, 0 表示全部")
    args = parser.parse_args()

    print("拉取武器列表: %s" % LIST_URL)
    raw = http_get(LIST_URL)
    if not raw:
        print("列表拉取失败")
        return 1
    data = json.loads(raw.decode("utf-8"))
    icons = parse_icons(data)
    stats["weapons"] = len(data)
    if args.limit:
        icons = icons[: args.limit]
    print("武器条目 %d 个, 需要处理 %d 个图标\n" % (len(data), len(icons)))

    if args.dry_run:
        for wtype, en_name, icon in icons:
            print("%-10s %-22s %s" % (wtype, en_name, icon))
            for kind, url in icon_urls(wtype, en_name):
                print("           %-7s %s" % (kind, url))
        print("\n[dry-run] 共 %d 个文件夹, %d 次下载" % (len({n for _, n, _ in icons}), len(icons) * 3))
        return 0

    t0 = time.time()

    def job(idx_item):
        idx, (wtype, en_name, _icon) = idx_item
        process_weapon(idx, len(icons), wtype, en_name, args.overwrite)

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = [pool.submit(job, item) for item in enumerate(icons, 1)]
        for fut in as_completed(futures):
            fut.result()

    elapsed = time.time() - t0
    print("\n===== 统计 =====")
    print("武器条目: %d, 处理图标: %d" % (stats["weapons"], len(icons)))
    print("新建文件夹: %d, 已存在: %d" % (stats["dirs_created"], stats["dirs_existed"]))
    print("下载成功: %d, 跳过已存在: %d" % (stats["downloaded"], stats["skipped_existing"]))
    print("缺失(404): %d, 失败: %d" % (stats["missing"], stats["failed"]))
    print("体积: %.2f MB, 耗时: %.1f 秒" % (stats["bytes"] / 1024 / 1024, elapsed))
    if missing_items:
        print("\n缺失清单(前 20):")
        for path in missing_items[:20]:
            print("  %s" % os.path.relpath(path, BASE))
    if failed_items:
        print("\n失败清单:")
        for path, msg in failed_items[:20]:
            print("  %s: %s" % (os.path.relpath(path, BASE), msg))
    return 1 if stats["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
