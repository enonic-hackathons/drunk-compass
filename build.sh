#!/bin/bash
docker build -t drunk-compass .
docker run --rm -it drunk-compass bash
