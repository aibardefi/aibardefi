/**
 * Generic page checker: node check.js <file.html> [selector-to-click ...]
 *
 * Enforces the two invariants that page 1 and page 2 both broke:
 *   - the stage is never taller than the viewport (no content below the fold)
 *   - the document never scrolls sideways
 * Plus: nothing visible ends up outside the viewport, and reduced-motion still
 * reaches a usable end state.
 */
const { chromium } = require("playwright");
const path = require("path");

const DIR = "/tmp/claude-0/-home-user-aibardefi/f797f631-4e73-57a8-91a4-bd714e3caf03/scratchpad";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const file = process.argv[2];
const clicks = process.argv.slice(3);
if (!file) {
  console.error("usage: node check.js <file.html> [selector ...]");
  process.exit(2);
}
const name = path.basename(file, ".html");
const URL = "file://" + path.join(DIR, file);

const SIZES = [
  { name: "desktop", w: 1440, h: 900 },
  { name: "laptop", w: 1280, h: 720 },
  { name: "phone", w: 390, h: 844 },
];

const probe = () => {
  const stage = document.querySelector(".stage");
  const out = {
    viewport: { w: innerWidth, h: innerHeight },
    stageH: Math.round(stage.getBoundingClientRect().height),
    docScrollW: document.documentElement.scrollWidth,
    overflowing: [],
  };
  // Anything visible poking outside the viewport horizontally.
  document.querySelectorAll(".stage *").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    if (b.right > innerWidth + 1 || b.left < -1) {
      out.overflowing.push(
        (el.id || el.className || el.tagName) +
          " [" + Math.round(b.left) + ".." + Math.round(b.right) + "]"
      );
    }
  });
  out.overflowing = out.overflowing.slice(0, 6);
  return out;
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  let fail = 0;

  for (const s of SIZES) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await page.goto(URL);
    await page.waitForTimeout(600);

    console.log("\n=== " + name + " · " + s.name + " " + s.w + "x" + s.h + " ===");
    let m = await page.evaluate(probe);
    console.log("idle:", JSON.stringify(m));
    if (m.docScrollW > s.w) {
      console.log("  FAIL idle horizontal scroll " + m.docScrollW + " > " + s.w);
      fail++;
    }
    await page.screenshot({ path: path.join(DIR, name + "-" + s.name + "-idle.png") });

    for (const sel of clicks) {
      const el = await page.$(sel);
      if (!el) {
        console.log("  FAIL selector not found: " + sel);
        fail++;
        continue;
      }
      await el.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1600);
    }
    if (clicks.length) {
      await page.waitForTimeout(1600);
      m = await page.evaluate(probe);
      console.log("acted:", JSON.stringify(m));
      await page.screenshot({
        path: path.join(DIR, name + "-" + s.name + "-acted.png"),
      });
    }

    if (m.stageH > s.h + 1) {
      console.log("  FAIL stage " + m.stageH + " taller than viewport " + s.h);
      fail++;
    }
    if (m.docScrollW > s.w) {
      console.log("  FAIL horizontal scroll " + m.docScrollW + " > " + s.w);
      fail++;
    }
    if (m.overflowing.length) {
      console.log("  FAIL off-screen: " + m.overflowing.join(" | "));
      fail++;
    }
    await page.close();
  }

  // Reduced motion must still be usable.
  const rm = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    reducedMotion: "reduce",
  });
  await rm.goto(URL);
  await rm.waitForTimeout(300);
  for (const sel of clicks) {
    await rm.click(sel, { force: true }).catch(() => {});
    await rm.waitForTimeout(250);
  }
  const red = await rm.evaluate(probe);
  console.log("\n=== reduced-motion 1280x720 ===");
  console.log(JSON.stringify(red));
  if (red.stageH > 721 || red.docScrollW > 1280) {
    console.log("  FAIL reduced-motion layout broke");
    fail++;
  }
  await rm.screenshot({ path: path.join(DIR, name + "-reduced.png") });
  await rm.close();

  await browser.close();
  console.log(fail === 0 ? "\n" + name + ": ALL CHECKS PASSED" : "\n" + name + ": " + fail + " CHECK(S) FAILED");
  process.exit(fail === 0 ? 0 : 1);
})();
