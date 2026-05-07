#include <stdint.h>
#include <string.h>

#define MAX_DEPTH 256

typedef struct
{
    int16_t lattice[256];
    uint64_t options[1024];
    int16_t placed[256];
    int choice;
    int choice_type; // 0 = num_to_pos, 1 = pos_to_num
    int current_w;   // for num_to_pos iteration
    uint64_t mask;   // for num_to_pos iteration
    int current_num; // for pos_to_num iteration
    int is_init;     // indicates whether loop type for current depth is already determined
} StackFrame;

static StackFrame stack[MAX_DEPTH + 1];
static int depth = 0;

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

void filter_by_position(uint64_t *options, int pos, int exc)
{
    for (int i = 0; i < 256; i++)
    {
        if (i == exc)
            continue;
        options[4 * i + (pos >> 6)] &= ~(1ULL << (pos & 63));
    }
}

void filter_neighbors(uint64_t *opt, int num, int pos)
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
}

void filter_search_space(uint64_t *opt, int num, int pos)
{
    filter_by_position(opt, pos, num);
    filter_neighbors(opt, num, pos);
}

int is_feasible(uint64_t *opt, int16_t *placed)
{
    for (int i = 0; i < 256; i++)
    {
        if (placed[i] != -1)
            continue;
        if (opt[4 * i] > 0)
            continue;
        if (opt[4 * i + 1] > 0)
            continue;
        if (opt[4 * i + 2] > 0)
            continue;
        if (opt[4 * i + 3] > 0)
            continue;
        return 0;
    }
    return 1;
}

int place_number(int16_t *lattice, uint64_t *opt, int16_t *placed, int num, int pos)
{
    if ((opt[4 * num + (pos >> 6)] & (1ULL << (pos & 63))) == 0)
        return 0;
    lattice[pos] = num;
    placed[num] = pos;

    filter_search_space(opt, num, pos);

    return is_feasible(opt, placed);
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
        if (options_n < choice_amt)
        {
            choice_amt = options_n;
            choice = i;
        }
    }

    // second we check if there are positions with fewer available numbers
    int h = 0;
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
        int h_cur = 0;
        int x = key & 15, y = key >> 4;
        int dx[] = {1, 1, 1, 0, -1, -1, -1, 0};
        int dy[] = {-1, 0, 1, 1, 1, 0, -1, -1};
        for (int d = 0; d < 8; d++)
        {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16)
                h_cur += (lattice[ny * 16 + nx] != -1);
        }
        if (count < choice_amt || (choice == choice_amt && h_cur > h))
        {
            choice_amt = count;
            choice = key;
            choice_type = 1;
            h = h_cur;
        }
    }
    out[0] = choice;
    out[1] = choice_type;
}

void init_stack(int16_t *lattice, uint64_t *options, int16_t *placed)
{
    depth = 0;
    memcpy(stack[0].lattice, lattice, 256 * sizeof(int16_t));
    memcpy(stack[0].options, options, 1024 * sizeof(uint64_t));
    memcpy(stack[0].placed, placed, 256 * sizeof(int16_t));
    stack[0].is_init = 0;
}

int16_t *get_solution()
{
    return stack[256].lattice;
}

int find_next_solution()
{
    while (depth >= 0)
    {
        // solution found
        if (depth == 256)
        {
            depth--;
            return 1;
        }

        StackFrame *state = &stack[depth];

        // get loop setup if necessary
        if (!state->is_init)
        {
            int idx[2];
            select_idx(state->lattice, state->options, state->placed, idx);
            state->choice = idx[0];
            state->choice_type = idx[1];

            // start at index -1 because the body below will immediately increment
            if (state->choice_type == 0)
            {
                state->current_w = -1;
                state->mask = 0;
            }
            else
            {
                state->current_num = -1;
            }

            state->is_init = 1;
        }

        // we basically just test 1 number/position here either way
        if (state->choice_type == 0)
        {
            // advance to next word if current mask exhausted
            while (state->mask == 0)
            {
                state->current_w++;
                if (state->current_w > 3)
                {
                    depth--;
                    break;
                }
                state->mask = state->options[4 * state->choice + state->current_w];
            }
            if (state->current_w > 3)
                continue;
            int i = 64 * state->current_w + __builtin_ctzll(state->mask);
            memcpy(stack[depth + 1].lattice, state->lattice, 256 * sizeof(int16_t));
            memcpy(stack[depth + 1].options, state->options, 1024 * sizeof(uint64_t));
            memcpy(stack[depth + 1].placed, state->placed, 256 * sizeof(int16_t));
            stack[depth + 1].is_init = 0;

            state->mask &= state->mask - 1;
            int can_place = place_number(stack[depth + 1].lattice, stack[depth + 1].options, stack[depth + 1].placed, state->choice, i);
            if (can_place)
                depth++;
        }
        else
        {
            // advance to next number
            state->current_num++;

            // skip placed numbers and numbers that can't go at this position
            while (state->current_num < 256)
            {
                if (state->placed[state->current_num] == -1 &&
                    (state->options[4 * state->current_num + (state->choice >> 6)] &
                     (1ULL << (state->choice & 63))))
                    break;
                state->current_num++;
            }

            // no more candidates, backtrack
            if (state->current_num >= 256)
            {
                depth--;
                continue;
            }

            memcpy(stack[depth + 1].lattice, state->lattice, 256 * sizeof(int16_t));
            memcpy(stack[depth + 1].options, state->options, 1024 * sizeof(uint64_t));
            memcpy(stack[depth + 1].placed, state->placed, 256 * sizeof(int16_t));
            stack[depth + 1].is_init = 0;

            int can_place = place_number(stack[depth + 1].lattice, stack[depth + 1].options,
                                         stack[depth + 1].placed, state->current_num, state->choice);
            if (can_place)
                depth++;
        }
    }

    // exhausted search options
    return 0;
}
