#!/bin/bash

#For local development outside docker

cd taskService
npm install
ts-node index.ts --secret=secret