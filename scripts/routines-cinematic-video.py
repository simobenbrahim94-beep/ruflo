#!/usr/bin/env python3
"""
Routines.fr Cinematic Brand Video Generator
Uses Pixverse API to create a full cinematic marketing video from product images.

Usage:
  # Text-to-video (no images needed — runs immediately):
  python3 scripts/routines-cinematic-video.py --mode text

  # Image-to-video (supply product image URLs or local paths):
  python3 scripts/routines-cinematic-video.py --mode image \
    --images https://cdn.routines.fr/serum.jpg https://cdn.routines.fr/cream.jpg

  # Full pipeline (scrape + generate):
  PIXVERSE_API_KEY=sk-xxx python3 scripts/routines-cinematic-video.py --mode full
"""

import asyncio
import json
import os
import sys
import argparse
import tempfile
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field

import httpx

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
PIXVERSE_BASE = "https://app-api.pixverseai.cn"
PIXVERSE_API_KEY = os.environ.get("PIXVERSE_API_KEY", "")

# ---------------------------------------------------------------------------
# Cinematic storyboard — 7 scenes, each 5 s, total ~35 s brand film
# ---------------------------------------------------------------------------
# Each scene is crafted with:
#   - Cinematic opening hook  (scene 1)
#   - Hero product reveals    (scenes 2–5, one per product)
#   - Transformation payoff   (scene 6)
#   - Brand close             (scene 7)
# ---------------------------------------------------------------------------

BRAND_STYLE = (
    "ultra-cinematic, 4K, shallow depth of field, anamorphic lens flare, "
    "slow motion 120fps, luxury French skincare aesthetic, marble and white surfaces, "
    "soft golden hour light, clinical precision, elegant minimalist product shots"
)

NEGATIVE_PROMPT = (
    "cartoon, anime, low quality, blurry, watermark, text, logo, "
    "harsh lighting, clutter, cheap looking, amateur"
)

