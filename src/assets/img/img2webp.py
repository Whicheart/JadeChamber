#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量把 PNG / JPG 等图像文件转换为 WebP。

默认参数 (改起来很简单, 见下方 CONFIG):
    有损压缩        lossless=False           像素会有轻微损失, 换来更小的体积
    质量 92         quality=92               有损压缩的质量档位 0-100
    压缩速度 4      method=4                 libwebp 的压缩档位 0(最快)~6(最小), 4 是默认值
    保留透明通道    alpha_quality=100        RGBA / P+transparency 会先转成 RGBA 再编码
    保持原始尺寸    不做任何缩放 / 重采样
    剥离元数据      保存时不写入 EXIF / ICC / XMP

用法:
    python img2webp.py                     # 递归转换当前目录
    python img2webp.py src/img             # 递归转换指定目录
    python img2webp.py a.png b.jpg         # 转换指定文件
    python img2webp.py --dry-run           # 只列出将要做什么
    python img2webp.py --quality 80        # 调整有损质量
    python img2webp.py --lossless          # 改为无损压缩
    python img2webp.py --delete-source     # 转换成功后删除原图
    python img2webp.py --overwrite         # 覆盖已存在的同名 .webp (默认跳过)

依赖: Pillow (pip install Pillow)
"""

import argparse
import os
import sys
import time
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover - 仅用于给出友好提示
    sys.exit("缺少 Pillow, 请先安装: pip install Pillow")


# ---------------------------------------------------------------------------
# 默认配置
# ---------------------------------------------------------------------------
CONFIG = {
    "lossless": False,      # 有损压缩 (加 --lossless 可切换为无损)
    "quality": 92,          # 图像质量, 有损时生效
    "method": 4,            # 压缩速度 / 档位: 0 最快, 6 压缩率最高
    "alpha_quality": 100,   # 透明通道质量 (0-100)
    "keep_size": True,      # 保持原始尺寸
    "strip_metadata": True,  # 剥离元数据
}

# 默认参与转换的输入扩展名; .webp 自身不在其中 (避免自我递归转换)
INPUT_EXTS = {
    ".png", ".jpg", ".jpeg", ".jfif", ".bmp", ".dib",
    ".tif", ".tiff", ".gif", ".avif", ".ppm", ".pgm", ".tga",
}

BASE = Path.cwd().resolve()

stats = {
    "scanned": 0,
    "converted": 0,
    "skipped_existing": 0,
    "skipped_animated": 0,
    "skipped_unsupported": 0,
    "failed": 0,
    "src_bytes": 0,
    "dst_bytes": 0,
}


def human(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return "%.1f %s" % (n, unit) if unit != "B" else "%d B" % n
        n /= 1024.0


def log(msg):
    print(msg, flush=True)


def show(path):
    """尽量显示相对路径, 失败时退回绝对路径。"""
    try:
        return str(Path(path).resolve().relative_to(BASE))
    except ValueError:
        return str(path)


def iter_files(targets, recursive):
    """把命令行给的路径展开成待处理的图像文件列表。"""
    for target in targets:
        p = Path(target).resolve()
        if p.is_file():
            if p.suffix.lower() in INPUT_EXTS:
                yield p
            else:
                stats["skipped_unsupported"] += 1
                log("跳过(扩展名不在白名单): %s" % show(p))
            continue
        if not p.is_dir():
            log("跳过(路径不存在): %s" % show(p))
            continue
        pattern = "**/*" if recursive else "*"
        for f in sorted(p.glob(pattern)):
            if f.is_file() and f.suffix.lower() in INPUT_EXTS:
                yield f


def prepare_image(img):
    """把任意模式的图转成 WebP 能好好保存的模式, 同时尽量保留透明通道。"""
    mode = img.mode

    # 带透明的调色板图: 必须走 RGBA, 否则透明区域会变黑
    if mode == "P":
        return img.convert("RGBA") if "transparency" in img.info else img.convert("RGB")

    if mode in ("RGBA", "LA", "PA"):
        return img.convert("RGBA")

    # 16 位 / 浮点灰度: 降到 8 位
    if mode in ("I;16", "I;16B", "I;16L", "I", "F"):
        return img.convert("L")

    if mode == "1":
        return img.convert("L")

    if mode in ("RGB", "CMYK", "YCbCr", "LAB", "HSV"):
        return img.convert("RGB")

    if mode == "L":
        return img

    # 其他冷门模式兜底
    return img.convert("RGBA")


def convert_one(src, args):
    dst = src.with_suffix(".webp")
    stats["scanned"] += 1

    if dst.exists() and not args.overwrite:
        stats["skipped_existing"] += 1
        log("跳过(已存在): %s" % show(dst))
        return

    try:
        with Image.open(src) as img:
            if getattr(img, "is_animated", False) and getattr(img, "n_frames", 1) > 1:
                stats["skipped_animated"] += 1
                log("跳过(动图): %s" % show(src))
                return

            img.load()
            out = prepare_image(img)

            save_kwargs = {
                "format": "WEBP",
                "method": args.method,
                "quality": args.quality,
                "lossless": args.lossless,
                "alpha_quality": args.alpha_quality,
            }
            if args.lossless:
                # 无损时要求连透明区域的 RGB 也原样保留
                save_kwargs["exact"] = True
            # 剥离元数据: 显式不传 exif / icc_profile / xmp
            if not CONFIG["strip_metadata"]:
                if img.info.get("exif"):
                    save_kwargs["exif"] = img.info["exif"]
                if img.info.get("icc_profile"):
                    save_kwargs["icc_profile"] = img.info["icc_profile"]

            before = src.stat().st_size
            if args.dry_run:
                log("[dry-run] %s -> %s" % (show(src), dst.name))
                stats["converted"] += 1
                stats["src_bytes"] += before
                return

            tmp = dst.with_suffix(".webp.tmp")
            try:
                out.save(tmp, **save_kwargs)
                os.replace(tmp, dst)
            finally:
                if tmp.exists():
                    tmp.unlink()

            after = dst.stat().st_size
            stats["converted"] += 1
            stats["src_bytes"] += before
            stats["dst_bytes"] += after
            ratio = (after / before * 100) if before else 0
            log("[ok] %s -> %s  (%s -> %s, %.0f%%)"
                % (show(src), dst.name, human(before), human(after), ratio))

            if args.delete_source:
                src.unlink()
    except Exception as exc:  # noqa: BLE001 - 单个文件失败不影响整体
        stats["failed"] += 1
        log("[fail] %s: %s" % (show(src), exc))


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="把 PNG/JPG 等图像转换为 WebP (默认有损、质量 92、method 4、保留透明、原始尺寸、剥离元数据)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("paths", nargs="*", default=["."], help="要处理的文件或目录")
    parser.add_argument("--lossless", action="store_true",
                        help="改为无损压缩 (默认有损)")
    parser.add_argument("--quality", type=int, default=CONFIG["quality"],
                        help="图像质量 0-100, 有损模式生效")
    parser.add_argument("--method", type=int, default=CONFIG["method"],
                        help="压缩档位 0-6, 越大越慢文件越小")
    parser.add_argument("--alpha-quality", type=int, default=CONFIG["alpha_quality"],
                        help="透明通道质量 0-100")
    parser.add_argument("--overwrite", action="store_true", help="覆盖已存在的 .webp")
    parser.add_argument("--delete-source", action="store_true", help="转换成功后删除原图")
    parser.add_argument("--no-recursive", action="store_true", help="只处理当前层, 不递归")
    parser.add_argument("--dry-run", action="store_true", help="只打印计划, 不写文件")
    args = parser.parse_args(argv)

    if not 0 <= args.quality <= 100:
        parser.error("--quality 必须在 0-100 之间")
    if not 0 <= args.method <= 6:
        parser.error("--method 必须在 0-6 之间")
    if not 0 <= args.alpha_quality <= 100:
        parser.error("--alpha-quality 必须在 0-100 之间")

    start = time.time()

    log("模式: %s | quality=%d | method=%d | alpha_quality=%d | 原始尺寸 | 剥离元数据"
        % ("无损" if args.lossless else "有损", args.quality, args.method, args.alpha_quality))

    for src in iter_files(args.paths, recursive=not args.no_recursive):
        convert_one(src, args)

    elapsed = time.time() - start
    saved = stats["src_bytes"] - stats["dst_bytes"]
    log("\n===== 统计 =====")
    log("扫描文件: %d" % stats["scanned"])
    log("转换成功: %d" % stats["converted"])
    log("跳过(已存在): %d" % stats["skipped_existing"])
    log("跳过(动图): %d" % stats["skipped_animated"])
    log("跳过(不支持的扩展名): %d" % stats["skipped_unsupported"])
    log("失败: %d" % stats["failed"])
    if stats["dst_bytes"]:
        pct = saved / stats["src_bytes"] * 100 if stats["src_bytes"] else 0
        if saved >= 0:
            log("体积: %s -> %s (节省 %s, %.1f%%)"
                % (human(stats["src_bytes"]), human(stats["dst_bytes"]), human(saved), pct))
        else:
            log("体积: %s -> %s (增大 %s, %.1f%%)"
                % (human(stats["src_bytes"]), human(stats["dst_bytes"]), human(-saved), -pct))
    log("耗时: %.1f 秒" % elapsed)
    return 1 if stats["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
