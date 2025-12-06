#!/bin/bash

# This script updates version numbers and creates (+ pushes) a release commit + tag.
# Usage: ./release.sh 1.2.3

set -e

if [ -z "$1" ]; then
  echo "Error: Version number required"
  echo "Usage: ./release.sh 1.2.3"
  exit 1
fi

VERSION="$1"

if [[ ! -f manifest.json ]]; then
  echo "Error: The script should be executed at the root of the project."
  exit 1
fi

echo "Updating version to $VERSION in all files"
echo

echo "Updating Cargo.toml"
sed -i "s/^version = \".*\"/version = \"$VERSION\"/" Cargo.toml

echo "Updating manifest.json"
sed -i "s/\"Version\": \".*\"/\"Version\": \"$VERSION\"/" manifest.json

echo "Updating property-inspector/package.json"
(cd property-inspector && npm version "$VERSION" --no-git-tag-version)

echo
echo "Staging changes"
git add Cargo.toml manifest.json property-inspector/package.json

echo
echo "Creating commit"
git commit -m "chore: release v$VERSION"

echo
echo "Creating tag v$VERSION"
git tag "v$VERSION"

echo
echo "Pushing commit and tag"
git push && git push --tags

echo
echo "Release v$VERSION created successfully."
echo "GitHub Actions will now build and create the release."