STORYBOARD: list[dict] = [
    {
        "scene": 1,
        "label": "Opening Hook",
        "prompt": (
            f"Close-up of water droplets falling in slow motion onto pristine white marble, "
            f"each drop creating perfect ripples, camera slowly pulling back to reveal a "
            f"minimalist French laboratory, warm morning light flooding through floor-to-ceiling windows. "
            f"{BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
    {
        "scene": 2,
        "label": "Collagen Boost Serum Reveal",
        "prompt": (
            f"A sleek glass serum bottle rotates slowly in midair against a pure white background, "
            f"golden liquid inside catches the light creating brilliant caustic patterns, "
            f"formula molecules visualized as glowing particles swirling around the bottle, "
            f"pharmaceutical precision meets luxury beauty. {BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
    {
        "scene": 3,
        "label": "Texture Close-Up",
        "prompt": (
            f"Extreme macro shot of a single drop of luminous serum falling onto fingertip in slow motion, "
            f"serum absorbs instantly leaving skin visibly radiant, skin cells illuminated as if lit from within, "
            f"scientific and sensual simultaneously. {BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
    {
        "scene": 4,
        "label": "Application Ritual",
        "prompt": (
            f"A woman with flawless porcelain skin applies serum with precise elegant strokes, "
            f"shot from multiple cinematic angles — profile, close-up on cheekbone, overhead, "
            f"skin visibly transforming with each application, golden glow spreading across face, "
            f"morning ritual in a Haussmann Parisian apartment. {BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
    {
        "scene": 5,
        "label": "Full Product Line",
        "prompt": (
            f"Elegant flat lay of the complete Routines skincare collection arranged on white marble, "
            f"camera slowly cranes down from above, products precisely spaced, "
            f"morning light creates long dramatic shadows, clinical labels perfectly legible, "
            f"hero products float upward slightly in slow motion. {BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
    {
        "scene": 6,
        "label": "Transformation Payoff",
        "prompt": (
            f"Split-screen morphing transition: left side shows tired skin before, "
            f"right side reveals luminous transformed skin after, the divide line ripples "
            f"like liquid light sweeping across the frame, close up on eyes — crow's feet "
            f"visibly smoothing, skin plumping in real time. {BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
    {
        "scene": 7,
        "label": "Brand Close",
        "prompt": (
            f"Final hero shot: the signature Routines serum bottle stands alone on a sun-drenched marble plinth, "
            f"golden light halos the bottle, camera slowly zooms in then freezes as screen fades to pure white, "
            f"cinematic brand moment, timeless luxury French pharmaceutical beauty. {BRAND_STYLE}"
        ),
        "duration": 5,
        "quality": "1080p",
        "aspect_ratio": "16:9",
        "motion_mode": "smooth",
    },
]

# ---------------------------------------------------------------------------
# Pixverse API client (minimal async, no external deps beyond httpx)
# ---------------------------------------------------------------------------

@dataclass
class VideoResult:
    scene: int
    label: str
    video_id: Optional[int] = None
    status: str = "pending"
    url: Optional[str] = None
    error: Optional[str] = None


class PixverseClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base = PIXVERSE_BASE
        self.headers = {
            "API-KEY": api_key,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    async def _post(self, client: httpx.AsyncClient, endpoint: str, payload: dict) -> dict:
        import uuid
        headers = {**self.headers, "Ai-Trace-Id": str(uuid.uuid4())}
        r = await client.post(f"{self.base}{endpoint}", json=payload, headers=headers, timeout=30)
        r.raise_for_status()
        return r.json()

    async def _get(self, client: httpx.AsyncClient, endpoint: str) -> dict:
        import uuid
        headers = {**self.headers, "Ai-Trace-Id": str(uuid.uuid4())}
        r = await client.get(f"{self.base}{endpoint}", headers=headers, timeout=30)
        r.raise_for_status()
        return r.json()

    async def text_to_video(self, client: httpx.AsyncClient, scene: dict) -> int:
        payload = {
            "prompt": scene["prompt"],
            "negative_prompt": NEGATIVE_PROMPT,
            "model": "v5",
            "duration": scene["duration"],
            "quality": scene["quality"],
            "aspect_ratio": scene["aspect_ratio"],
            "motion_mode": scene.get("motion_mode", "smooth"),
        }
        data = await self._post(client, "/openapi/v2/video/text/generate", payload)
        err = data.get("ErrCode", 0)
        if err != 0:
            raise RuntimeError(f"API error {err}: {data.get('ErrMsg')}")
        return data["Resp"]["video_id"]

    async def upload_image_from_url(self, client: httpx.AsyncClient, url: str) -> int:
        import uuid
        headers = {**self.headers, "Ai-Trace-Id": str(uuid.uuid4())}
        del headers["Content-Type"]
        r = await client.post(
            f"{self.base}/openapi/v2/image/upload",
            data={"image_url": url},
            headers=headers,
            timeout=60,
        )
        r.raise_for_status()
        data = r.json()
        if data.get("ErrCode", 0) != 0:
            raise RuntimeError(f"Upload error: {data.get('ErrMsg')}")
        return data["Resp"]["img_id"]

    async def image_to_video(self, client: httpx.AsyncClient, img_id: int, scene: dict) -> int:
        payload = {
            "img_id": img_id,
            "prompt": scene["prompt"],
            "negative_prompt": NEGATIVE_PROMPT,
            "model": "v5",
            "duration": scene["duration"],
            "quality": scene["quality"],
            "aspect_ratio": scene["aspect_ratio"],
            "motion_mode": scene.get("motion_mode", "smooth"),
        }
        data = await self._post(client, "/openapi/v2/video/img/generate", payload)
        err = data.get("ErrCode", 0)
        if err != 0:
            raise RuntimeError(f"API error {err}: {data.get('ErrMsg')}")
        return data["Resp"]["video_id"]

    async def poll_video(self, client: httpx.AsyncClient, video_id: int, max_wait: int = 600) -> dict:
        STATUS = {1: "completed", 2: "pending", 3: "in_progress", 6: "cancelled", 7: "failed", 8: "failed"}
        for _ in range(max_wait // 10):
            await asyncio.sleep(10)
            data = await self._get(client, f"/openapi/v2/video/result/{video_id}")
            resp = data.get("Resp", {})
            status = STATUS.get(resp.get("status", 2), "pending")
            print(f"  [video {video_id}] status={status}")
            if status == "completed":
                return {"status": "completed", "url": resp.get("url")}
            if status in ("failed", "cancelled"):
                return {"status": status, "url": None}
        return {"status": "timeout", "url": None}


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

async def generate_text_videos(api_key: str) -> list[VideoResult]:
    """Generate all storyboard scenes via text-to-video."""
    client_api = PixverseClient(api_key)
    results: list[VideoResult] = []

    async with httpx.AsyncClient() as http:
        # Submit all scenes concurrently
        print(f"\n[1/3] Submitting {len(STORYBOARD)} scenes to Pixverse...")
        tasks = []
        for scene in STORYBOARD:
            tasks.append(client_api.text_to_video(http, scene))

        video_ids = await asyncio.gather(*tasks, return_exceptions=True)

        for scene, vid_id in zip(STORYBOARD, video_ids):
            r = VideoResult(scene=scene["scene"], label=scene["label"])
            if isinstance(vid_id, Exception):
                r.status = "error"
                r.error = str(vid_id)
                print(f"  Scene {scene['scene']} ({scene['label']}): ERROR — {vid_id}")
            else:
                r.video_id = vid_id
                r.status = "pending"
                print(f"  Scene {scene['scene']} ({scene['label']}): video_id={vid_id}")
            results.append(r)

        # Poll all pending videos concurrently
        print("\n[2/3] Polling for completion (up to 10 min per video)...")
        poll_tasks = []
        for r in results:
            if r.video_id:
                poll_tasks.append((r, client_api.poll_video(http, r.video_id)))

        completed = await asyncio.gather(*[t for _, t in poll_tasks], return_exceptions=True)
        for (r, _), outcome in zip(poll_tasks, completed):
            if isinstance(outcome, Exception):
                r.status = "error"
                r.error = str(outcome)
            else:
                r.status = outcome["status"]
                r.url = outcome["url"]
            print(f"  Scene {r.scene}: {r.status} — {r.url or r.error}")

    return results


async def generate_image_videos(api_key: str, image_sources: list[str]) -> list[VideoResult]:
    """Upload product images then generate image-to-video for each scene."""
    client_api = PixverseClient(api_key)
    results: list[VideoResult] = []

    # Pair images to scenes (cycle if fewer images than scenes)
    paired = [(STORYBOARD[i], image_sources[i % len(image_sources)]) for i in range(len(STORYBOARD))]

    async with httpx.AsyncClient() as http:
        # Upload all images
        print(f"\n[1/4] Uploading {len(image_sources)} product image(s)...")
        upload_tasks = [client_api.upload_image_from_url(http, url) for url in image_sources]
        img_ids_raw = await asyncio.gather(*upload_tasks, return_exceptions=True)
        img_id_map: dict[str, int] = {}
        for url, img_id in zip(image_sources, img_ids_raw):
            if isinstance(img_id, Exception):
                print(f"  Upload failed for {url}: {img_id}")
            else:
                img_id_map[url] = img_id
                print(f"  Uploaded {url} → img_id={img_id}")

        # Submit image-to-video for each scene
        print(f"\n[2/4] Submitting {len(paired)} video generation jobs...")
        gen_tasks = []
        for scene, url in paired:
            img_id = img_id_map.get(url)
            if img_id:
                gen_tasks.append((scene, client_api.image_to_video(http, img_id, scene)))
            else:
                gen_tasks.append((scene, asyncio.coroutine(lambda: None)()))

        video_ids = await asyncio.gather(*[t for _, t in gen_tasks], return_exceptions=True)
        for (scene, _), vid_id in zip(gen_tasks, video_ids):
            r = VideoResult(scene=scene["scene"], label=scene["label"])
            if isinstance(vid_id, Exception) or vid_id is None:
                r.status = "error"
                r.error = str(vid_id)
            else:
                r.video_id = vid_id
            results.append(r)
            print(f"  Scene {scene['scene']}: video_id={vid_id}")

        # Poll
        print("\n[3/4] Polling for completion...")
        poll_tasks = [(r, client_api.poll_video(http, r.video_id)) for r in results if r.video_id]
        completed = await asyncio.gather(*[t for _, t in poll_tasks], return_exceptions=True)
        for (r, _), outcome in zip(poll_tasks, completed):
            if isinstance(outcome, Exception):
                r.status = "error"
                r.error = str(outcome)
            else:
                r.status = outcome["status"]
                r.url = outcome["url"]

    return results


def save_results(results: list[VideoResult], out_path: Path):
    data = [
        {
            "scene": r.scene,
            "label": r.label,
            "video_id": r.video_id,
            "status": r.status,
            "url": r.url,
            "error": r.error,
        }
        for r in results
    ]
    out_path.write_text(json.dumps(data, indent=2))
    print(f"\n[done] Results saved to {out_path}")


def print_summary(results: list[VideoResult]):
    print("\n" + "=" * 60)
    print("ROUTINES.FR CINEMATIC VIDEO — GENERATION SUMMARY")
    print("=" * 60)
    ok = [r for r in results if r.status == "completed"]
    fail = [r for r in results if r.status != "completed"]
    print(f"  Completed : {len(ok)}/{len(results)} scenes")
    print(f"  Failed    : {len(fail)}/{len(results)} scenes")
    print()
    for r in results:
        icon = "✓" if r.status == "completed" else "✗"
        print(f"  {icon}  Scene {r.scene:02d} — {r.label}")
        if r.url:
            print(f"        {r.url}")
        elif r.error:
            print(f"        ERROR: {r.error}")
    print("=" * 60)
    if ok:
        print("\nNEXT STEP: Download the video clips above and merge them")
        print("in order (1→7) using ffmpeg or Adobe Premiere for the")
        print("final 35-second Routines.fr cinematic brand film.")
        print("\nRecommended merge command:")
        print("  ffmpeg -f concat -safe 0 -i filelist.txt -c copy routines_brand_film.mp4")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Routines.fr Cinematic Video Generator (Pixverse)")
    parser.add_argument("--mode", choices=["text", "image", "full"], default="text",
                        help="text=text-to-video, image=supply URLs, full=scrape+generate")
    parser.add_argument("--images", nargs="*", default=[],
                        help="Product image URLs or local paths (for --mode image)")
    parser.add_argument("--out", default="routines-videos.json",
                        help="Output JSON file for results")
    parser.add_argument("--api-key", default=os.environ.get("PIXVERSE_API_KEY", ""),
                        help="Pixverse API key (or set PIXVERSE_API_KEY env var)")
    args = parser.parse_args()

    api_key = args.api_key or PIXVERSE_API_KEY
    if not api_key:
        print("ERROR: Set PIXVERSE_API_KEY environment variable or pass --api-key")
        sys.exit(1)

    print("╔══════════════════════════════════════════════════════╗")
    print("║   ROUTINES.FR × PIXVERSE — CINEMATIC BRAND VIDEO    ║")
    print("╚══════════════════════════════════════════════════════╝")
    print(f"  Mode     : {args.mode}")
    print(f"  Scenes   : {len(STORYBOARD)} ({sum(s['duration'] for s in STORYBOARD)}s total)")
    print(f"  Quality  : 1080p | 16:9 | smooth motion")

    if args.mode == "text":
        results = asyncio.run(generate_text_videos(api_key))
    elif args.mode == "image":
        if not args.images:
            print("ERROR: --mode image requires --images <url1> <url2> ...")
            sys.exit(1)
        results = asyncio.run(generate_image_videos(api_key, args.images))
    else:
        print("ERROR: --mode full not yet available in sandbox (routines.fr blocks scraping).")
        print("Supply images manually with --mode image --images <url1> ...")
        sys.exit(1)

    save_results(results, Path(args.out))
    print_summary(results)


if __name__ == "__main__":
    main()
