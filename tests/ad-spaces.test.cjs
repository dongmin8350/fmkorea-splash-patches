const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const script = fs.readFileSync('tests/ad-spaces.js', 'utf8').trim();
const kotlin = fs.readFileSync('patches/src/main/kotlin/app/dongmin8350/patches/fmkorea/CollapseAdSpacesPatch.kt', 'utf8');
assert.equal(kotlin.split('internal val FMKOREA_AD_SPACE_SCRIPT = """\n')[1].split('\n""".trimIndent()')[0], script);
const wait = () => new Promise(resolve => setTimeout(resolve, 80));
(async () => {
  const dom = new JSDOM(`<html><head></head><body>
    <nav>Navigation</nav>
    <div id="spacer" style="display:block !important;visibility:hidden;height:80px;min-height:80px;margin:10px;padding:5px"></div>
    <div id="post" style="height:80px"><p>Post body</p><video controls></video></div>
    <div id="comment" style="height:80px">Comment form<textarea></textarea></div>
    <div id="ordinary" style="height:80px"></div>
    <div id="hidden-ui" style="visibility:hidden;height:80px">Ordinary hidden UI</div>
    <div class="power_ad" id="ad">Advertisement</div>
  </body></html>`, {url: 'https://m.fmkorea.com/', runScripts:'outside-only', pretendToBeVisual:true});
  const w = dom.window, d = w.document;
  const observers = [];
  const Observer = w.MutationObserver;
  w.MutationObserver = class extends Observer { constructor(cb) { super(cb); observers.push(this); } };
  let mutations = 0;
  new w.MutationObserver(records => { mutations += records.length; }).observe(d.documentElement, {subtree:true,attributes:true,childList:true});
  w.eval(script);
  await wait();
  assert.equal(w.getComputedStyle(d.querySelector('#spacer')).display, 'none');
  assert.equal(d.querySelector('#spacer').style.minHeight, '0px');
  assert.equal(w.getComputedStyle(d.querySelector('#ad')).display, 'none');
  for (const id of ['post','comment','ordinary','hidden-ui']) assert.equal(d.getElementById(id).hasAttribute('data-dongmin-fmkorea-ad-space'), false, id);
  const baseline = mutations;
  await wait();
  assert.equal(mutations, baseline, 'observer must settle without a mutation loop');
  const dynamic = d.createElement('div');
  dynamic.style.cssText = 'visibility: hidden; height: 120px; display: block !important';
  d.body.appendChild(dynamic);
  await wait();
  assert.equal(dynamic.style.display,'none', 'late insertion must collapse');
  dynamic.style.cssText = 'visibility:hidden;height:120px;display:block!important';
  await wait();
  assert.equal(dynamic.style.display,'none', 'late style overwrite must collapse again');
  w.eval(script);
  assert.equal(d.querySelectorAll('#dongmin-fmkorea-ad-spaces-style').length,1);
  assert.equal(d.querySelector('video').hasAttribute('controls'),true);
  observers.forEach(observer => observer.disconnect());
  dom.window.close();
  const external = new JSDOM('<div style="display:block!important;visibility:hidden;height:80px"></div>', {url:'https://fmkorea.com.example.org',runScripts:'outside-only'});
  external.window.eval(script);
  assert.equal(external.window.document.querySelector('[data-dongmin-fmkorea-ad-space]'),null,'external domain excluded');
  external.window.close();
  console.log('PASS: initial/dynamic/recreated spacers, explicit ads, content/form/video preservation, domain guard, observer settling, duplicate injection, Kotlin payload parity');
})().catch(error => { console.error(error); process.exitCode=1; });
