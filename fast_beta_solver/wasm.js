import createModule from "./wasm/functions.js";

export const wasmModule = await createModule();

export const init_stack_wasm = wasmModule.cwrap('init_stack', 'void', ['number', 'number', 'number']);
export const get_solution_wasm = wasmModule.cwrap('get_solution', 'number', []);
export const find_next_solution_wasm = wasmModule.cwrap('find_next_solution', 'number', []);

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
