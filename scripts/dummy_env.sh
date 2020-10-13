#!/bin/bash
# Copies dummy.env values into .env
cp aries-guardianship-agency/dummy.env aries-guardianship-agency/.env
cp aries-key-guardian/dummy.env aries-key-guardian/.env
cp protocol-gateway/dummy.env protocol-gateway/.env
cp protocol-demo/implementations/demo/dummy.env protocol-demo/implementations/demo/.env
cp protocol-demo/integration_tests/dummy.env protocol-demo/integration_tests/.env 
cd guardian-bio-auth
./scripts/useDummyEnvFiles.sh
cd ..
