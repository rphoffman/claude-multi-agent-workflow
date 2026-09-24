const fs = require("fs");
const path = require("path");
const errors = [];

const READ_ONLY = new Set(["Read", "Grep", "Glob"]);

function mdFiles(dir) {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
    : [];
}
function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function frontmatter(file) {
  const txt = fs.readFileSync(file, "utf8");
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}

// 1. plugin.json — valid JSON with name + version.
let pluginName = null;
if (!fs.existsSync(".claude-plugin/plugin.json")) {
  errors.push("Missing .claude-plugin/plugin.json.");
} else {
  let m;
  try {
    m = readJSON(".claude-plugin/plugin.json");
  } catch (e) {
    errors.push("plugin.json is not valid JSON: " + e.message);
  }
  if (m) {
    if (!m.name || typeof m.name !== "string")
      errors.push('plugin.json needs a non-empty "name".');
    else pluginName = m.name;
    if (!m.version) errors.push('plugin.json needs a "version".');
  }
}

// 2. Component folders must sit at the root, not inside .claude-plugin/.
for (const dir of ["commands", "agents", "skills", "hooks"]) {
  if (fs.existsSync(".claude-plugin/" + dir)) {
    errors.push(
      '"' + dir + '/" is inside .claude-plugin/ — move it to the repo root.',
    );
  }
}

// 3. agents/ — at least two, each fully scoped; one read-only and one that writes.
const agents = mdFiles("agents");
if (agents.length < 2) {
  errors.push("Need at least two subagents in agents/.");
}
let sawReadOnly = false,
  sawWriter = false;
for (const f of agents) {
  const fm = frontmatter(path.join("agents", f));
  if (!fm) {
    errors.push("agents/" + f + " needs YAML frontmatter (--- ... ---).");
    continue;
  }
  for (const key of ["name", "description", "tools", "model"]) {
    if (!fm[key])
      errors.push(
        "agents/" + f + ' is missing "' + key + '" in its frontmatter.',
      );
  }
  if (fm.tools) {
    const tools = fm.tools
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tools.every((t) => READ_ONLY.has(t))) sawReadOnly = true;
    if (tools.some((t) => t === "Write" || t === "Edit")) sawWriter = true;
  }
}
if (agents.length >= 2 && !sawReadOnly) {
  errors.push(
    "At least one subagent must be read-only (tools limited to Read/Grep/Glob).",
  );
}
if (agents.length >= 2 && !sawWriter) {
  errors.push(
    "At least one subagent must be able to change code (tools include Write or Edit).",
  );
}

// 4. commands/ — at least one, non-trivial.
const cmds = mdFiles("commands");
if (cmds.length < 1) {
  errors.push("Need a workflow command in commands/.");
} else if (
  fs.readFileSync(path.join("commands", cmds[0]), "utf8").trim().length < 60
) {
  errors.push(
    "commands/" + cmds[0] + " looks empty — write the orchestration.",
  );
}

// 5. skills/<name>/SKILL.md with name + description.
let skillOk = false;
if (fs.existsSync("skills")) {
  for (const d of fs.readdirSync("skills")) {
    const sp = path.join("skills", d, "SKILL.md");
    if (fs.existsSync(sp)) {
      const fm = frontmatter(sp);
      if (fm && fm.name && fm.description) skillOk = true;
      else errors.push(sp + " needs frontmatter with a name and description.");
    }
  }
}
if (!skillOk && !errors.some((e) => e.includes("SKILL.md"))) {
  errors.push("Need a skill at skills/<name>/SKILL.md.");
}

// 6. hooks/hooks.json — valid JSON, no hardcoded absolute paths.
if (!fs.existsSync("hooks/hooks.json")) {
  errors.push("Need a hook at hooks/hooks.json.");
} else {
  const txt = fs.readFileSync("hooks/hooks.json", "utf8");
  try {
    JSON.parse(txt);
  } catch (e) {
    errors.push("hooks/hooks.json is not valid JSON: " + e.message);
  }
  if (
    /"[^"]*\/(Users|home|root|var|etc|opt)\//.test(txt) ||
    /[A-Za-z]:\\\\/.test(txt)
  ) {
    errors.push(
      "hooks.json has a hardcoded absolute path — use ${CLAUDE_PLUGIN_ROOT} for bundled scripts.",
    );
  }
}

// 7. marketplace.json — valid, lists the plugin by matching name + a source.
if (!fs.existsSync(".claude-plugin/marketplace.json")) {
  errors.push("Missing .claude-plugin/marketplace.json.");
} else {
  let mk;
  try {
    mk = readJSON(".claude-plugin/marketplace.json");
  } catch (e) {
    errors.push("marketplace.json is not valid JSON: " + e.message);
  }
  if (mk) {
    const plugins = Array.isArray(mk.plugins) ? mk.plugins : [];
    if (plugins.length === 0)
      errors.push("marketplace.json must list at least one plugin.");
    else {
      const entry = plugins.find((p) => p && p.name === pluginName);
      if (pluginName && !entry)
        errors.push(
          'marketplace.json must list your plugin under the same "name" as plugin.json ("' +
            pluginName +
            '").',
        );
      if (entry && !entry.source)
        errors.push('the marketplace entry needs a "source" (use "./").');
    }
  }
}

// 8. README.md + a non-trivial NOTES.md.
if (!fs.existsSync("README.md")) errors.push("Missing README.md.");
if (!fs.existsSync("NOTES.md")) errors.push("Missing NOTES.md.");
else if (fs.readFileSync("NOTES.md", "utf8").trim().length < 200) {
  errors.push(
    "NOTES.md is too short — cover install, one scoping decision, one orchestration decision.",
  );
}

if (errors.length) {
  console.error("Plugin validation failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("Plugin structure looks complete \u2713");
