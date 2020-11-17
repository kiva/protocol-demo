#!/bin/bash
# Run from protocol-demo
# Starts up all the containers needed for locally testing a simple system
set -ev

docker-compose -f ../aries-guardianship-agency/docker-compose.yml up -d
sleep 30 # wait for agency to be up
docker-compose -f docker-compose.yml up -d
sleep 25 # wait for agent to spin up
docker exec -it demo-controller npm run script:dev /www/src/scripts/setup.demo.ts
