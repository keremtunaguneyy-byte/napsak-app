"""Canonical review panels assembled from real App/RN Web scroll captures.

Does not modify production media. Requires Pillow from the workspace Python runtime.
Raw captures and Figma references stay outside the canonical output. Do not point
--out at either input directory.
"""
import argparse
import json
import shutil
from pathlib import Path
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('--raw', type=Path, required=True)
parser.add_argument('--references', type=Path, required=True)
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args()
assert args.out.resolve() not in [args.raw.resolve(), args.references.resolve()]
args.out.mkdir(parents=True, exist_ok=True)
result = json.loads((args.raw / 'browser-results.json').read_text())
assert len(result['checks']) == 73 and not result['errors']
edge_result = json.loads((args.raw / 'edge-browser-results.json').read_text())
assert len(edge_result['checks']) == 7 and not edge_result['errors']
commands = json.loads((args.raw / 'browser-commands.json').read_text())
assert len(commands) == 4 and all(r['exitCode'] == 0 for r in commands)
configs = json.loads(Path('src/design/ankara101Presentation.json').read_text())
names = dict(zip(configs, ['castle', 'hamamonu', 'anadolu', 'cumhuriyet', 'etnografya', 'resim-heykel', 'aslanhane', 'ulus', 'gordion', 'eymir', 'mogan', 'tunali']))

def panel(dest, images):
    loaded = [(label, Image.open(path).convert('RGB')) for label, path in images]
    width = sum(im.width for _, im in loaded)
    output = Image.new('RGB', (width, max(im.height for _, im in loaded) + 24), 'white')
    draw = ImageDraw.Draw(output)
    x = 0
    for label, im in loaded:
        draw.text((x + 4, 4), label, fill='black')
        output.paste(im, (x, 24))
        x += im.width
    output.save(dest, optimize=True)

for guide, name in names.items():
    for width in [393, 412]:
        for scale in [1, 1.8]:
            prefix = f'{guide}-{width}-{scale}'
            images = []
            if scale == 1:
                images.append((f'FIGMA {configs[guide]["nodes"][f"mobile_{width}"]}', args.references / f'{name}-{width}.png'))
            images += [(f'APP {width} text {scale} - top', args.raw / f'{prefix}-top.png'), ('APP - final source / fixed nav clearance', args.raw / f'{prefix}-footer.png')]
            panel(args.out / f'{prefix}.png', images)
    row = next(r for r in result['checks'] if r.get('id') == guide and r.get('scale') == 1 and r['viewport']['width'] == 393)
    height = int(row['bodyHeight'])
    body = Image.new('RGB', (393, height), 'white')
    body.paste(Image.open(args.raw / f'{guide}-393-1-top.png').crop((0, 80, 393, 778)), (0, 0))
    for tile, y in enumerate(range(618, height - 80, 618), 1):
        image = Image.open(args.raw / f'{guide}-393-1-body-{tile}.png')
        body.paste(image.crop((0, 80, 393, 778)), (0, min(y, height - 698)))
    # Temporary standalone body is consumed by the paired panel, not retained.
    temp = args.out / f'{guide}-body.tmp.png'
    body.save(temp)
    panel(args.out / f'{guide}-full-comparison.png', [('FIGMA full native-flow master', args.references / f'{name}-master.png'), ('APP body - stitched actual scroll captures', temp)])
    temp.unlink()

for width in [393, 412]:
    for scale in [1, 1.8]:
        images = []
        if scale == 1:
            images.append((f'FIGMA index {width}', args.references / f'index-{width}.png'))
        images.append((f'APP index {width} text {scale}', args.raw / f'index-{width}-{scale}.png'))
        panel(args.out / f'index-{width}-{scale}.png', images)
for name in ['guide-ankara-kalesi-saved-origin.png', 'fontFail.png', 'fontHold.png', 'long-16-paragraphs-1.8-footer.png', 'media-unavailable.png', 'guide-unavailable.png', 'browser-results.json', 'edge-browser-results.json', 'browser-commands.json']:
    shutil.copyfile(args.raw / name, args.out / name)
print('Canonical panels: 48 guide viewport comparisons, 12 complete bodies, 4 indexes, 6 edge/state captures, 3 result ledgers.')

# Index correction: all twelve entries, never just the first viewport.
media_result = json.loads((args.raw / 'media-browser-results.json').read_text())
assert len(media_result['checks']) == 48 and not media_result['errors']
for width in [393, 412]:
    for scale in [1, 1.8]:
        tiles = [(guide, Image.open(args.raw / f'card-{guide}-{width}-{scale}.png').convert('RGB')) for guide in configs]
        cell = max(im.width for _, im in tiles) + 12
        rows = [tiles[i:i+3] for i in range(0, len(tiles), 3)]
        height = sum(max(im.height for _, im in row) + 36 for row in rows)
        grid = Image.new('RGB', (cell * 3, height), 'white')
        draw = ImageDraw.Draw(grid)
        y = 0
        for row in rows:
            for col, (guide, im) in enumerate(row):
                draw.text((col * cell + 4, y + 4), f'{guide} / {width} / {scale}', fill='black')
                grid.paste(im, (col * cell, y + 24))
            y += max(im.height for _, im in row) + 36
        grid.save(args.out / f'index-all-cards-{width}-{scale}.png', optimize=True)
        discovery = args.out / 'twelve-guide-index'
        discovery.mkdir(exist_ok=True)
        for prefix in ['index-end', 'legacy-saved-reader']:
            shutil.copyfile(args.raw / f'{prefix}-{width}-{scale}.png', discovery / f'{prefix}-{width}-{scale}.png')
for name in ['cold-placeholder.png', 'cold-loaded.png', 'media-browser-results.json']:
    shutil.copyfile(args.raw / name, args.out / name)

legacy_result = json.loads((args.raw / 'legacy-browser-results.json').read_text())
assert len(legacy_result['checks']) == 12 and not legacy_result['errors']
shutil.copyfile(args.raw / 'legacy-browser-results.json', args.out / 'twelve-guide-index/legacy-browser-results.json')
