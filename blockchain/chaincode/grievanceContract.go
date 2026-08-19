// Package main provides the Hyperledger Fabric Smart Contract (Chaincode) for Grievance Governance
package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// GrievanceContract represents the Smart Contract for Grievance Audit Trail
type GrievanceContract struct {
	contractapi.Contract
}

// GrievanceLedgerRecord stores immutable state transitions on-chain
type GrievanceLedgerRecord struct {
	GrievanceID     string `json:"grievanceId"`
	Department      string `json:"department"`
	Priority        string `json:"priority"`
	Status          string `json:"status"`
	AssignedOfficer string `json:"assignedOfficer"`
	DocumentCID     string `json:"documentCid"`
	UpdatedByOrg    string `json:"updatedByOrg"`
	Timestamp       string `json:"timestamp"`
	Note            string `json:"note"`
}

// RecordGrievanceState records a new grievance or status transition on-chain
func (c *GrievanceContract) RecordGrievanceState(ctx contractapi.TransactionContextInterface, id string, dept string, priority string, status string, officer string, cid string, note string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get client MSP ID: %v", err)
	}

	record := GrievanceLedgerRecord{
		GrievanceID:     id,
		Department:      dept,
		Priority:        priority,
		Status:          status,
		AssignedOfficer: officer,
		DocumentCID:     cid,
		UpdatedByOrg:    clientMSPID,
		Timestamp:       time.Now().Format(time.RFC3339),
		Note:            note,
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return err
	}

	compositeKey, err := ctx.GetStub().CreateCompositeKey("GrievanceHistory", []string{id, fmt.Sprintf("%d", time.Now().UnixNano())})
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(compositeKey, recordJSON)
}

// GetGrievanceHistory retrieves all immutable state audit logs for a given grievance ID
func (c *GrievanceContract) GetGrievanceHistory(ctx contractapi.TransactionContextInterface, id string) ([]*GrievanceLedgerRecord, error) {
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey("GrievanceHistory", []string{id})
	if err != nil {
		return nil, err
	}
	defer iterator.Close()

	var records []*GrievanceLedgerRecord
	for iterator.HasNext() {
		response, err := iterator.Next()
		if err != nil {
			return nil, err
		}

		var record GrievanceLedgerRecord
		err = json.Unmarshal(response.Value, &record)
		if err != nil {
			return nil, err
		}
		records = append(records, &record)
	}

	return records, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&GrievanceContract{})
	if err != nil {
		fmt.Printf("Error creating GrievanceContract chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting GrievanceContract chaincode: %v\n", err)
	}
}
