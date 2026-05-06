import { back_track } from './backtrack.js';

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


const solve = async function () {
    const lattice = new Int16Array(256).fill(-1);
    const placed = new Int16Array(256).fill(-1);
    let options = new BigUint64Array(256 * 4).fill(0xffffffffffffffffn);

    options = initial_filter(options);

    return await back_track(lattice, options, placed);
};

(async () => {
    const t = new Date();
    const solution = await solve();
    console.log("done!");
    console.log("took", (new Date() - t) / 1000, "seconds");
})();
