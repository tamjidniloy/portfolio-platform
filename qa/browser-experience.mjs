import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";
if (new URL(base).hostname !== "127.0.0.1") throw new Error("Browser QA only runs on CI loopback");

const browser = await chromium.launch({
  headless: true, executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "dark" });
  const page = await context.newPage();

  for (const [width,height] of [[320,700],[390,844],[768,1024],[1440,900],[1920,1080]]) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1, "Single semantic hero heading");
    assert.equal(await page.getByRole("link", { name: /owner login/i }).count() > 0, true);
    const overflowing = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflowing <= 2, "No horizontal overflow at " + width + "px; exceeded by " + overflowing);
    const main = await page.locator("main#main").count();
    assert.equal(main, 1, "Main content landmark exists");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  assert.equal(await menu.isVisible(), true);
  await menu.click();
  assert.equal(await page.getByRole("button", { name: "Close navigation menu" }).getAttribute("aria-expanded"), "true");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Selected work" }).click();
  assert.match(page.url(), /#work$/);

  const toggle = page.getByRole("button", { name: "Switch to light mode" });
  await toggle.click();
  assert.equal(await page.locator("html").getAttribute("data-color-mode"), "light");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-color-mode"), "light", "Theme persists after reload");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();

  const motion = await page.locator(".exp-art-sphere").evaluate((element) => getComputedStyle(element).animationName);
  assert.equal(motion, "none", "Reduced-motion preference disables continuous hero animation");

  const accessible = await new AxeBuilder({ page }).analyze();
  const severe = accessible.violations.filter((item) => ["critical","serious"].includes(item.impact));
  assert.deepEqual(severe.map((v) => v.id + ": " + v.nodes[0]?.failureSummary), [], "Public landing page serious WCAG failures");

  await page.goto(base + "/admin/login", { waitUntil: "networkidle" });
  const password = page.getByLabel("Password", { exact: true });
  assert.equal(await password.getAttribute("type"), "password");
  await page.getByRole("button", { name: "Show password" }).click();
  assert.equal(await password.getAttribute("type"), "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  assert.equal(await password.getAttribute("type"), "password");
  const loginAxe = await new AxeBuilder({ page }).analyze();
  const loginSevere = loginAxe.violations.filter((v) => ["critical", "serious"].includes(v.impact));
  if (loginSevere.length) {
    console.error("Login accessibility findings:", JSON.stringify(loginSevere.map((v) => ({
      id: v.id, nodes: v.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }))));
  }
  assert.deepEqual(loginSevere.map((v) => v.id), []);

  console.info("UI QA: five viewports, mobile navigation, persistent themes, reduced motion, login visibility and accessibility passed.");
  await context.close();
} finally {
  await browser.close();
}
