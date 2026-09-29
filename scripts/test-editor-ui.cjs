const { chromium } = require("playwright");
const { spawn } = require("node:child_process"),
  fs = require("node:fs"),
  assert = require("node:assert/strict");
(async () => {
  const routes = ["src/app/qa-editor", "src/app/qa-server"];
  for (const route of routes)
    if (fs.existsSync(route))
      throw new Error("Test route already exists: " + route);
  for (const route of routes) fs.mkdirSync(route, { recursive: true });
  fs.copyFileSync(
    "tests/fixtures/editor-page.tsx.fixture",
    routes[0] + "/page.tsx",
  );
  fs.copyFileSync(
    "tests/fixtures/profile-server-page.tsx.fixture",
    routes[1] + "/page.tsx",
  );
  const log = fs.openSync("/tmp/qg-visual-server.log", "w");
  const server = spawn(
    "node",
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3100",
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "qa-local-only",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", log, log],
    },
  );
  let browser;
  try {
    for (let i = 0; i < 120; i++) {
      try {
        await fetch("http://127.0.0.1:3100/qa-editor");
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    browser = await chromium.launch({
      executablePath: process.env.QG_BROWSER_PATH || undefined,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:3100/qa-editor", {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page.locator(".qgWritingArea").first().waitFor({ timeout: 60000 });
    const sizes = [320, 360, 390, 600, 768, 1024, 1366, 1920, 2560];
    const results = [];
    for (const width of sizes) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({ path: `/tmp/qg-${width}.png`, fullPage: true });
      results.push(
        await page.evaluate(() => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
          portrait: document
            .querySelector(".qgPortrait")
            .getBoundingClientRect()
            .toJSON(),
          heading: document
            .querySelector("h1")
            .getBoundingClientRect()
            .toJSON(),
          outside: [
            ...document.querySelectorAll(".qgPortrait,.qgEditor,.memberPlate"),
          ]
            .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
            .map((e) => e.className),
        })),
      );
    }
    fs.writeFileSync(
      "/tmp/qg-visual-results.json",
      JSON.stringify({ results, errors }, null, 2),
    );
    await page.setViewportSize({ width: 390, height: 1000 });
    await page
      .locator(".profileV2Hero")
      .screenshot({ path: "/tmp/qg-profile-close.png" });
    const ed = page.locator(".qgWritingArea").first();
    await ed.fill("Kalın metin");
    await ed.press("Control+a");
    await ed.press("Control+b");
    await page
      .getByRole("button", { name: "Bağlantı (Ctrl/Cmd+K)", exact: true })
      .first()
      .click();
    await page
      .getByRole("textbox", { name: "Bağlantı adresi" })
      .fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Uygula", exact: true }).click();
    assert(await page.locator(".qgEditor [role=alert]").isVisible());
    await page
      .getByRole("textbox", { name: "Bağlantı adresi" })
      .fill("https://example.org");
    await page.getByRole("button", { name: "Uygula", exact: true }).click();
    await page
      .getByRole("button", { name: "Test kaydet", exact: true })
      .click();
    assert.equal(
      await page.locator("[data-testid=saved] strong").innerText(),
      "Kalın metin",
    );
    assert.equal(
      await page.locator("[data-testid=saved] a").getAttribute("href"),
      "https://example.org/",
    );
    await page.getByText("Yeniden düzenle", { exact: true }).click();
    assert.equal(
      await page.locator(".qgWritingArea").last().innerText(),
      "Kalın metin",
    );
    await ed.fill("Word içeriği");
    await ed.press("Control+a");
    await ed.evaluate((el) => {
      const d = new DataTransfer();
      d.setData("text/html", "<p><b>Word kalın</b> <i>italik</i></p>");
      el.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: d,
        }),
      );
    });
    await page
      .getByRole("button", { name: "Test kaydet", exact: true })
      .click();
    assert.equal(
      await page.locator("[data-testid=saved] strong").innerText(),
      "Word kalın",
    );
    assert.equal(
      await page.locator("[data-testid=saved] em").innerText(),
      "italik",
    );
    await ed.press("Control+a");
    await ed.press("Control+k");
    assert(
      await page
        .getByRole("textbox", { name: "Bağlantı adresi" })
        .evaluate((el) => el === document.activeElement),
    );
    await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
    await page.locator(".qgEditorToolbar summary").first().click();
    await page
      .getByRole("button", { name: "İki yana", exact: true })
      .first()
      .click();
    assert(
      await ed
        .locator("p")
        .first()
        .evaluate((el) => el.style.textAlign === "justify"),
    );
    await page
      .getByRole("button", { name: "3 × 3 tablo ekle", exact: true })
      .first()
      .click();
    assert.equal(await ed.locator("table").count(), 1);
    await ed.locator("th").first().click();
    await page.keyboard.type("Tablo");
    await page
      .getByRole("button", { name: "Test kaydet", exact: true })
      .click();
    assert.equal(await page.locator("[data-testid=saved] table").count(), 1);
    await ed.fill("");
    const old = await page.locator("[data-testid=saved]").innerHTML();
    await page
      .getByRole("button", { name: "Test kaydet", exact: true })
      .click();
    assert.equal(await page.locator("[data-testid=saved]").innerHTML(), old);
    await page.goto("http://127.0.0.1:3100/qa-server", {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    assert.equal(
      await page.locator(".playerBio strong").innerText(),
      "Sunucudan",
    );
    assert.equal(await page.locator(".qgPortrait svg").count(), 1);
    await page
      .getByRole("button", { name: "PROFİLİ DÜZENLE", exact: true })
      .click();
    await page.locator(".profileEditSheet .qgWritingArea").waitFor();
    assert(await page.locator(".profileEditSheet .qgEditor").isVisible());
    await page.screenshot({
      path: "/tmp/qg-profile-modal.png",
      fullPage: true,
    });
    fs.writeFileSync(
      "/tmp/qg-visual-results.json",
      JSON.stringify({ results, errors }, null, 2),
    );
    assert.equal(errors.length, 0, errors.join("\n"));
    for (const r of results) {
      assert(r.scroll <= r.width + 1, `Overflow ${r.width}: ${r.scroll}`);
      assert.equal(r.outside.length, 0);
    }
    console.log(
      "PASS: nine viewports, keyboard shortcuts, links, Word paste, alignment, tables, validation, save/reopen, server rendering and profile modal.",
    );
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
    for (const route of routes)
      fs.rmSync(route, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
