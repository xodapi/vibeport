# Changelog

## [0.3.0] - 2026-08-14

### Added

- Model playground with OpenAI-compatible streaming delta parsing.
- Readable assistant text for non-streaming completions with JSON fallback.
- Side-by-side comparison of two models with independent latency and errors.
- Local saved prompt library and prompt history.
- Browser-local per-model cost estimates from Settings rates.
- Browser-generated local cost CSV and JSON exports.
- Vitest coverage, accessibility improvements, and secure deployment documentation.

### Known limitations

- Vimit quota monitoring requires a future Vimit server API.
- WebSocket live monitoring requires a future proxyrs WebSocket endpoint.
- VibePort does not provide multi-user authentication.
- Actual model generation remains subject to upstream provider availability and quotas.
