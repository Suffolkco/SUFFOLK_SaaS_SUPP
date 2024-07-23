//showDebug = true;
//Notifications based on workflow task and status. 
//EIHMS232
try
{
	/*if (wfTask == "Application Review" && wfStatus == "Document Request")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_DOC_REQUEST");
	}*/
	
	if ((wfTask == "Application Review" || wfTask == "Grant Review") && (wfStatus == "Applicant Clarification"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
	
	/*if ((wfTask == "Application Review" || wfTask == "Grant Review" || wfTask =="Contract Processing") && (wfStatus == "Withdrawn"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_WITHDRAWN");
	}*/
	
	if ((wfTask == "Application Review" || wfTask == "Grant Review" || wfTask == "Application Review") && (wfStatus == "Ineligible"))
	{
		//sendEmailsOnSIPRecord("DEQ_SIP_INELIGIBLE");
editAppSpecific("County Status", "Ineligible");
						editAppSpecific("State Status", "Ineligible");
	}
	
	if ((wfTask == "Grant Review") && (wfStatus == "Document Request" || wfStatus == "Deficiency"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
	}

	if (wfTask == "Grant Review" && wfStatus == "Complete")
	{

var nys = AInfo["New York State Septic System Replacement Program"];
		var countyStatus = AInfo["County Status"];
		var stateStatus = AInfo["State Status"];

if((countyStatus != "Ineligible" && countyStatus != "Withdrawn"))

//if(nys != "CHECKED")
		{
		sendEmailsOnSIPRecord("DEQ_SIP_APP_COMPLETE");

}
var countyStatus = AInfo["County Status"];
		if(countyStatus == "Ineligible" || countyStatus == "Withdrawn")
		{
			//activateTask("Pre-Install Review");
			
		}
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Grant Awarded")
	{
		
		var nys = AInfo["New York State Septic System Replacement Program"];
		var countyStatus = AInfo["County Status"];
		var stateStatus = AInfo["State Status"];
		
		//if((countyStatus == "Ineligible" || countyStatus == "Withdrawn") && (stateStatus == "Eligible") && (nys == "CHECKED"))
			
		if((countyStatus == "Ineligible" || countyStatus == "Withdrawn") && (stateStatus == "Eligible"))
		{
		sendEmailsOnSIPRecord("DEQ_NYS_GRANT_AWARD");
		}

		aa.print("nys" +nys);
		//if (nys == "UNCHECKED" || nys == undefined || nys == "")
			
		if(countyStatus == "Eligible")
		{
		sendEmailsOnSIPRecord("DEQ_SIP_GRANT_AWARD");
		}
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Grant Packet Mailed")
	{
//sendEmailsOnSIPRecord("DEQ_SIP_GRANT_PACKET_MAILED");
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Incomplete")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_GRANT_PACKET_REVISION");
	}
	
	
	if ((wfTask == "Post-Install Review" || wfTask == "Pre-Install Review" || wfTask == "Payment Processing") && (wfStatus == "Vendor Request"))
	{
		sendEmailsOnSIPRecordOnlyWWMLP("DEQ_SIP_CLARIFICATION_REQUEST");
	}

		
	if ((wfTask == "Post-Install Review" || wfTask == "Pre-Install Review" || wfTask == "Payment Processing") && (wfStatus == "Applicant Request"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
	if ((wfTask == "Application Review") && (wfStatus == "Complete"))
	{
		var countyStatus = AInfo["County Status"];
		if(countyStatus == "Eligible" || countyStatus == "Undetermined")
		{
			activateTask("Pre-Install Review");
			
		}
		
		if(countyStatus == "Ineligible" || countyStatus == "Withdrawn")
		{
			deactivateTask("Pre-Install Review");
			
		}
		
	}
	
		
	if (wfTask == "Payment Processing" && wfStatus == "Deficiency")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
	/*if (wfTask == "Payment Processing" && wfStatus == "Complete")
	{
		sendEmailsOnSIPRecordOnlyLps("DEQ_SIP_GRANT_FUNDS_DISPERSED");
	}*/

if (matches(wfStatus, "Withdrawn", "Ineligible"))
	   {
	
					wfTasks = aa.workflow.getTaskItemByCapID(capId, null).getOutput();
					for (i in wfTasks) 
						{
						var vWFTask = wfTasks[i];
						//closeTask(vWFTask.getDisposition(), "Withdrawn", "Updated via Script", "Updated via Script");
						deactivateTask(vWFTask.getTaskDescription());
					}
			if(wfStatus == "Withdrawn")
			{
			editAppSpecific("County Status", "Withdrawn");
			editAppSpecific("State Status", "Withdrawn");
			closeTask("Closure", "Withdrawn", "Updated via Script", "Updated via Script");
			}
			if(wfStatus == "Ineligible")
			{
			editAppSpecific("County Status", "Ineligible");
			editAppSpecific("State Status", "Ineligible");
			closeTask("Closure", "Ineligible", "Updated via Script", "Updated via Script");
			}

	
	}


if (wfTask == "Contract Processing" && wfStatus == "Complete")
	{
			var tasksCompleted = false;
			var countyStatus = AInfo["County Status"];
			var wfHist = aa.workflow.getWorkflowHistory(capId, null);
					var wfDates = [];
					var maxWfDate;
					if (wfHist.getSuccess())
					{
						wfHist = wfHist.getOutput();
					} else
					{
						wfHist = new Array();
					}
					for (var h in wfHist)
					{
						if (wfHist[h].getTaskDescription() == "Pre-Install Review")
						{
							logDebug("epoch milliseconds of status date is: " + wfHist[h].getDispositionDate().getEpochMilliseconds());

							//wfDates.push(wfHist[h].getDispositionDate().getEpochMilliseconds());
							//maxWfDate = Math.max.apply(null, wfDates);
							//logDebug("maxWfdate is: " + maxWfDate);

							if (matches(wfHist[h].getDisposition(), "Complete"))
							{
								tasksCompleted = true;
							}

						}
					}
		
		if(tasksCompleted == true && (countyStatus == "Eligible" || countyStatus == "Undetermined"))
			
			{
				deactivateTask("Contract Processing");
				closeTask("Contract Processing", "Complete", "Updated via Script", "Updated via Script");
				sendEmailsOnSIPRecord("DEQ_SIP_OK_TO_INSTALL");
				updateAppStatus("OK to Install");
				activateTask("Post-Install Review");
				
				var wwmRecords = getAppSpecific("WWM Ref #");
			if(wwmRecords != null)

			{

				var parentCapid = aa.cap.getCapID(wwmRecords).getOutput();
					if (parentCapid != null) 
					{
						var capmodel = parentCapid.toString();
						var ida = capmodel.split("-");
						var pcapId = aa.cap.getCapID(ida[0], ida[1], ida[2]).getOutput();
						var pcapResult = aa.cap.getCap(pcapId);
						var pcap = pcapResult.getOutput();
						appTypeResult = pcap.getCapType(); //create CapTypeModel object
						appTypeString = appTypeResult.toString()
						if(appTypeString == "DEQ/WWM/Residence/Application")
						{
			             var emailParams = aa.util.newHashtable();
						addParameter(emailParams, "$$WWMRecord$$",pcapId.getCustomID());
						addParameter(emailParams, "$$altID$$", capId.getCustomID());

 var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels)
        {
            var parcelNumber = Parcels[zz].getParcelNumber();
            logDebug("parcelNumber = " + parcelNumber);
        }
    }
var capAddresses = getAddress(capId);
			  if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }
						addParameter(emailParams, "$$parcel$$", parcelNumber);
var staffEmailArray = new Array();
						var staffEmail = lookup("WWM OK TO INSTALL NOTIFICATION", "Email");
staffEmailArray =staffEmail.split(",");
for (k in staffEmailArray)
						sendNotification("", String(staffEmailArray[k]), "", "DEQ_SIP_WWM_OK_TO_RELEASE", emailParams, null);
						}
					}
				}

			}
			
			if(tasksCompleted == false && (countyStatus == "Eligible" || countyStatus == "Undetermined"))
			
			{
				deactivateTask("Contract Processing");
				closeTask("Contract Processing", "Complete", "Updated via Script", "Updated via Script");
				updateAppStatus("Awaiting Pre-InstallRequiremts");
				

			}
			
			
			if(countyStatus != "Eligible" && countyStatus != "Undetermined")
				
				{
					deactivateTask("Contract Processing");
					closeTask("Contract Processing", "Complete", "Updated via Script", "Updated via Script");
					updateAppStatus("Pending Post-Install Review");
					activateTask("Post-Install Review");
					
				}
}



if (wfTask == "Pre-Install Review" && wfStatus == "Complete")
	{
var tasksCompleted = false;
var countyStatus = AInfo["County Status"];
var wfHist = aa.workflow.getWorkflowHistory(capId, null);
        var wfDates = [];
        var maxWfDate;
        if (wfHist.getSuccess())
        {
            wfHist = wfHist.getOutput();
        } else
        {
            wfHist = new Array();
        }
        for (var h in wfHist)
        {
            if (wfHist[h].getTaskDescription() == "Contract Processing")
            {
                logDebug("epoch milliseconds of status date is: " + wfHist[h].getDispositionDate().getEpochMilliseconds());

                //wfDates.push(wfHist[h].getDispositionDate().getEpochMilliseconds());
                //maxWfDate = Math.max.apply(null, wfDates);
                //logDebug("maxWfdate is: " + maxWfDate);

                if (matches(wfHist[h].getDisposition(), "Complete"))
                {
                    tasksCompleted = true;
                }

            }
        }
		
		if(tasksCompleted == true && (countyStatus == "Eligible" || countyStatus == "Undetermined"))
			
			{
				deactivateTask("Pre-Install Review");
				closeTask("Pre-Install Review", "Complete", "Updated via Script", "Updated via Script");
				sendEmailsOnSIPRecord("DEQ_SIP_OK_TO_INSTALL");
				updateAppStatus("OK to Install");
				activateTask("Post-Install Review");
		
		
			var wwmRecords = getAppSpecific("WWM Ref #");
			if(wwmRecords != null)

			{

				var parentCapid = aa.cap.getCapID(wwmRecords).getOutput();
					if (parentCapid != null) 
					{
						var capmodel = parentCapid.toString();
						var ida = capmodel.split("-");
						var pcapId = aa.cap.getCapID(ida[0], ida[1], ida[2]).getOutput();
						var pcapResult = aa.cap.getCap(pcapId);
						var pcap = pcapResult.getOutput();
						appTypeResult = pcap.getCapType(); //create CapTypeModel object
						appTypeString = appTypeResult.toString()
						if(appTypeString == "DEQ/WWM/Residence/Application")
						{
			             var emailParams = aa.util.newHashtable();
						addParameter(emailParams, "$$WWMRecord$$",pcapId.getCustomID());
						addParameter(emailParams, "$$altID$$", capId.getCustomID());
						var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels)
        {
            var parcelNumber = Parcels[zz].getParcelNumber();
            logDebug("parcelNumber = " + parcelNumber);
        }
    }
var capAddresses = getAddress(capId);
			  if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }
						addParameter(emailParams, "$$parcel$$", parcelNumber);
						var staffEmailArray = new Array();
						var staffEmail = lookup("WWM OK TO INSTALL NOTIFICATION", "Email");
staffEmailArray =staffEmail.split(",");
for (k in staffEmailArray)
						sendNotification("", String(staffEmailArray[k]), "", "DEQ_SIP_WWM_OK_TO_RELEASE", emailParams, null);
						}
					}
				}

			}
			
			if(tasksCompleted == false && (countyStatus == "Eligible" || countyStatus == "Undetermined"))
			
			{
				deactivateTask("Pre-Install Review");
				closeTask("Pre-Install Review", "Complete", "Updated via Script", "Updated via Script");
				updateAppStatus("Awaiting Grant Processing");
				deactivateTask("Post-Install Review");

			}
			
			
			if(countyStatus != "Eligible" && countyStatus != "Undetermined")
				
				{
					deactivateTask("Pre-Install Review");
					closeTask("Pre-Install Review", "Complete", "Updated via Script", "Updated via Script");
					//updateAppStatus("Pending Post-Install Review");
					activateTask("Post-Install Review");
					
				}
}

}
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }
