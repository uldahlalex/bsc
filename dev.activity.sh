#!/bin/bash

#For local development outside docker

cd activityService
npm install
ts-node index.ts --secret=secret