#!/bin/bash
# Run from protocol-demo
# Stops all the containers
set -v

docker-compose -f docker-compose.yml down
# Stop all running agents
docker stop $(docker ps -aq)
docker-compose -f ../aries-guardianship-agency/docker-compose.yml down
docker rm -f $(docker ps -aq)
