#!/bin/bash

# This script creates a "plugin" folder containing everything needed to get started.

set -e

if [[ ! -f manifest.json ]]; then
  echo "Error: The script should be executed at the root of the project."
  exit 1
fi

if [[ ! -d plugin ]]; then
  echo "Creating 'plugin' folder"
  mkdir plugin
  echo
fi

echo
echo "Emptying 'plugin' folder"
rm -rfv plugin/*

echo
echo "Creating directory structure"
mkdir plugin/bin plugin/images plugin/property-inspector

echo
echo "Build and copy plugin"
cargo build
cp -v target/debug/openaction-advanced-counter plugin/bin/oa-advanced-counter-x86_64-unknown-linux-gnu

echo
echo "Copy manifest.json to plugin folder"
cp -v manifest.json plugin/

echo
echo "Copy assets to plugin folder"
cp -rv images plugin/

echo
echo "Build property inspector"
(cd property-inspector && npm run build)
cp -rv property-inspector/dist/index.html plugin/property-inspector/index.html

echo
echo "Plugin folder is ready to use."