import {
    ptrOptions,
    wasmOptions,
    filter_neighbors_wasm
} from './wasm.js';

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

const filter_by_position = function (options, position, except) {
    for (let i = 0; i < 256; i++) {
        if (i === except) continue;
        options[4 * i + (position >> 6)] &= 0xffffffffffffffffn ^ (1n << BigInt(position & 63));
    }
    return options;
}

// define neighbor offsets and corresponding bits
// this is used for the filter_neighbors function below
const neighbors = [
    { dx: 1, dy: -1, bit: 0, opp: 4 },
    { dx: 1, dy: 0, bit: 1, opp: 5 },
    { dx: 1, dy: 1, bit: 2, opp: 6 },
    { dx: 0, dy: 1, bit: 3, opp: 7 },
    { dx: -1, dy: 1, bit: 4, opp: 0 },
    { dx: -1, dy: 0, bit: 5, opp: 1 },
    { dx: -1, dy: -1, bit: 6, opp: 2 },
    { dx: 0, dy: -1, bit: 7, opp: 3 }
];

const filter_neighbors = function (options, number, position) {
    wasmOptions.set(options);
    const result = filter_neighbors_wasm(ptrOptions, number, position);
    options.set(wasmOptions);
    return options;

    // const x = position % 16;
    // const y = (position / 16) | 0;

    // for (let n of neighbors) {
    //     const nx = x + n.dx;
    //     const ny = y + n.dy;

    //     // skip off-board neighbors
    //     if (nx < 0 || nx >= 16 || ny < 0 || ny >= 16) continue;
    //     const npos = ny * 16 + nx;

    //     const number_has_arm = (number >> n.bit) & 1;

    //     // only process numbers whose opposite bit is set
    //     for (let key = 0; key < 256; key++) {
    //         // remove position if neighbor connection is incompatible
    //         if (!!number_has_arm !== !!((key >> n.opp) & 1)) {
    //             options[4 * key + (npos >> 6)] &= 0xffffffffffffffffn ^ (1n << BigInt(npos & 63));
    //         }
    //     }
    // }

    // return options;
};

export const filter_search_space = function (lattice, options, number, position) {
    // first, filter out all options with the same position
    options = filter_by_position(options, position, number);

    // second, filter neighbors
    options = filter_neighbors(options, number, position);

    return options;
};
