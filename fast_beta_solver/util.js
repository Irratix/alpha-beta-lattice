export const is_edge = function (pos, edge) {
    switch (edge) {
        case "top":
            return pos < 16;
        case "bottom":
            return pos >= 240;
        case "left":
            return pos % 16 === 0;
        case "right":
            return pos % 16 === 15;
    }
    return false;
}

// since this is a helper function for select_next_idx
// this function is adapted to count ones in 4 consecutive entries of an options object
const count_ones = function (arr, num) {
    let count = 0;
    let i;
    i = arr[4 * num];
    while (i) {
        i &= i - 1n;
        count++;
    }
    i = arr[4 * num + 1];
    while (i) {
        i &= i - 1n;
        count++;
    }
    i = arr[4 * num + 2];
    while (i) {
        i &= i - 1n;
        count++;
    }
    i = arr[4 * num + 3];
    while (i) {
        i &= i - 1n;
        count++;
    }
    return count;
}

// gets the exponent of 2 of the lowest bit in a bigint
export const ctz_bi = function (n) {
    let count = 0;
    while ((n & 1n) === 0n) {
        n >>= 1n;
        count++;
    }
    return count;
}

// this uses a hybrid approach:
// both assigning a position to a number and assigning a number to a position are possible
// we always take the option with the fewest available option, to reduce the branch factor as much as possible
export const select_next_idx = function (lattice, options, placed) {
    let choice_amt = 256;
    let choice = -1;
    let choice_type = "num_to_pos";
    // first we check which number has the fewest available positions
    for (let i = 0; i < 256; i++) {
        if (placed[i] !== -1) continue;
        let options_n = count_ones(options, i);
        if (options_n < choice_amt && options_n !== 0) {
            choice_amt = options_n;
            choice = i;
        }
    }

    // second we check if there are positions with fewer available numbers
    for (let key = 0; key < 256; key++) {
        if (lattice[key] !== -1) continue;
        let count = 0;
        for (let num = 0; num < 256; num++) {
            if (placed[num] !== -1) continue;
            if (options[4 * num + (key >> 6)] & (1n << BigInt(key & 63))) count++;
        }
        if (count < choice_amt) {
            choice_amt = count;
            choice = key;
            choice_type = "pos_to_num";
        }
    }

    return { number: choice, type: choice_type };
}
