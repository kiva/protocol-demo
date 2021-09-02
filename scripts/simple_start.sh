#!/bin/bash
# Run from protocol-demo
# Starts up all the containers needed for locally testing a simple system
set -ev

docker-compose -f ../aries-guardianship-agency/docker-compose.yml up -d
sleep 30 # wait for agency to be up
docker-compose -f docker-compose.yml up -d
sleep 35 # wait for agent to spin up
# We don't need to explicitly run demo scripts, since tests handle setup tasks
