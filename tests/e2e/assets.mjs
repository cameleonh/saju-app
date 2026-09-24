// tests/e2e/assets.mjs
// 정적 자산 검증: 인연 사진 풀(100장) 전수, SVG 10종, 차단 경로 확인.
// 사용: node tests/e2e/assets.mjs [--base=https://saju.blog/]

const args = Object.fromEntries(process.argv.slice(2).flatMap((arg) => {
  const match = /^--([^=]+)(?:=(.*))?$/.exec(arg);
  return match ? [[match[1], match[2] ?? true]] : [];
}));
let base = String(args.base || 'https://saju.blog/');
if (!base.endsWith('/')) base += '/';

const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
const genders = ['female', 'male'];
let failures = 0;

let ok = 0;
for (const element of elements) {
  for (const gender of genders) {
    for (let n = 1; n <= 10; n += 1) {
      const file = `${element}_${gender}_${String(n).padStart(2, '0')}.jpg`;
      const url = `${base}images/matches/pool/${file}`;
      try {
        const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
        const size = (await res.arrayBuffer()).byteLength;
        if (res.status === 200 && res.headers.get('content-type') === 'image/jpeg' && size > 10000) ok += 1;
        else { failures += 1; console.log('BAD', file, res.status, res.headers.get('content-type'), size); }
      } catch (error) { failures += 1; console.log('ERR', file, error.message); }
    }
  }
}
console.log(`pool images: ${ok}/100 ok`);

for (const element of elements) {
  for (const gender of genders) {
    const res = await fetch(`${base}images/matches/match_${element}_${gender}.svg`);
    const body = res.status === 200 ? await res.text() : '';
    if (!(res.status === 200 && body.includes('<svg'))) { failures += 1; console.log('BAD SVG', element, gender, res.status); }
  }
}
console.log('svgs: 10 checked');

for (const path of ['images/matches/pool/manifest.json', 'images/matches/pool/wood_female_11.jpg', 'images/matches/pool/evil.jpg']) {
  const res = await fetch(base + path);
  if (res.status !== 404) { failures += 1; console.log('ALLOWLIST LEAK', path, res.status); }
}
console.log('blocked paths: 3 checked');

console.log(failures === 0 ? 'assets: ALL OK' : `assets: ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
