import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../style.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../script.js", import.meta.url), "utf8");

test("HTML page includes valid entry points and required sections", () => {
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html lang="uk">/);
  for (const id of ["content", "about", "projects", "workflow", "theme-toggle", "filter-count"]) {
    assert.ok(html.includes('id="' + id + '"'), "Missing id: " + id);
  }
  for (const name of ["style.css", "script.js"]) {
    assert.ok(html.includes('"' + name + '"'), "Missing asset reference: " + name);
    assert.ok(existsSync(new URL("../" + name, import.meta.url)));
  }
  assert.match(html, /Варіант 10/);
  assert.match(css, /@media\(max-width: 560px\)/);
  assert.match(css, /\.project-card\[hidden\]\s*\{\s*display:\s*none;/);
});

test("Required repository files and datasets are available", () => {
  for (const name of ["README.md", "LAB1_REPORT.md", "lab-01/README.md", "images/README.md", "sales.csv"]) {
    assert.ok(existsSync(new URL("../" + name, import.meta.url)), "Missing: " + name);
  }
  const rows = readFileSync(new URL("../sales.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  assert.equal(rows.length, 501);
  assert.equal(rows[0], "Date,Manager,Region,Product,Quantity,Price");
});

test("Theme and filtering controls respond correctly", () => {
  function makeElement(data = {}) {
    const handlers = {};
    const attrs = {};
    const classes = new Set();
    return {
      dataset: data, handlers, attrs, hidden: false, firstChild: { textContent: "☾ " },
      classList: {
        toggle(name, shouldAdd) { if (shouldAdd) classes.add(name); else classes.delete(name); },
        contains(name) { return classes.has(name); }
      },
      addEventListener(type, fn) { handlers[type] = fn; },
      setAttribute(name, value) { attrs[name] = value; },
      click() { assert.ok(handlers.click, "missing click handler"); handlers.click(); }
    };
  }

  const theme = makeElement();
  const filters = ["all", "web", "data"].map(v => makeElement({ filter: v }));
  const cards = ["web", "web", "data"].map(v => makeElement({ category: v }));
  const count = { textContent: "" };
  const doc = {
    documentElement: { dataset: {} },
    querySelector(selector) {
      return ({ "#theme-toggle": theme, "#filter-count": count })[selector] ?? null;
    },
    querySelectorAll(selector) {
      return ({ "[data-filter]": filters, "[data-category]": cards })[selector] ?? [];
    }
  };
  runInNewContext(js, { document: doc });
  theme.click();
  assert.equal(doc.documentElement.dataset.theme, "dark");
  assert.equal(theme.attrs["aria-pressed"], "true");
  theme.click();
  assert.equal(doc.documentElement.dataset.theme, "light");
  assert.equal(theme.attrs["aria-pressed"], "false");

  filters[1].click();
  assert.deepEqual(cards.map(c => c.hidden), [false, false, true]);
  assert.equal(count.textContent, "Показано робіт: 2");
  filters[2].click();
  assert.deepEqual(cards.map(c => c.hidden), [true, true, false]);
  assert.equal(count.textContent, "Показано робіт: 1");
  filters[0].click();
  assert.deepEqual(cards.map(c => c.hidden), [false, false, false]);
  assert.equal(count.textContent, "Показано робіт: 3");
});
