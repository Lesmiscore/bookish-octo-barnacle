#!/bin/bash
set -xe
git fetch upstream
git reset --hard upstream/master
npm i
refresh
