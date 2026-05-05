export const full_feasibility_check = function (_lattice, options, placed, _number, _position) {
    // check for numbers with no available positions
    for (let i = 0; i < 256; i++) {
        if (placed[i] !== -1) continue;
        if (options[4 * i] > 0n) continue;
        if (options[4 * i + 1] > 0n) continue;
        if (options[4 * i + 2] > 0n) continue;
        if (options[4 * i + 3] > 0n) continue;
        return false;
    }

    return true;
}
