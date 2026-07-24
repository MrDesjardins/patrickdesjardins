// Fake ONNXRuntime node stub for environments that use only WASM
// @huggingface/transformers depends on onnxruntime-node even when using WASM.
// Use pnpm.overrides and Webpack externals to block native binaries from being bundled.
// Because using only in the browser, don't install onnxruntime-node at all.
// Use a fake stub (this file) like noop-onnxruntime-node to bypass runtime resolution issues.
export default {};
