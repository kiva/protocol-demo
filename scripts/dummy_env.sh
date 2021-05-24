#!/bin/bash
# Copies dummy.env values into .env
cp aries-guardianship-agency/dummy.env aries-guardianship-agency/.env
cp aries-key-guardian/dummy.env aries-key-guardian/.env
cp protocol-gateway/dummy.env protocol-gateway/.env
cd guardian-bio-auth
./scripts/useDummyEnvFiles.sh
cd ..
