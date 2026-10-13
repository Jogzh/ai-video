#!/usr/bin/env bash
set -euo pipefail
printf 'ffmpeg: '; command -v ffmpeg
ffmpeg -version | head -1
printf 'python: '; python3 --version
printf 'node: '; node --version
git rev-parse --show-toplevel
