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
