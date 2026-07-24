# Five-package npm release pipeline

## Goal

Update the tag-triggered GitHub Actions release workflow so it validates and
publishes all five public Navii SDK packages:

- `@usenavii/core`
- `@usenavii/react`
- `@usenavii/react-native`
- `@usenavii/vue`
- `@usenavii/svelte`

## Design

Keep the existing npm token authentication, tag trigger, test job, Docker image
job, and GitHub release-notes job.

The npm job will:

1. Install the workspace dependencies.
2. Build all five public SDK packages.
3. Copy the root changelog into every package.
4. Verify before publishing that:
   - all five packages have the same version;
   - each framework adapter depends on the matching core version;
   - each package can produce a publishable tarball.
5. Publish packages sequentially in dependency order: core, React, React Native,
   Vue, then Svelte.
6. Query npm before each publish and skip that package when the exact version
   already exists.

Sequential publishing is intentional. A matrix could publish adapters before
the matching core version is available and would make partial failures harder
to diagnose.

## Failure handling

Any failed build, version check, dependency check, pack check, or publish stops
the npm job. Rerunning the workflow is safe because packages already present on
npm are skipped.

npm publication cannot be transactional, so a failure after one package is
published may leave a partial release temporarily. The idempotent registry
checks make the next workflow run resume at the first unpublished package.

## Validation

Validate the edited workflow by:

- parsing the YAML;
- running the repository build, typecheck, and test commands;
- inspecting the final diff to confirm all five packages appear in build,
  changelog, preflight, and publish phases.

Changelog finalization and creation of the release tag are outside this change.
