#!/bin/bash
# Run from protocol-demo
# Starts up all the containers needed for locally testing a simple system
set -ev

docker-compose -f ../aries-guardianship-agency/docker-compose.yml up -d
sleep 5
docker-compose -f implementations/demo/docker-compose.yml up -d
sleep 15
docker exec -it demo-controller ts-node -r dotenv/config /www/implementations/demo/scripts/setup.demo.ts
