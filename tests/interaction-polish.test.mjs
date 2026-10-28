import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),tailwind=createRequire(require.resolve('@tailwindcss/postcss')),postcss=tailwind('postcss');
const css=readFileSync(new URL('../app/interaction-polish.css',import.meta.url),'utf8'),sheet=postcss.parse(css);
const declarations=rule=>Object.fromEntries(rule.nodes.filter(node=>node.type==='decl').map(node=>[node.prop,{value:node.value,important:node.important}]));
const rules=selector=>{const found=[];sheet.walkRules(rule=>{if(rule.selector.includes(selector))found.push(rule);});return found;};
test('header and toolbar icon controls keep 44px targets in layout with centred 20px glyphs',()=>{
 const targets=rules('.v2-app :is(.v2-icon, .v2-header-mark)').find(rule=>declarations(rule)['min-width']);assert.ok(targets);const d=declarations(targets);assert.equal(d['min-width'].value,'44px');assert.equal(d['min-height'].value,'44px');assert.equal(d.position.value,'relative');assert.equal(d['align-items'].value,'center');assert.equal(d['justify-content'].value,'center');assert.equal(d.background.value,'transparent');assert.equal(d['box-shadow'].value,'none');assert.equal(d['min-width'].important,true);assert.match(targets.selector,/\.rn-window-actions > details > summary/,'Notes window menu trigger needs the same44px icon hit target');
 const icons=rules('.v2-header-mark) > svg').find(rule=>declarations(rule).width?.value==='20px');assert.ok(icons);assert.equal(declarations(icons).height.value,'20px');
 const labelled=rules('.wp-context-actions :is(button, a)').find(rule=>declarations(rule)['min-height']);assert.equal(declarations(labelled)['min-height'].value,'44px');assert.equal(declarations(labelled).width,undefined,'Text actions must not inherit square icon widths');
 const toolbar=rules('.nw-format-tools [role=toolbar]').find(rule=>declarations(rule)['flex-wrap']);assert.equal(declarations(toolbar)['flex-wrap'].value,'wrap');assert.equal(declarations(toolbar)['max-width'].value,'100%');
});
test('translucency and elevation apply only to transient surfaces and preserve native modal geometry',()=>{
 const surfaces=rules('.ri-overlay)').find(rule=>declarations(rule)['backdrop-filter']);assert.ok(surfaces);const d=declarations(surfaces);assert.equal(d['backdrop-filter'].value,'blur(16px) saturate(180%)');assert.equal(d['border-radius'].value,'var(--ip-radius-surface)');assert.equal(d.position,undefined);assert.equal(d.display,undefined,'Shared polish must not force a closed native dialog visible');
 assert.ok(rules('dialog[data-overlay-origin=top-right]').some(rule=>declarations(rule)['--ip-origin']?.value==='right top'));
 const scrim=rules('dialog::backdrop').find(rule=>declarations(rule).background);assert.equal(declarations(scrim).animation.value,'ip-opacity-in .2s ease-out both');assert.equal(declarations(scrim)['backdrop-filter'].value,'none');
 const root=rules(':root')[0],vars=declarations(root);assert.match(vars['--ip-surface'].value,/var\(--mn-surface\)/);assert.ok((vars['--ip-shadow'].value.match(/,/g)||[]).length>=3,'Soft elevation uses several small shadow layers');
});
test('reduced motion disables effect transforms without flattening React Flow/diagram geometry',()=>{
 for(const query of ['prefers-reduced-motion: reduce','forced-colors: active'])assert.ok(sheet.nodes.some(node=>node.type==='atrule'&&node.name==='media'&&node.params.includes(query)));
 const motion=[];sheet.walkRules(rule=>{const d=declarations(rule);if(d.transform?.value==='none')motion.push(rule);});assert.ok(motion.length>=2);for(const rule of motion){assert.doesNotMatch(rule.selector,/dialog\s+\*/,'An arbitrary dialog descendant may be a positioned graph node');assert.doesNotMatch(rule.selector,/react-flow|svg|\.rn-reader/);assert.equal(declarations(rule).animation.value,'none');assert.equal(declarations(rule).transition.value,'none');}
 assert.ok(motion.some(rule=>rule.selector.includes('body:has(.v2-app[data-motion=reduce])')),'Saved Minamo motion preference also reaches portal surfaces');
 const scrim=rules('.mn-popover-scrim.nw-recent-scrim')[0];assert.equal(declarations(scrim).position.value,'fixed');assert.equal(declarations(scrim)['min-height'].value,'0','Dismissal scrim must not become an icon button');
});
test('premium refinements keep reading selectable, modal input usable, and toast placement stable',()=>{
 const titles=rules('.rn-reader h1.le-canonical-stage-heading')[0];assert.equal(declarations(titles)['font-size'].value,'clamp(25px, 22px + 1vw, 32px)');
 const selection=[];sheet.walkRules(rule=>{if(declarations(rule)['user-select']?.value==='none')selection.push(rule);});assert.equal(selection.length,1);assert.match(selection[0].selector,/button, summary, \[role=button\]/);assert.match(selection[0].selector,/:not\(\[contenteditable=true\]\)/);
 assert.doesNotMatch(css,/touch-action:\s*none/);assert.doesNotMatch(css,/mask-image|mask:\s*linear-gradient/,'Unneeded scroll masks must not hide controls or reading');
 const lock=rules('body:has(dialog[open]) .v2-main')[0];assert.equal(declarations(lock).overflow.value,'hidden');assert.doesNotMatch(lock.selector,/textarea|project-dialog-body|ux-search-dialog-results/);
 const toasts=rules('.mn-action-toast');for(const rule of toasts){const d=declarations(rule);assert.equal(d.position,undefined);assert.equal(d.bottom,undefined);assert.equal(d.left,undefined);assert.equal(d.right,undefined);}
 const pressed=rules('.nw-format-tools [role=toolbar] > button:active:not(:disabled) > svg')[0];assert.equal(declarations(pressed).scale.value,'.94');assert.doesNotMatch(pressed.selector,/react-flow|svg\s+\*/);
 const disclosure=rules('::details-content').find(rule=>declarations(rule)['grid-template-rows']?.value==='1fr');assert.ok(disclosure);assert.match(disclosure.selector,/\.nw-format-settings, \.v2-composer-links/);assert.equal(declarations(disclosure)['content-visibility'],undefined,'Native closed disclosure focus semantics must not be overridden');
});
