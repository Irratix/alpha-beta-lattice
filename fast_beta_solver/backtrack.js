import {
    select_next_idx,
    ctz_bi
} from './util.js';
import { filter_search_space } from './filter.js';
import { full_feasibility_check } from './test.js';
import {
    draw_lattice,
    nextFrame
} from './view.js';

const max_solutions = 200;
let solution_counter = 0;

// returns whether or not the number can be placed, as well as changed lattice and options
const place_number = function (lattice, options, placed, number, pos) {
    // place
    if ((options[4 * number + (pos >> 6)] & (1n << BigInt(pos & 63))) === 0n) return { can_place: false };
    lattice[pos] = number;
    options[4 * number] = 0n;
    options[4 * number + 1] = 0n;
    options[4 * number + 2] = 0n;
    options[4 * number + 3] = 0n;
    placed[number] = pos;

    // filter search space
    options = filter_search_space(lattice, options, number, pos);

    // check feasibility
    let is_feasible = full_feasibility_check(lattice, options, placed, number, pos);
    if (!is_feasible) return { can_place: false };

    return {
        lattice,
        options,
        placed,
        can_place: true
    };
}

// this canvas exists purely for debugging purposes and should by default not be used
// const c = document.createElement("canvas");
// c.width = 160;
// c.height = 160;
// const ctx = c.getContext("2d");
// let max_depth = 0;

export const back_track = async function (lattice, options, placed, depth = 0) {
    if (depth === 256) {
        draw_lattice(lattice);
        await nextFrame();
        console.log(++solution_counter);
        return solution_counter < max_solutions ? false : lattice;
    }

    const n = select_next_idx(lattice, options, placed);
    if (n.type === "num_to_pos") {
        const value = n.number;
        for (let w = 0; w < 4; w++) {
            let mask = options[4 * value + w];
            while (mask) {
                const i = w * 64 + ctz_bi(mask);
                let lattice_loc = Int16Array.from(lattice);
                let options_loc = BigUint64Array.from(options);
                let placed_loc = Int16Array.from(placed);
                const result = place_number(lattice_loc, options_loc, placed_loc, value, i);
                if (result.can_place === false) {
                    mask &= mask - 1n;
                    continue;
                }
                lattice_loc = result.lattice;
                options_loc = result.options;
                placed_loc = result.placed;
                let solution = await back_track(lattice_loc, options_loc, placed_loc, depth + 1);
                if (solution !== false) return solution;

                mask &= mask - 1n;
            }
        }
    } else if (n.type === "pos_to_num") {
        const pos = n.number;
        const pos_offset = pos >> 6;
        const pos_mask = 1n << BigInt(pos & 63);
        for (let num = 0; num < 256; num++) {
            if ((options[4 * num + pos_offset] & pos_mask) === 0n) continue;
            let lattice_loc = Int16Array.from(lattice);
            let options_loc = BigUint64Array.from(options);
            let placed_loc = Int16Array.from(placed);
            const result = place_number(lattice_loc, options_loc, placed_loc, num, pos);
            if (result.can_place === false) continue;
            lattice_loc = result.lattice;
            options_loc = result.options;
            placed_loc = result.placed;
            let solution = await back_track(lattice_loc, options_loc, placed_loc, depth + 1);
            if (solution !== false) return solution;
        }
    }
    return false;
};
