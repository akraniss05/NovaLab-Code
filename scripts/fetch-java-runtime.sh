#!/usr/bin/env bash
# TeaVM playground compiler. Upstream source and licensing:
# https://github.com/konsoletyper/teavm-javac
set -euo pipefail
destination="${1:-site/vendor/java}"
mkdir -p "$destination"
while read -r checksum filename; do
  curl --fail --silent --show-error --location --retry 2 --max-time 35 \
    "https://teavm.org/playground/$filename" -o "$destination/$filename"
  printf '%s  %s\n' "$checksum" "$destination/$filename" | sha256sum -c -
done <<'CHECKSUMS'
4ed72de9e6ea1b58adfaa1b75c30379d7bccde71c529f795df383d62045367d9 compile-classlib-teavm.bin
a79245353ac623df4fde5740bb2bedacedc9c98544253f01aa4b63268f9cb8ba compiler.wasm
75b2b94394f162c384d42d540836375cdbb0207e6e5605b92a18ce56eb158741 compiler.wasm-runtime.js
e62ab99ce291a3379abc0756a1e80f4796f00c60fee655e488b82e37b469d5b7 runtime-classlib-teavm.bin
CHECKSUMS
