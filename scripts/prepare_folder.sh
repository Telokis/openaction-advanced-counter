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

# In the CI, the build is done by a matrix so we skip it
if [ -z "$CI" ]; then
  echo
  echo "Build and copy plugin"
  cargo build
  cp -v target/debug/openaction-advanced-counter plugin/bin/openaction-advanced-counter-x86_64-unknown-linux-gnu
fi

echo
echo "Copy manifest.json to plugin folder"
cp -v manifest.json plugin/
cp -v README.md LICENSE plugin/

echo
echo "Copy assets to plugin folder"
cp -rv images plugin/

# In the CI, the property inspector is already built by a separate job
if [ -z "$CI" ]; then
  echo
  echo "Build property inspector"
  (cd property-inspector && npm run build)
  cp -rv property-inspector/dist/* plugin/property-inspector/
fi

echo
echo "Plugin folder is ready to use."