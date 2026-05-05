import createModule from "./wasm/functions.js";

const wasmModule = await createModule();

export const ctz_bi_wasm = wasmModule.cwrap('ctz_bi', 'number', ['number']);
export const place_number_wasm = wasmModule.cwrap('place_number', 'number', ['number', 'number', 'number', 'number', 'number']);
export const select_idx_wasm = wasmModule.cwrap('select_idx', 'void', ['number', 'number', 'number']);

const optionsLength = 256 * 4;
export const ptrOptions = wasmModule._malloc((new BigInt64Array(optionsLength)).byteLength);
export const wasmOptions = new BigUint64Array(wasmModule.HEAPU8.buffer, ptrOptions, optionsLength);

const latticeLength = 256;
export const ptrLattice = wasmModule._malloc((new Int16Array(latticeLength)).byteLength);
export const wasmLattice = new Int16Array(wasmModule.HEAPU8.buffer, ptrLattice, latticeLength);

const placedLength = 256;
export const ptrPlaced = wasmModule._malloc((new Int16Array(placedLength)).byteLength);
export const wasmPlaced = new Int16Array(wasmModule.HEAPU8.buffer, ptrPlaced, placedLength);

export const ptrIdx = wasmModule._malloc(2 * 4);
export const wasmIdx = new Int32Array(wasmModule.HEAPU8.buffer, ptrIdx, 2);
