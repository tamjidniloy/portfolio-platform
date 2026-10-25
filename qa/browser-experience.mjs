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
  // Keep ephemeral CI case-study images deterministic and independent of third-party hosts.
  const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Iu8AAAAASUVORK5CYII=", "base64");
  await page.route("https://images.example.test/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: pixel }));


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

  // The preceding disposable authenticated integration fixture publishes real
  // strings through the CMS. Verify visual features against those records only.
  const journeyTitles = await page.locator(".journey-card h3").allTextContents();
  assert.deepEqual(journeyTitles, ["BSc in CSE", "Junior Developer"],
    "Mixed education and work timeline must be chronological");
  assert.equal(await page.getByRole("img", { name: "Python" }).count(), 1,
    "Skill logo ribbon must expose the authentic technology name accessibly");
  assert.equal(await page.getByRole("img", { name: "React.js" }).count(), 1);
  assert.equal(await page.getByRole("img", { name: "TypeScript" }).count(), 1);
  assert.equal(await page.locator(".exp-art-sphere img").count(), 1,
    "Owner's published portrait must appear in the enhanced cinematic hero");
  assert.equal(await page.getByRole("form", { name: "Send a portfolio enquiry" }).count(), 1,
    "Portfolio contact form is visible");
  assert.equal(await page.getByRole("button", { name: /Send message/ }).isEnabled(), true,
    "Verified configured delivery can accept a visitor enquiry");
  const pauseMotion = page.getByRole("button", { name: "Pause technology animation" });
  await pauseMotion.click();
  assert.equal(await page.getByRole("button", { name: "Resume technology animation" }).count(), 1);
  const reducedRibbon = await page.locator(".folio-logo-track").evaluate((element) => getComputedStyle(element).animationName);
  assert.equal(reducedRibbon, "none", "Logo strip respects reduced motion");

  const accessible = await new AxeBuilder({ page }).analyze();
  const severe = accessible.violations.filter((item) => ["critical","serious"].includes(item.impact));
  assert.deepEqual(severe.map((v) => v.id + ": " + v.nodes[0]?.failureSummary), [], "Public landing page serious WCAG failures");

  // Auth smoke publishes this real-CMS fixture to disposable CI PostgreSQL first.
  await page.keyboard.press("Control+k");
  assert.equal(await page.getByRole("dialog", { name: "Where to?" }).isVisible(), true, "Keyboard command opens the searchable deck");
  await page.getByRole("combobox", { name: "Search pages and projects" }).fill("CI Project Atlas");
  await page.getByRole("option", { name: /CI Project Atlas/ }).click();
  await page.waitForURL(/\/projects\/ci-case-study$/, { timeout: 10000 });
  assert.match(page.url(), /\/projects\/ci-case-study$/, "A published project opens a dedicated case study route");
  assert.equal(await page.getByRole("heading", { level: 1, name: "CI Project Atlas" }).count(), 1);
  assert.equal(await page.getByRole("heading", { name: "From concept to completion." }).count(), 1);
  const comparison = page.locator("#sig-comparison-range");
  assert.equal(await comparison.inputValue(), "50");
  await comparison.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await comparison.inputValue(), "51", "Transformation slider responds to keyboard");

  await page.getByRole("tab", { name: /Engineering/ }).click();
  assert.match(await page.getByRole("tabpanel").innerText(), /SSR pages read published CMS content/);
  await page.getByRole("tab", { name: /Impact/ }).click();
  assert.match(await page.getByRole("tabpanel").innerText(), /Verified project navigation/);
  await page.keyboard.press("Control+k");
  assert.equal(await page.getByRole("dialog", { name: "Where to?" }).isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog", { name: "Where to?" }).count(), 0);
  assert.equal(await page.getByRole("button", { name: "Open command deck" })
    .evaluate((element) => document.activeElement === element), true,
    "Closing the command deck restores keyboard focus");
  const caseAxe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    caseAxe.violations.filter((item) => ["critical", "serious"].includes(item.impact)).map((v) => v.id),
    [], "Project detail must have no critical or serious accessibility violations",
  );

  const sitemap = await page.request.get(base + "/sitemap.xml");
  assert.equal(sitemap.status(), 200, "Published portfolio has an XML sitemap");
  assert.match(await sitemap.text(), /\/projects\/ci-case-study/, "Sitemap includes published project");
  const briefResponse = await page.goto(base + "/brief", { waitUntil: "networkidle" });
  assert.equal(briefResponse.status(), 200, "Professional brief renders with SSR");
  assert.equal(await page.getByRole("heading", { level: 1, name: "CI Published Developer" }).count(), 1);
  assert.equal(await page.getByRole("link", { name: /CI Project Atlas/ }).count() > 0, true);
  const labResponse = await page.goto(base + "/lab", { waitUntil: "networkidle" });
  assert.equal(labResponse.status(), 200, "Interactive Creative Lab renders with SSR");
  assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
  assert.match(await page.getByRole("status").first().innerText(), /contrast ratio/);
  await page.getByRole("button", { name: /Play motion/ }).click();
  assert.equal(await page.getByText("Position: end").count(), 1, "Motion experiment responds to interaction");
  const labAxe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(labAxe.violations.filter((item) => ["critical","serious"].includes(item.impact)).map((v) => v.id), [],
    "Creative Lab must have no critical or serious accessibility violations");

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
