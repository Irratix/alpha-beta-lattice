# Beta lattice

A couple years ago we found the alpha lattice; a grid where all numbers from 0-255 are placed in a 16x16 grid, where their binary representation was represented as arms that could connect to adjacent numbers' arms. 
In fact, for the alpha lattice the rule was that they all had to connect, but they were allowed to have bends.
The rule for the beta lattice is that all these connections must be straight; diagonals must be of the opposite direction to count as connecting.
beta_solver_v2.html is designed to find a beta lattice through back-tracking, and I am happy to say that after a couple days of work, it is now fast enough to find the beta lattice!

We also introduced the concept of the gamma lattice, the rule being that diagonals are not allowed to cross each other. 
We were already skeptical of its existence, but after I built a basic extension of the beta solver to find a gamma lattice, we've been able to prove mathematically it does not exist.
Below is that proof:

The proof is not complicated; since we have a 16x16 grid there are 15 x 15 = 225 "boxes" where we can place a diagonal.
Each diagonal arm most connect with another, so if we know the total amount of diagonal arms and divide that by two, we know how many diagonals we need to place.
A number can have 0, 1, 2, 3 or 4 diagonals. Let's count each of them:
For every set of diagonals, we independently have 2^4=16 combinations of orthogonals. 
So we will be multiplying all combinations by 16. <br>
There are 4 ways to have 1 diagonal, so there are 16 * 4 = 64 numbers with one diagonal.  <br>
There are 4 + 3 = 7 ways to have 2 diagonals, so there are 16 * 7 = 112 numbers with two diagonals. <br>
There are 4 ways to have 3 diagonals, so there are 16 * 4 = 64 numbers with three diagonals. <br>
There is 1 way to have 4 diagonals, so there are 16 numbers with 4 diagonals. <br>

Now we count them up and divide by two: (1 * 64 + 2 * 112 + 3 * 64 + 4 * 16) / 2 = 272. 272 is bigger than 225.
Therefore, when we place a diagonal in every available spot, there must still be more diagonals and we'd have to put those somewhere where it would cross another.
Therefore the gamma lattice does not exist.

The gamma lattice solver actually doesn't get very far at all, only filling in about 59 slots. 
I'm sure it could get further with more optimizations, but since it's guaranteed not to find a solution I will leave it where it is.
I'm also satisfied with beta_solver_v2 but there is an open question which would demand much further optimization: how many beta lattices are there?
Another open question that I may get to eventually is the existence of the mini-lattice: are there any 4x4 grids where the arms are only orthogonal and they all connect?
