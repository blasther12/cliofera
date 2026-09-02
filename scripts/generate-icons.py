from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "docs" / "icons"
SOURCE = ICONS / "cliofera-app-icon.svg"

TARGETS = {
    "icon-32-v2.png": 32,
    "apple-touch-icon-v2.png": 180,
    "icon-192-v2.png": 192,
    "icon-512-v2.png": 512,
}

svg = SOURCE.read_bytes()

for name, size in TARGETS.items():
    cairosvg.svg2png(
        bytestring=svg,
        write_to=str(ICONS / name),
        output_width=size,
        output_height=size,
    )
    print(f"generated {name} ({size}x{size})")
