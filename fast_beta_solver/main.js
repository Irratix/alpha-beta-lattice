import {
    wasmModule,
    init_stack_wasm,
    get_solution_wasm,

    ptrOptions,
    wasmOptions,
    ptrLattice,
    wasmLattice,
    ptrPlaced,
    wasmPlaced,
    find_next_solution_wasm
} from './wasm.js';
import { nextFrame, draw_lattice } from './view.js';

const SOL_AMT = 1000;

export const initial_filter = function (options) {
    for (let i = 0; i < 256; i++) {
        if (i & 0b11000001) {
            options[4 * i] &= 0xffffffffffff0000n;
        }
        if (i & 0b00000111) {
            options[4 * i] &= 0x7fff7fff7fff7fffn;
            options[4 * i + 1] &= 0x7fff7fff7fff7fffn;
            options[4 * i + 2] &= 0x7fff7fff7fff7fffn;
            options[4 * i + 3] &= 0x7fff7fff7fff7fffn;
        }
        if (i & 0b00011100) {
            options[4 * i + 3] &= 0x0000ffffffffffffn;
        }
        if (i & 0b01110000) {
            options[4 * i] &= 0xfffefffefffefffen;
            options[4 * i + 1] &= 0xfffefffefffefffen;
            options[4 * i + 2] &= 0xfffefffefffefffen;
            options[4 * i + 3] &= 0xfffefffefffefffen;
        }
    }
    console.log(options);
    return options;
}


export const get_solution = function () {
    const ptr = get_solution_wasm();
    return new Int16Array(wasmModule.HEAPU8.buffer, ptr, 256);
}


const solve = async function () {
    const lattice = new Int16Array(256).fill(-1);
    const placed = new Int16Array(256).fill(-1);
    let options = new BigUint64Array(256 * 4).fill(0xffffffffffffffffn);

    options = initial_filter(options);

    wasmLattice.set(lattice);
    wasmPlaced.set(placed);
    wasmOptions.set(options);
    init_stack_wasm(ptrLattice, ptrOptions, ptrPlaced);

    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 160;
    const ctx = c.getContext("2d");

    for (let i = 0; i < SOL_AMT; i++) {
        find_next_solution_wasm();
        const result = get_solution();
        lattice.set(result);
        draw_lattice(lattice);
        await nextFrame();
        console.log(i);
    }
};

(async () => {
    const t = new Date();
    await solve();
    console.log("done!");
    console.log("took", (new Date() - t) / 1000, "seconds");
})();
