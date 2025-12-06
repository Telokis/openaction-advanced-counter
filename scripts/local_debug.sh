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

./scripts/prepare_folder.sh

echo
echo "Copying files into a debug opendeck plugin"
ln -sfv "$PWD/plugin" "$HOME/.config/opendeck/plugins/"

echo
echo "Reload plugin in opendeck"
opendeck --reload-plugin plugin

echo
echo "Everything worked, plugin ready to test."