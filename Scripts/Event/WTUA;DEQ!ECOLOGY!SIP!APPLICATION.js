//showDebug = true;
//Notifications based on workflow task and status. 
//EIHMS232
try
{
	if (wfTask == "Application Review" && wfStatus == "Document Request")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_DOC_REQUEST");
	}
	
	if ((wfTask == "Application Review" || wfTask == "Grant Review") && (wfStatus == "Applicant Clarification"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
	
	if ((wfTask == "Application Review" || wfTask == "Grant Review" || wfTask =="Contract Processing") && (wfStatus == "Withdrawn"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_WITHDRAWN");
	}
	
	if ((wfTask == "Application Review" || wfTask == "Grant Review" || wfTask == "Application Review") && (wfStatus == "Ineligible"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_INELIGIBLE");
	}
	
	if ((wfTask == "Grant Review") && (wfStatus == "Document Request" || wfStatus == "Deficiency"))
	{
		sendEmailsOnSIPRecord("DEQ_SIP_DOC_REQUEST");
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
		sendEmailsOnSIPRecordOnlyContacts("DEQ_SIP_GRANT_AWARD");
	}
	
	if (wfTask == "Contract Processing" && wfStatus == "Incomplete")
	{
		sendEmailsOnSIPRecordOnlyContacts("DEQ_SIP_GRANT_AWARD");
	}
	
	
	if ((wfTask == "Post-Install Review" || wfTask == "Pre-Install Review" || wfTask == "Payment Processing") && (wfStatus == "Vendor Request"))
	{
		sendEmailsOnSIPRecordOnlyWWMLP("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
		
	if ((wfTask == "Post-Install Review" || wfTask == "Pre-Install Review" || wfTask == "Payment Processing") && (wfStatus == "Applicant Request"))
	{
		sendEmailsOnSIPRecordOnlyContacts("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
		
	if (wfTask == "Payment Processing" && wfStatus == "Deficiency")
	{
		sendEmailsOnSIPRecord("DEQ_SIP_CLARIFICATION_REQUEST");
	}
	
	if (wfTask == "Payment Processing" && wfStatus == "Complete")
	{
		sendEmailsOnSIPRecordOnlyLps("DEQ_SIP_GRANT_FUNDS_DISPERSED");
	}
	
}
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }
