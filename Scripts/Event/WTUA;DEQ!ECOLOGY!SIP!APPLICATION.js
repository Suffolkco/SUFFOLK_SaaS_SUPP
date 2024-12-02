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

		if ((countyStatus != "Ineligible" && countyStatus != "Withdrawn"))

		//if(nys != "CHECKED")
		{
			sendEmailsOnSIPRecord("DEQ_SIP_APP_COMPLETE");

		}
		var countyStatus = AInfo["County Status"];
		if (countyStatus == "Ineligible" || countyStatus == "Withdrawn")
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

		if ((countyStatus == "Ineligible" || countyStatus == "Withdrawn") && (stateStatus == "Eligible"))
		{
			sendEmailsOnSIPRecord("DEQ_NYS_GRANT_AWARD");
		}

		aa.print("nys" + nys);
		//if (nys == "UNCHECKED" || nys == undefined || nys == "")

		if (countyStatus == "Eligible")
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
		if (countyStatus == "Eligible" || countyStatus == "Undetermined")
		{
			activateTask("Pre-Install Review");

		}

		if (countyStatus == "Ineligible" || countyStatus == "Withdrawn")
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
		if (wfStatus == "Withdrawn")
		{
			editAppSpecific("County Status", "Withdrawn");
			editAppSpecific("State Status", "Withdrawn");
			closeTask("Closure", "Withdrawn", "Updated via Script", "Updated via Script");
		}
		if (wfStatus == "Ineligible")
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
		}
		else
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

		if (tasksCompleted == true && (countyStatus == "Eligible" || countyStatus == "Undetermined"))

		{
			deactivateTask("Contract Processing");
			closeTask("Contract Processing", "Complete", "Updated via Script", "Updated via Script");
			//sendEmailsOnSIPRecord("DEQ_SIP_OK_TO_INSTALL");
			sendEmailsOnSIPRecordOKInstall("DEQ_SIP_OK_TO_INSTALL");
			updateAppStatus("OK to Install");
			activateTask("Post-Install Review");

			var wwmRecords = getAppSpecific("WWM Ref #");
			if (wwmRecords != null)

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
						if (appTypeString == "DEQ/WWM/Residence/Application")
					{
						
						var vcomment = "Grants approved, please date and release plans.";
						createCapCommentForSip(vcomment,pcapId);
						var emailParams = aa.util.newHashtable();
						addParameter(emailParams, "$$WWMRecord$$", pcapId.getCustomID());
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
							logDebug("Record address:" + capAddresses[0]);
							addParameter(emailParams, "$$address$$", capAddresses[0]);
						}
						addParameter(emailParams, "$$parcel$$", parcelNumber);
						var staffEmailArray = new Array();
						var staffEmail = lookup("WWM OK TO INSTALL NOTIFICATION", "Email");
						staffEmailArray = staffEmail.split(",");
						for (k in staffEmailArray)
							sendNotification("", String(staffEmailArray[k]), "", "DEQ_SIP_WWM_OK_TO_RELEASE", emailParams, null);
					}
				}
			}

		}

		if (tasksCompleted == false && (countyStatus == "Eligible" || countyStatus == "Undetermined"))

		{
			deactivateTask("Contract Processing");
			closeTask("Contract Processing", "Complete", "Updated via Script", "Updated via Script");
			updateAppStatus("Awaiting Pre-InstallRequiremts");


		}


		if (countyStatus != "Eligible" && countyStatus != "Undetermined")

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
		}
		else
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

		if (tasksCompleted == true && (countyStatus == "Eligible" || countyStatus == "Undetermined"))

		{
			deactivateTask("Pre-Install Review");
			closeTask("Pre-Install Review", "Complete", "Updated via Script", "Updated via Script");
			//sendEmailsOnSIPRecord("DEQ_SIP_OK_TO_INSTALL");
			sendEmailsOnSIPRecordOKInstall("DEQ_SIP_OK_TO_INSTALL");
			updateAppStatus("OK to Install");
			activateTask("Post-Install Review");


			var wwmRecords = getAppSpecific("WWM Ref #");
			if (wwmRecords != null)

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
						if (appTypeString == "DEQ/WWM/Residence/Application")
					{
						
						var vcomment = "Grants approved, please date and release plans.";
						createCapCommentForSip(vcomment,pcapId);
						var emailParams = aa.util.newHashtable();
						addParameter(emailParams, "$$WWMRecord$$", pcapId.getCustomID());
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
							logDebug("Record address:" + capAddresses[0]);
							addParameter(emailParams, "$$address$$", capAddresses[0]);
						}
						addParameter(emailParams, "$$parcel$$", parcelNumber);
						var staffEmailArray = new Array();
						var staffEmail = lookup("WWM OK TO INSTALL NOTIFICATION", "Email");
						staffEmailArray = staffEmail.split(",");
						for (k in staffEmailArray)
							sendNotification("", String(staffEmailArray[k]), "", "DEQ_SIP_WWM_OK_TO_RELEASE", emailParams, null);
					}
				}
			}

		}

		if (tasksCompleted == false && (countyStatus == "Eligible" || countyStatus == "Undetermined"))

		{
			deactivateTask("Pre-Install Review");
			closeTask("Pre-Install Review", "Complete", "Updated via Script", "Updated via Script");
			updateAppStatus("Awaiting Grant Processing");
			deactivateTask("Post-Install Review");

		}


		if (countyStatus != "Eligible" && countyStatus != "Undetermined")

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


