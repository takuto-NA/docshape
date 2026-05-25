# docshape

Docshape is a TypeScript semantic document compiler. It validates technical writing as a typed graph before prose is finalized.

Build a DocumentFrame for normal authoring, or a SemanticDocumentGraph directly for compiler IR. Both compile against a schema and render to Markdown.

## Documentation

- [Capabilities](docs/guide/capabilities.md) — feature overview
- [Library guide](docs/guide.md) — data model, schema, compile reference
- [DocumentFrame authoring](docs/guide/frame-authoring.md) — fluent API and slots
- [Documentation index](docs/index.md)
- [Domain glossary](CONTEXT.md)

## Quick start

```bash
npm install
npm run build
node examples/library-usage-frame.mjs
```

The frame example authors a complete article in 36 lines. See [capabilities](docs/guide/capabilities.md) for the full feature list and verification commands.
