# docshape

Docshape is a TypeScript semantic document compiler. It validates technical writing as a typed graph before prose is finalized. Structural compile checks semantic link reading order and concept reference availability.

Authoring is semantic-first: fill paragraph-level meaning with `.fillSemantic()`, validate structure, then add sentence prose with `.fillProse()` and render Markdown. Low-level graph construction remains available for compiler IR.

## Documentation

- [Capabilities](docs/guide/capabilities.md) — what the library can do now
- [Structural reader validation](docs/guide/structural-reader-validation.md) — Discourse Flow + Definition Flow overview
- [Discourse Flow validation](docs/guide/discourse-flow.md) — reading-order checks for semantic links
- [Definition Flow validation](docs/guide/definition-flow.md) — concept reference checks in semantic payloads
- [Library guide](docs/guide.md) — data model, schema, compile reference
- [DocumentFrame authoring](docs/guide/frame-authoring.md) — semantic fill, prose fill, paragraph patterns
- [Documentation index](docs/index.md)
- [Domain glossary](CONTEXT.md)

## Quick start

```bash
npm install
npm run build
node examples/library-usage-frame.mjs
```

The example prints structural valid before prose, then renderable valid after prose fill. See [capabilities](docs/guide/capabilities.md) for the full feature list.
