#!/bin/bash

#For local development outside docker

cd identityService
npm install
ts-node index.ts --secret=secret