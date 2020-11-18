#!/bin/bash
cd aries-guardianship-agency && docker-compose build
cd ../aries-key-guardian && docker-compose build
cd ../protocol-gateway && docker-compose build
cd ../guardian-bio-auth && docker-compose build
cd ../protocol-demo && docker-compose build
