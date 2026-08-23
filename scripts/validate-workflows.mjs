#!/usr/bin/env node
import { readFile } from "node:fs/promises";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

const [releaseWorkflow, codeqlWorkflow, dependabot, packageSource] = await Promise.all([
  readFile(".github/workflows/release-assurance.yml", "utf8"),
  readFile(".github/workflows/codeql.yml", "utf8"),
  readFile(".github/dependabot.yml", "utf8"),
  readFile("package.json", "utf8"),
]);
const workflows = [releaseWorkflow, codeqlWorkflow];
const packageJson = JSON.parse(packageSource);

for (const [index, workflow] of workflows.entries()) {
  const label = index === 0 ? "release assurance" : "CodeQL";
  assert(
    !workflow.includes("pull_request_target"),
    `${label} uses privileged pull_request_target.`,
  );
  assert(!workflow.includes("secrets."), `${label} references a repository or environment secret.`);
  assert(
    /permissions:\n  contents: read/.test(workflow),
    `${label} is missing a read-only workflow permission baseline.`,
  );
  assert(
    workflow.includes("cancel-in-progress: true"),
    `${label} does not cancel superseded runs.`,
  );
  assert(workflow.includes("workflow_dispatch:"), `${label} cannot be dispatched for safe review.`);
  assert(
    !/github\.event\.pull_request\.(?:title|body|head\.ref|head\.label)/.test(workflow),
    `${label} interpolates untrusted pull-request text.`,
  );

  for (const match of workflow.matchAll(/uses:\s+([^@\s]+)@([^\s#]+)(?:\s+#\s+([^\n]+))?/g)) {
    const [, action, reference, versionComment] = match;
    assert(/^[0-9a-f]{40}$/.test(reference), `${action} is not pinned to a full commit SHA.`);
    assert(/^v\d/.test(versionComment?.trim() ?? ""), `${action} pin lacks a version comment.`);
  }
}

assert(count(releaseWorkflow, /timeout-minutes:/g) === 4, "Every release job needs a timeout.");
assert(count(codeqlWorkflow, /timeout-minutes:/g) === 1, "The CodeQL job needs a timeout.");
assert(count(releaseWorkflow, /cache: npm/g) === 3, "Every install job must use npm caching.");
assert(count(releaseWorkflow, /run: npm ci/g) === 3, "Every install job must use npm ci.");
assert(
  count(releaseWorkflow, /persist-credentials: false/g) === 3 &&
    count(codeqlWorkflow, /persist-credentials: false/g) === 1,
  "Every checkout must disable persisted credentials.",
);
assert(
  releaseWorkflow.includes("include-hidden-files: true"),
  "The production artifact would omit .htaccess.",
);
assert(
  releaseWorkflow.includes("if: failure()") && releaseWorkflow.includes("retention-days: 7"),
  "Browser failure diagnostics are not bounded or failure-only.",
);
assert(
  releaseWorkflow.includes("AGPL-3.0-only") && releaseWorkflow.includes("GPL-3.0-or-later"),
  "Dependency review is missing the reciprocal-license policy.",
);
assert(
  codeqlWorkflow.includes("security-events: write") &&
    !releaseWorkflow.includes("permissions: write"),
  "Security write permission is not isolated to CodeQL.",
);

for (const command of [
  "npm run qa:source",
  "npm run build",
  "npm run qa:static",
  "npm run qa:server",
  "npm run qa:audit",
  "npm run qa:ui:chromium",
]) {
  assert(releaseWorkflow.includes(command), `Release workflow omits ${command}.`);
}
assert(
  releaseWorkflow.includes("--project=${{ matrix.project }}"),
  "Compatibility jobs do not use their fixed project matrix.",
);
assert(
  packageJson.scripts.qa.includes("qa:source") &&
    packageJson.scripts.qa.includes("qa:ui") &&
    packageJson.scripts["qa:source"].includes("format:check"),
  "Local npm run qa is not equivalent to the required workflow stages.",
);
assert(
  count(dependabot, /package-ecosystem:/g) === 2 &&
    count(dependabot, /version-update:semver-major/g) === 2,
  "Dependabot must cover npm and Actions while excluding automatic major migrations.",
);
assert(!dependabot.includes("automerge"), "Dependency updates must remain human-reviewed.");

console.log("Workflow security and release-parity validation passed.");
