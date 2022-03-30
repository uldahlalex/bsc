#!/bin/bash

#For local development outside docker

cd identityService
npm install -g typescript
npm install -g ts-node
npm install
ts-node index.ts