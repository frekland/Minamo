/**
 * Minamo V2 reference palette checks. No external packages or app mutation.
 * Run: node docs/core-learning-experience/verify-theme.mjs
 * Or:  node verify-theme.mjs --json > palette-evidence.json
 * Checks solid reference values, NOT computed browser styles, alpha composites,
 * image content, all CSS overrides, or whole-app WCAG conformance.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const css = readFileSync(fileURLToPath(new URL('./theme-tokens.css', import.meta.url)), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/(--mn-[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)].map(m => [m[1], m[2].toUpperCase()]));
function rgb(hex) {
  assert.match(hex, /^#[0-9A-Fa-f]{6}$/);
  return [1,3,5].map(i => Number.parseInt(hex.slice(i,i+2),16) / 255);
}
function luminance(hex) {
  return rgb(hex).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    .reduce((sum,c,i) => sum + c * [0.2126,0.7152,0.0722][i],0);
}
function contrast(a,b) {
  const [lo,hi] = [luminance(a),luminance(b)].sort((a,b) => a-b);
  return (hi + 0.05) / (lo + 0.05);
}
function saturation(hex) {
  const a=rgb(hex), max=Math.max(...a), min=Math.min(...a), d=max-min;
  return d === 0 ? 0 : d / (1 - Math.abs(max + min - 1));
}
const sample = {
  canvas:'#1B1B1B', raised:'#252525', secondary:'#2D2D2D', border:'#3A3A3A',
  primaryText:'#F5F5F5', mutedText:'#B1B1B1', blue:'#6CB6FF', cyan:'#43D2E6', outer:'#0E0E0E'
};
for (const [token,hex] of [
  ['--mn-canvas',sample.canvas],['--mn-surface',sample.raised],
  ['--mn-surface-secondary',sample.secondary],['--mn-border',sample.border],
  ['--mn-text',sample.primaryText],['--mn-text-muted',sample.mutedText]
]) assert.equal(tokens[token],hex,`${token}: preserve sampled neutral value`);
for (const token of ['--mn-canvas','--mn-surface','--mn-surface-secondary','--mn-border']) {
  const [r,g,b]=rgb(tokens[token]); assert.ok(r===g && g===b,`${token}: neutral, not tinted`);
}
assert.ok(saturation(tokens['--mn-interactive']) < saturation(sample.blue), 'Blue must be less saturated');
assert.ok(saturation(tokens['--mn-accent']) < saturation(sample.cyan), 'Cyan must be less saturated');
const checks=[];
function check(fg,bg,minimum,role) {
  const ratio=contrast(tokens[fg],tokens[bg]);
  checks.push({role,foreground:tokens[fg],background:tokens[bg],ratio,minimum,pass:ratio>=minimum});
  assert.ok(ratio>=minimum,`${role}: ${ratio} < ${minimum}`); // no rounding before pass/fail
}
const surfaces=['--mn-canvas','--mn-surface','--mn-surface-secondary','--mn-border','--mn-selected','--mn-annotation'];
for (const fg of ['--mn-text','--mn-text-body','--mn-text-muted','--mn-interactive','--mn-accent',
                  '--mn-status-success','--mn-status-warning','--mn-status-danger'])
  for (const bg of surfaces) check(fg,bg,4.5,'Readable text token');
for (const bg of surfaces) check('--mn-border-control',bg,3,'Required control boundary');
for (const bg of surfaces) check('--mn-focus',bg,3,'Focus on dark adjacent surface');
for (const bg of ['--mn-interactive','--mn-interactive-hover','--mn-interactive-pressed','--mn-accent','--mn-accent-hover'])
  check('--mn-on-accent',bg,4.5,'Filled action label');
for (const fg of ['--mn-code-text','--mn-code-comment','--mn-code-keyword','--mn-code-string','--mn-code-number'])
  check(fg,'--mn-code-bg',4.5,'Syntax token on code background');
const evidence={
  source:'Centre-pixel samples from owner-supplied 472x695 palette image; accents selected for this continuation brief.',
  sample, tokens, checks, count:checks.length,
  negativeExamples:[
    {role:'Subtle structural border is NOT a sufficient sole control boundary',foreground:sample.border,background:sample.raised,ratio:contrast(sample.border,sample.raised),minimum:3},
    {role:'White is NOT a suitable normal-text label on the filled blue action',foreground:sample.primaryText,background:tokens['--mn-interactive'],ratio:contrast(sample.primaryText,tokens['--mn-interactive']),minimum:4.5}
  ],
  limits:'Solid sRGB token calculations only. Actual rendered/composited states, focus visibility, typography, keyboard behaviour and full accessibility need separate browser verification.'
};
if (process.argv.includes('--json')) console.log(JSON.stringify(evidence,null,2));
else {
  console.log(`PASS: ${checks.length} contrast pairs; preserved neutrals; reduced accent saturation.`);
  for (const bg of ['--mn-canvas','--mn-surface','--mn-surface-secondary']) {
    console.log(`${tokens[bg]}: primary ${contrast(tokens['--mn-text'],tokens[bg]).toFixed(2)}:1; muted ${contrast(tokens['--mn-text-muted'],tokens[bg]).toFixed(2)}:1; blue ${contrast(tokens['--mn-interactive'],tokens[bg]).toFixed(2)}:1; cyan ${contrast(tokens['--mn-accent'],tokens[bg]).toFixed(2)}:1`);
  }
  for (const row of evidence.negativeExamples) console.log(`DO NOT USE: ${row.role} (${row.ratio.toFixed(2)}:1).`);
}

