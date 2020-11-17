#!/bin/bash
# Run from protocol-demo
# Starts up all the containers needed for locally testing a simple system
set -ev

docker-compose -f ../aries-guardianship-agency/docker-compose.yml up -d
sleep 10
docker-compose -f docker-compose.yml up -d
sleep 25
docker exec -it demo-controller ts-node -r dotenv/config /www/scripts/setup.demo.ts
