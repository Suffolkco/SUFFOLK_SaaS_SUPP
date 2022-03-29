/**
 * Script Name: GET_PAYMENT_MODULE
 * Purpose: payment adapter will call this script to get the module name of the respective payment being made
 * 
 * Parameters:
 * - transId: ID of transaction used to get module name
 */
 try {

    var transId = aa.env.getValue("transId");    

    var capModule = getCapModuleFromETransaction(transId)
    if (!capModule) {

        aa.print("Cannot find transaction");
    }
    aa.print("capModule " + capModule)    
       
    aa.env.setValue("success", true);
    aa.env.setValue("message", capModule);
    aa.env.setValue("Result", "Found Module");    
}
catch (ex) {
    aa.env.setValue("success", false);
    aa.env.setValue("message", "EMSE ERR: Exception - " + ex.message);
    aa.env.setValue("result", "");  
    
}

function getCapModuleFromETransaction(transactionID) {

    try {
        var conn = aa.db.getConnection();
        //var selectString = "Select ETRANSACTION.MODULE_NAME, B1PERMIT.B1_MODULE_NAME, ENTITY_ID, ETRANSACTION.BATCH_TRANSACTION_NBR From ETRANSACTION Inner Join B1PERMIT On B1PERMIT.B1_PER_ID1 = SUBSTRING(ETRANSACTION.ENTITY_ID, 0, 6) And B1PERMIT.B1_PER_ID2 = SUBSTRING(ETRANSACTION.ENTITY_ID, 7, 5) And B1PERMIT.B1_PER_ID3 = SUBSTRING(ETRANSACTION.ENTITY_ID, 13, 5) Where BATCH_TRANSACTION_NBR = '" + transactionID + "'and B1PERMIT.SERV_PROV_CODE = 'SUFFOLKCO'"
        var selectString = "Select MODULE_NAME, BATCH_TRANSACTION_NBR, ENTITY_ID, TOTAL_FEE From ETRANSACTION_DETAIL Where SERV_PROV_CODE = 'SUFFOLKCO' AND BATCH_TRANSACTION_NBR = '" + transactionID + "'" ;
		var sStmt = conn.prepareStatement(selectString);
        var rSet = sStmt.executeQuery();

        while (rSet.next()) {
          
            //aa.print(rSet.getString("ENTITY_ID") + " " + rSet.getString("MODULE_NAME") + " " + rSet.getString("BATCH_TRANSACTION_NBR") + " " + rSet.getString("B1_MODULE_NAME")); // + " " + rSet.getString("GATEWAY_TRANSACTION_ID")) // + " " + rSet.getString("TOTAL_FEE") + " " + rSet.getString("STATUS") + " " + rSet.getString("REC_DATE") + " " + rSet.getString("ENTITY_TYPE") + " " + rSet.getString("BATCH_TRANSACTION_NBR"))
            aa.print(rSet.getString("ENTITY_ID") + " " + rSet.getString("MODULE_NAME") + " " + rSet.getString("BATCH_TRANSACTION_NBR"));
			return rSet.getString("MODULE_NAME");
        }
    }
    catch (ex) {
        aa.print(ex.message)
    }
    finally {
       
        sStmt.close();
        conn.close();
    }
}