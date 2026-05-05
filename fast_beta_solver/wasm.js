import createModule from "./wasm/functions.js";

const wasmModule = await createModule();

export const count_ones_wasm = wasmModule.cwrap('count_ones', 'number', ['number', 'number']);
export const ctz_bi_wasm = wasmModule.cwrap('ctz_bi', 'number', ['number']);
export const filter_neighbors_wasm = wasmModule.cwrap('filter_neighbors', 'number', ['number', 'number', 'number']);

const optionsLength = 256 * 4;
export const ptrOptions = wasmModule._malloc((new BigInt64Array(optionsLength)).byteLength);
export const wasmOptions = new BigUint64Array(wasmModule.HEAPU8.buffer, ptrOptions, optionsLength);

