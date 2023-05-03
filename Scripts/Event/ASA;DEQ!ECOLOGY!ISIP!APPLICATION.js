// Enter your script here...
//showDebug = true;
//EHIMS2-287
try{


                    var rowArray = [];
					rowArray["Document Type"] = "Certificate of Occupancy"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "C.O. Equivalency"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Homeowners Insurance Policy Declaration"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Current Tax Bill"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Deed"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Proof of Failure"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Current, Signed Tax Return"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "LLC- Articles of Organization"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "LLC- Operating Agreement"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "LLC- NYS Filing Receipt"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "LLC- Signed Statement from All Members"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Trust- Signed Statement from All Trustees"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Trust- Full Copy of Trust Agreement"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Signed County Grant Agreement" 
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Signed State Contract"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Signed County AOP"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Signed State AOP/RR"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Signed Mailing Address Certification"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Approvable Plans"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Vendor Proposal"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					rowArray["Document Type"] = "Proposal Eligibility Memo"
					addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);  
					
					
					var rowArrayPayment = [];
					rowArrayPayment["Document Type"] = "Fully Executed Grant Agreement"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Compliance Forms"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Installer Certification (WWM-078)"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Design Professional Certification (WWM-073)"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Sanitary System Abandonment Certification (WWM-080) "
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "I/A OWTS Registration (WWM-304)"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "3-Year Operations and Maintenance Contract "
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Final Invoice"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Final Eligibility Memo"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Reimbursement Payment Documentation"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  
					rowArrayPayment["Document Type"] = "Final Payment Packet"
					addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);  	
										
					 }
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }
  
  
  
  
function addRowToASITable(tableName, tableValues) //optional capId
{
	//tableName is the name of the ASI table
	//tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
  	itemCap = capId
	if (arguments.length > 2)
	{
		itemCap = arguments[2]; //use capId specified in args
	}
	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName);
	if (!tssmResult.getSuccess())
	{ 
		logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
		return false;
	}
	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var col = tsm.getColumns();
	var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
	var coli = col.iterator();
	while (coli.hasNext())
	{
		colname = coli.next();
		if (!tableValues[colname.getColumnName()]) 
		{
			logDebug("Value in " + colname.getColumnName() + " - " + tableValues[colname.getColumnName()]);
			logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
			tableValues[colname.getColumnName()] = "";
		}
		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined")
		{
			fld.add(tableValues[colname.getColumnName()].fieldValue);
			fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
		}
		else // we are passed a string
		{
			fld.add(tableValues[colname.getColumnName()]);
			fld_readonly.add(null);
		}
	}
	tsm.setTableField(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field
	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
	if (!addResult .getSuccess())
	{ 
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()); 
		return false;
	}
	else
	{
		logDebug("Successfully added record to ASI Table: " + tableName);
	}
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
}