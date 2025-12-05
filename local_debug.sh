#!/bin/bash

# This script does the following:
# - Create a 'plugin' folder if it doesn't exist
# - Empty the 'plugin' folder
# - Build the plugin
# - Copy the plugin binary to the 'plugin' folder
# - Copy assets to the 'plugin' folder
# - Create a symlink of the 'plugin' folder to opendeck's plugins folder
# - Reload the plugin in opendeck

set -e

if [[ ! -d plugin ]]; then
  echo "Creating 'plugin' folder"
  mkdir plugin
  echo
fi

echo
echo "Emptying 'plugin' folder"
rm -rfv plugin/*

echo
echo "Build and copy plugin"
cargo build
cp -v target/debug/openaction-advanced-counter plugin/oa-advanced-counter-x86_64-unknown-linux-gnu

echo
echo "Copy assets to plugin folder"
cp -v assets/* plugin/

echo
echo "Build property inspector"
(cd property-inspector && bun run build)
cp -rv property-inspector/dist/index.html plugin/property-inspector.html

echo
echo "Copying files into a debug opendeck plugin"
ln -sfv "$PWD/plugin" "$HOME/.config/opendeck/plugins/"

echo
echo "Reload plugin in opendeck"
opendeck --reload-plugin plugin

echo
echo "Everything worked, plugin ready to test."