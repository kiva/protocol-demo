#!/bin/bash
# Run from protocol-demo
# Starts up all the containers needed for locally testing a simple system
set -ev

docker-compose -f ../aries-guardianship-agency/docker-compose.yml up -d
sleep 15
docker-compose -f ../aries-key-guardian/docker-compose.yml up -d
sleep 15
docker-compose -f ../guardian-bio-auth/docker-compose.yml up -d
sleep 15
docker-compose -f ../protocol-gateway/docker-compose.yml up -d
sleep 15
docker-compose -f implementations/demo/docker-compose.yml up -d
sleep 60
docker exec -it demo-controller ts-node -r dotenv/config /www/implementations/demo/scripts/setup.demo.simple.ts
