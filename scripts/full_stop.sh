#!/bin/bash
# Run from protocol-demo
# Stops all the containers
set -ev

docker-compose -f docker-compose.yml down
# Stop all running agents
docker stop $(docker ps -aq)
docker-compose -f ../aries-guardianship-agency/docker-compose.yml down
docker-compose -f ../aries-key-guardian/docker-compose.yml down
docker-compose -f ../protocol-gateway/docker-compose.yml down
docker-compose -f ../guardian-bio-auth/docker-compose.yml down
docker rm -f $(docker ps -aq)
