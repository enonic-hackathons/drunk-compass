#!/bin/bash
git pull
docker build -t drunk-compass .
docker run --rm -it  -v $HOME/.drunk-compass-cache:/root/.gradle/ -v $PWD/deploy:/dest/deploy drunk-compass
