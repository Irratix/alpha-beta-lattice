#!/bin/sh
emcc fast_beta_solver/c/functions.c -O3 -o fast_beta_solver/wasm/functions.js \
  -s EXPORTED_FUNCTIONS='["_count_ones", "_ctz_bi", "_filter_neighbors", "_malloc", "_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap", "HEAPU8"]' \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=createModule \
  -s EXPORT_ES6=1