
##!/bin/bash
sed "s#repo#$1#g;
s#tagVersion#$2#g" deployment.yaml > deploy_latest.yaml