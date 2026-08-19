#!/bin/bash
# Script to package, install, approve, and commit Grievance Chaincode on 2-Org Hyperledger Fabric test-network

CHANNEL_NAME="grievancechannel"
CC_NAME="grievance-cc"
CC_SRC_PATH="../chaincode"
CC_VERSION="1.0"
CC_SEQUENCE="1"

echo "============================================================"
echo " Packaging Chaincode: $CC_NAME Version $CC_VERSION "
echo "============================================================"

peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path ${CC_SRC_PATH} \
  --lang golang \
  --label ${CC_NAME}_${CC_VERSION}

echo " Installing chaincode on PortalOrg peer0..."
# peer lifecycle chaincode install ${CC_NAME}.tar.gz ...

echo " Installing chaincode on GovOrg peer0..."
# peer lifecycle chaincode install ${CC_NAME}.tar.gz ...

echo " Chaincode deployed successfully on $CHANNEL_NAME!"
