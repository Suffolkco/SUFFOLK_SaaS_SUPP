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
		sendEmailsOnSIPRecord("DEQ_SIP_APP_COMPLETE");
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Grant Awarded")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_GRANT_AWARD");
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Grant Packet Mailed")
	{
sendEmailsOnSIPRecord("DEQ_SIP_GRANT_PACKET_MAILED");
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Incomplete")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_GRANT_PACKET_REVISION");
	}
	
	
	if ((wfTask == "Post-Install Review" || wfTask == "Pre-Install Review" || wfTask == "Payment Processing") && (wfStatus == "Vendor Request"))
	{
		sendEmailsOnSIPRecordOnlyWWMLP("DEQ_SIP_CLARIFICATION_REQUEST");
	}

	if (wfTask == "Pre-Install Review" && wfStatus == "Complete")
{
	sendEmailsOnSIPRecord("DEQ_SIP_OK_TO_INSTALL");
}
	if ((wfTask == "Post-Install Review" || wfTask == "Pre-Install Review" || wfTask == "Payment Processing") && (wfStatus == "Applicant Request"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
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
}
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }
