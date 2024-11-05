##!/bin/bash

sed "s/versionName/$1/g" server.js > server_new.js
mv server_new.js server.js