import {
    ptrOptions,
    ptrLattice,
    ptrPlaced,
    wasmOptions,
    wasmLattice,
    wasmPlaced,
    ptrIdx,
    wasmIdx,
    ctz_bi_wasm,
    select_idx_wasm

} from './wasm.js';

// gets the exponent of 2 of the lowest bit in a bigint
export const ctz_bi = function (n) {
    return ctz_bi_wasm(n);
}

// this uses a hybrid approach:
// both assigning a position to a number and assigning a number to a position are possible
// we always take the option with the fewest available option, to reduce the branch factor as much as possible
export const select_next_idx = function (lattice, options, placed) {
    wasmLattice.set(lattice);
    wasmOptions.set(options);
    wasmPlaced.set(placed);
    select_idx_wasm(ptrLattice, ptrOptions, ptrPlaced, ptrIdx);

    return {
        number: wasmIdx[0],
        type: wasmIdx[1] ? "pos_to_num" : "num_to_pos"
    };
}
