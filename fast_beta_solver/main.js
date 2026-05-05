import { initial_filter } from './filter.js';
import { back_track } from './backtrack.js';

const solve = async function () {
    const lattice = new Int16Array(256).fill(-1);
    const placed = new Int16Array(256).fill(-1);
    let options = new BigUint64Array(256 * 4).fill(0xffffffffffffffffn);

    options = initial_filter(options);

    return await back_track(lattice, options, placed);
};

(async () => {
    const solution = await solve();
    console.log("done!");
})();
