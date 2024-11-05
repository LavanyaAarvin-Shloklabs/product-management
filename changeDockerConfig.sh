##!/bin/bash

sed "s/variant/$1/g" Dockerfile > DockerNew
mv DockerNew Dockerfile