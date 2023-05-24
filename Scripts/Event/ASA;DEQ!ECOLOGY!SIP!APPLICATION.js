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
					
					
                  // EHIMS2-295
                  // Sewer District
                  editAppSpecific("Sewer District", getGISInfo("SUFFOLKCO","SanitationDistrictPolygon","SHORTNAME")); 

                  // Legislative District
                  editAppSpecific("Legislative District", getGISInfo("SUFFOLKCO","LegislativeDistrict","NAME")); 

                  // Priority Area 
                  editAppSpecific("Priority Area", getGISInfo("SUFFOLKCO","ReclaimWaterPolygon","PRIORITY")); 

					
					//EIHMS2 298

					if (AInfo["Catastrophic Failure"] == "Yes")
					  editAppSpecific("SCORE", 100); 
					if (AInfo["Non-Catastrophic"] == "Yes" && AInfo["Catastrophic Failure"] == "No")
					  editAppSpecific("SCORE", 90); 
					if (AInfo["Priority Area"] == "Priority 1" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 80); 
					if (AInfo["Priority Area"] == "Priority 2" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 70); 
					if (AInfo["Priority Area"] == "No Priority" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 60); 
                    
					//EIHMS2 299
					
					if (AInfo["Previously installed IA OWTS"] == "Yes")
					{
						editAppSpecific("County Status", "Ineligible");
						editAppSpecific("State Status", "Undetermined");
						sendEmailsOnSIPRecord("DEQ_SIP_INELIGIBLE");
					}
					
				else if (AInfo["Tax liens"] == "Yes"||
				    AInfo["Foreclosure"] == "Yes"||
				    AInfo["C.O."] == "No")
					
					{
						editAppSpecific("County Status", "Ineligible");
						editAppSpecific("State Status", "Ineligible");
						sendEmailsOnSIPRecord("DEQ_SIP_INELIGIBLE");
					}
					  
				else
				  {
						 editAppSpecific("County Status", "Undetermined");
						 editAppSpecific("State Status", "Undetermined");
						 sendEmailsOnSIPRecord("DEQ_SIP_APP_RCVD");
				  }
			 


	}
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }
  
function sendEmailsOnSIPRecord(templateName)
{

		var sipPO = loadASITable("DIP_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray();
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "";   
			varcapAddresses = null;  
			var shortNotes = getShortNotes(capId);
			var emailAddressArray = new Array();  

			  
		  var s_result = aa.address.getAddressByCapId(capId);
		  if(s_result.getSuccess())
		  {
			capAddresses = s_result.getOutput();
		  }
		  

			if(matches(fromEmail, null, "", undefined))
			{
			  fromEmail = "";
			}
			
			//Contact Emails
			for (con in conArray)
			{
			  if (!matches(conArray[con].email, null, undefined, ""))
			  {
				logDebug("Contact email: " + conArray[con].email);
				conEmail = conArray[con].email;
				 if (conEmail && dubCheckemails.indexOf(conEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + "||" + conEmail;
					 else
						dubCheckemails = "" + conEmail;
				}
			  }
			}
			//Lp emails
			
			var lpResult = aa.licenseScript.getLicenseProf(capId);
			if (lpResult.getSuccess())
			{ 
			  var lpArr = lpResult.getOutput();  
			} 
			else 
			{ 
			  logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
			}
			for (var lp in lpArr)
			{
			  if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
			  {
				logDebug("LP email: " + lpArr[lp].email);
				lpEmail = lpArr[lp].getEmail();
				 if (lpEmail && dubCheckemails.indexOf(lpEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + "||" + lpEmail;
					 else
						dubCheckemails = "" + lpEmail;
				}
			  }
			}
			
			//Email from ASIT table
			
						for (var k = 0; k < sipPO.length; k++)
			{
					  var poEmail = sipPO[k]["Email Address"];
					  if (!matches(poEmail, null, undefined, ""))
					 {
						  if (poEmail && dubCheckemails.indexOf(poEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + "||" + poEmail;
					 else
						dubCheckemails = "" + poEmail;
				}
					 }
		   }
			  getRecordParams4Notification(emailParams);
				  
			  addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
			  if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }

			if (dubCheckemails != null)
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

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
if(resArray[0] != undefined)
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