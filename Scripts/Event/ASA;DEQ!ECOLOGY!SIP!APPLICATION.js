// Enter your script here...
//showDebug = true;

try{
//EHIMS2-287

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
					
					
					//Add WWM num and town based on Parcel num
					//EIHMs282
					var parcelNumber= getFirstParcelFromCapId(capId);
					 var latestRecordID = checkForRelatedWWMRecord(parcelNumber);
					 if(latestRecordID !=null)
					editAppSpecific("WWM Ref #", latestRecordID);
					var townIdentifier = parcelNumber.slice(0, 2);
					var town = lookup("TaxNumTownMapping", townIdentifier);
					editAppSpecific("Town", town);
	}
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }
  


function checkForRelatedWWMRecord(parcelNumber) {
		
		var listOfRelatedRecorsdFromParcel = capIdsGetByParcel(parcelNumber);
		var wwmRecord = new Array();
		var resArray = new Array();
	

    for (record in listOfRelatedRecorsdFromParcel) 
	{

        var itemCap = listOfRelatedRecorsdFromParcel[record];
        var itemCapType = aa.cap.getCap(itemCap).getOutput().getCapType().toString();
        //aa.print("We found this record: " + itemCap.getCustomID() + " which is a: " + itemCapType);
        if (itemCapType == "DEQ/WWM/SHIP/Application" || itemCapType == "DEQ/WWM/Residence/Application" || itemCapType== "DEQ/WWM/Commercial/Application")
		{
           wwmRecord.push(itemCap);
        }
    }
	for( i in wwmRecord)
	{

		var altId= wwmRecord[i].getCustomID();

		 var taskHistoryResult = aa.workflow.getWorkflowHistory(wwmRecord[i],null);
			if(taskHistoryResult.getSuccess())
			{
				var taskArr = taskHistoryResult.getOutput();
				for(obj in taskArr)
				{
					var taskObj = taskArr[taskArr.length-1];
					var ddate = taskObj.getDispositionDate();
					scheduledDate = dateFormatted(ddate.getMonth(), ddate.getDayOfMonth(), ddate.getYear(), "MM/DD/YYYY");

					var tempArr = new Array();
					tempArr['altId'] = wwmRecord[i].getCustomID();
					tempArr['date'] = convertDate(taskObj.getDispositionDate());
					resArray.push(tempArr);
					break;
           
                }
			}
	}

			resArray.sort(function(a,b){
			  // Turn your strings into dates, and then subtract them
			  // to get a value that is either negative, positive, or zero.
			  return new Date(b.date) - new Date(a.date);
			});

			return resArray[0].altId;

	}



function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}

  
  function getFirstParcelFromCapId(capId)
{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
							if (capParcelResult.getSuccess())
							{
								var Parcels = capParcelResult.getOutput().toArray();
							}

							for ( i in Parcels)
							{
							var parcelNumber = Parcels[0].getParcelNumber();
							}

		return parcelNumber;
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