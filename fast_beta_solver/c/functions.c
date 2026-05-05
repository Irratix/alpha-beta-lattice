#include <stdint.h>

int count_ones(uint64_t *arr, int num)
{
    int count = 0;
    count += __builtin_popcountll(arr[4 * num]);
    count += __builtin_popcountll(arr[4 * num + 1]);
    count += __builtin_popcountll(arr[4 * num + 2]);
    count += __builtin_popcountll(arr[4 * num + 3]);
    return count;
}

int ctz_bi(uint64_t n)
{
    return __builtin_ctzll(n);
}

uint64_t *filter_neighbors(uint64_t *opt, int num, int pos)
{
    int x = pos & 15;
    int y = pos >> 4;

    int nb[] = {
        1, -1, 0, 4,
        1, 0, 1, 5,
        1, 1, 2, 6,
        0, 1, 3, 7,
        -1, 1, 4, 0,
        -1, 0, 5, 1,
        -1, -1, 6, 2,
        0, -1, 7, 3};

    for (int i = 0; i < 8; i++)
    {
        int nx = x + nb[i * 4];
        int ny = y + nb[i * 4 + 1];

        // skip off-board neighbors
        if (nx < 0 || nx >= 16 || ny < 0 || ny >= 16)
            continue;
        int npos = ny * 16 + nx;

        int num_has_arm = (num >> nb[i * 4 + 2]) & 1;

        for (int key = 0; key < 256; key++)
        {
            if (num_has_arm != ((key >> nb[i * 4 + 3]) & 1))
            {
                opt[4 * key + (npos >> 6)] &= ~(1ULL << (npos & 63));
            }
        }
    }

    return opt;
}

void select_idx(int16_t *lattice, uint64_t *options, int16_t *placed, int *out)
{
    int choice_amt = 156;
    int choice = -1;
    int choice_type = 0;

    // check which number has the fewest available positions
    for (int i = 0; i < 256; i++)
    {
        if (placed[i] != -1)
            continue;
        int options_n = count_ones(options, i);
        if (options_n < choice_amt && options_n != 0)
        {
            choice_amt = options_n;
            choice = i;
        }
    }

    // second we check if there are positions with fewer available numbers
    for (int key = 0; key < 256; key++)
    {
        if (lattice[key] != -1)
            continue;
        int count = 0;
        for (int num = 0; num < 256; num++)
        {
            if (placed[num] != -1)
                continue;
            if (options[4 * num + (key >> 6)] & (1ULL << (key & 63)))
                count++;
        }
        if (count < choice_amt)
        {
            choice_amt = count;
            choice = key;
            choice_type = 1;
        }
    }
    out[0] = choice;
    out[1] = choice_type;
}