function sendEmailsOnSIPRecordOKInstall(templateName)
{

	var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray(capId);
	var dubCheckemails = "";
	var conEmail = "";
	var lpEmail = "";
	var fromEmail = "noreplyehims@suffolkcountyny.gov";
	varcapAddresses = null;

	var emailAddressArray = new Array();


	if (matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}

	//Contact Emails
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			logDebug("Contact email: " + conArray[con].email);

			if (conArray[con].contactType == "Property Owner")
			{
				var poEmails = conArray[con].email;
				addParameter(emailParams, "$$POEMAIL$$", String(poEmails));
			}

			conEmail = conArray[con].email;
			if (conEmail && dubCheckemails.indexOf(conEmail) == -1)
			{
				if (dubCheckemails)
					dubCheckemails = dubCheckemails + ";" + conEmail;
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
			if (lpEmail && dubCheckemails.indexOf(lpEmail) == -1)
			{
				if (dubCheckemails)
					dubCheckemails = dubCheckemails + ";" + lpEmail;
				else
					dubCheckemails = "" + lpEmail;
			}
		}
	}

	//Email from ASIT table
	var poEmails = "";
	for (var k = 0; k < sipPO.length; k++)
	{
		var poEmail = sipPO[k]["Email Address"];


		if (!matches(poEmail, null, undefined, ""))
		{
			if (poEmail && dubCheckemails.indexOf(poEmail) == -1)
			{
				if (dubCheckemails)
				{
					dubCheckemails = dubCheckemails + ";" + poEmail;

				}
				else
				{
					dubCheckemails = "" + poEmail;

				}


			}
		}
	}
	//addParameter(emailParams, "$$POEMAIL$$", String(poEmails));

	//getRecordParams4Notification(emailParams);
	//getWorkflowParams4Notification(emailParams);

	var comments = "";
	if (controlString == "WorkflowTaskUpdateAfter")
	{

		addParameter(emailParams, "$$wfComments$$", wfComment);
		comments = wfComment;
		addParameter(emailParams, "$$WFstatusdate$$", wfDate);
	}
	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
	addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
	//addParameter(emailParams, "$$shortNotes$$", shortNotes); 
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());

	addParameter(emailParams, "$$ACAURL$$", acaSite);


	var capAddresses = getAddress(capId);
	if (capAddresses != null)
	{
		logDebug("Record address:" + capAddresses[0]);
		addParameter(emailParams, "$$address$$", capAddresses[0]);
	}

	var parcelArray = getParcel(capId);


	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess())
	{
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels)
		{
			var parcelNumber = Parcels[zz].getParcelNumber();
			logDebug("parcelNumber = " + parcelNumber);
			addParameter(emailParams, "$$parcelNBR$$", parcelNumber);

		}
	}


	var openDate = aa.cap.getCap(capId).getOutput().getFileDate();

	if (openDate != null)
	{
		var openDateFormatted = openDate.getMonth() + "/" + openDate.getDayOfMonth() + "/" + openDate.getYear();
		logDebug("openDateFormatted : " + openDateFormatted);
		addParameter(emailParams, "$$opendate$$", openDateFormatted);

	}
	aa.print(dubCheckemails);
	var docList = getDocumentList();
	var docDates = [];
	var maxDate;

	for (doc in docList)
	{
		if (matches(docList[doc].getDocCategory(), "Proposal Eligibility Memo"))
		{
			logDebug("document type is: " + docList[doc].getDocCategory() + " and upload datetime of document is: " + docList[doc].getFileUpLoadDate().getTime());
			docDates.push(docList[doc].getFileUpLoadDate().getTime());
			maxDate = Math.max.apply(null, docDates);
			logDebug("maxdate is: " + maxDate);

			if (docList[doc].getFileUpLoadDate().getTime() == maxDate)
			{
				var docType = docList[doc].getDocCategory();
				var docFileName = docList[doc].getFileName();
			}
		}
	}

	//preparing most recent sketch document for email attachment
	var docToSend = prepareDocumentForEmailAttachment(capId, "Proposal Eligibility Memo", docFileName);
	logDebug("docToSend" + docToSend);
	docToSend = docToSend === null ? [] : [docToSend];
	if (!matches(docToSend, null, undefined, ""))
	{
		reportFile.push(docToSend);
	}
	if (comments != null && comments != "")
		var containsNoemail = comments.contains("NOEMAIL");

	if (dubCheckemails != null && !(containsNoemail))
	{

		sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
	}


}


function createCapCommentForSip(vComment,wCapId) {
    var vCapId = wCapId;
    /*var vDispOnInsp = "N";
    if (arguments.length >= 2 && typeof(arguments[1]) != "undefined" && arguments[1] != null && arguments[1] != "") {
        vCapId = arguments[1]
    }
    if (arguments.length >= 3 && typeof(arguments[2]) != "undefined" && arguments[2] != null && arguments[2] != "") {
        vDispOnInsp = arguments[2]
    }*/
    var comDate = aa.date.getCurrentDate();
    var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
    capCommentScriptModel.setCapIDModel(vCapId);
    capCommentScriptModel.setCommentType("COMMENT ADDED VIA SCRIPT");
    capCommentScriptModel.setSynopsis("");
    capCommentScriptModel.setText(vComment);
    capCommentScriptModel.setAuditUser(currentUserID);
    capCommentScriptModel.setAuditStatus("A");
    capCommentScriptModel.setAuditDate(comDate);
    var capCommentModel = capCommentScriptModel.getCapCommentModel();
    //capCommentModel.setDisplayOnInsp(vDispOnInsp);
    aa.cap.createCapComment(capCommentModel);
    logDebug("Comment Added")
}