#!/bin/bash
# These are a series of curl call that can be made against the generic multi-controller to setup and agent and schema + cred def etc

curl --location --request POST 'http://localhost:3014/v2/api/agent/register' \
--header 'agent: demo-agent' \
--header 'Content-Type: application/json' \
--data-raw '{
    "seed": "000000000000000000000000Steward1",
    "label": "Demo Controller",
    "useTailsServer": false,
    "adminApiKey": "demoAdminApiKey"
}'

curl --location --request POST 'http://localhost:3014/v1/agent/publicize-did' \
--header 'agent: demo-agent' \
--header 'Content-Type: application/json' \
--data-raw '{
    "did": "Th7MpTaRZVRYnPiabds81Y"
}'




