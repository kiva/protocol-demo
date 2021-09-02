#!/bin/bash
# Run from protocol-demo
# Starts up all the containers needed for locally testing the full system
# Note that sleep times are extra long to all everything spin up, there are efficency improvements we can make here
set -ev

docker-compose -f ../aries-guardianship-agency/docker-compose.yml up -d
sleep 15
docker-compose -f ../aries-key-guardian/docker-compose.yml up -d
sleep 15
docker-compose -f ../guardian-bio-auth/docker-compose.yml up -d
sleep 15
docker-compose -f ../protocol-gateway/docker-compose.yml up -d
sleep 15
docker-compose -f docker-compose.yml up -d
sleep 75
docker exec -it demo-controller node /www/dist/scripts/setup.demo.js
