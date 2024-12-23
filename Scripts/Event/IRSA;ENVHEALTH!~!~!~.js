//IRSA;ENVHEALTH///
var send5001Report = false; // Compliance
var send5002Report = false; // Observation
logDebug("*** Inspection type detected***:" + inspType + ', ' + inspResult);

//010, 012 - 5001 compliance checklist
//006, 011, 012  obs, 013, 015, 018, 019, 020,021, 030, 031,038 - 5002 observation checklist

// 014, 015 no report sent

//006
if (inspType == "006 Field Meeting/Conference" && inspResult == "Not Applicable")
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
// 010
else if (inspType == "010 Field/Periodic Inspection" && 
(inspResult == "Satisfactory" || inspResult == "Follow-up Action Required" || inspResult == "Filed with Violations" || inspResult =="Voluntary Closure"))
{
	send5001Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5001 Report.");
}
//011
else if (inspType == "011 Reinspection/Follow-up" &&
(inspResult == "Brought to Compliance" || inspResult == "Follow-up Action Required" || inspResult == "Filed with Violations" || inspResult =="Voluntary Closure"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//012
else if (inspType == "012 Premise/Facility Inspection" &&
(inspResult == "Satisfactory" || inspResult =="Follow-up Action Required" || inspResult =="Filed with Violations" || inspResult =="Voluntary Closure"
|| "Permit Issued"))
{
	send5001Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5001 Report.");
}
//012 obs
else if (inspType == "012 Obs Premise/Facility Inspection" &&
(inspResult == "Satisfactory" || inspResult == "Follow-up Action Required" || inspResult == "Filed with Violations" || inspResult =="Voluntary Closure"
|| "Permit Issued"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//013
else if (inspType == "013 Field Survey" && (inspResult == "Not Applicable" || inspResult == "No Contact" || inspResult =="Closed for Season"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//018
else if (inspType == "018 New Construction Inspection" && (inspResult == "Not Applicable"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//019
else if (inspType == "019 No Inspection/Out of Business" && (inspResult == "Out of Business"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//020
else if (inspType == "020 Complaint Investigation" && (inspResult == "Satisfactory" || 
inspResult == "Follow-up Action Required"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//021
else if (inspType == "021 Complaint Follow-up" && 
(inspResult == "Brought to Compliance" || inspResult == "Follow-up Action Required"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}

//030, 031, 038
else if ((inspType == "030 Emergency Investigation" || inspType == "038 Preliminary Inspection" || inspType == "031 Epidemiological Investigation") && 
    (inspResult == "Not Applicable")) 
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
else
{
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Will not send report.");
}

logDebug("*** send5001Report ***:" + send5001Report);
logDebug("*** send5002Report ***:" + send5002Report);




//PHP -96 Do not email if we update only
var insp = aa.inspection.getInspection(capId, inspId).getOutput();
logDebug("Get inspection")
inspModel = insp.getInspection();
var vInspectionActivity = inspModel.getActivity();
logDebug("Get inspection activity");
//debugObject(vInspectionActivity);
logDebug(vInspectionActivity.getVehicleID())

// 1. When UPDATE button has been pressed and no email to be sent. We DO NOT want the Inpsection result report to be updated
// NOR ACA user able to see it. 
if(!matches(vInspectionActivity.getVehicleID(), null, "", undefined) && 
vInspectionActivity.getVehicleID().toUpperCase() == 'NO')
{
	logDebug("User selected NOT to send email");
	logDebug("We do not attached inspection result report");
	//PHP-112: Do not publish the report if no email is to be sent to operator);
	//	runReportAndAttachAsync("Inspection Result", "Inspection Result", "EH_FOOD", "Correspondence", inspId, inspType);

}
// 2. When UPDATE button has been pressed yes/Yes to send email.address.
// Update report
else if (!matches(vInspectionActivity.getVehicleID(), null, "", undefined) &&
vInspectionActivity.getVehicleID().toUpperCase() == 'YES')
{
	logDebug("User selected: " + vInspectionActivity.getVehicleID().toUpperCase());
	logDebug("Attached inspection result report");
	
	// Update new report to the system
	runReportAndAttachAsync("Inspection Result", "Inspection Result", "EH_FOOD", "Correspondence", inspId, inspType);
}
 // 3. When UPDATE button has been pressed or any text with the exception of yes/Yes to send email.address.
// This scenario is to make sure to cover all UPDATE button scenarios.
else if (!matches(vInspectionActivity.getVehicleID(), null, "", undefined))
{
	logDebug("User selected: " + vInspectionActivity.getVehicleID().toUpperCase());
	logDebug("Attached inspection result report");
	
	// Update new report to the system
	runReportAndAttachAsync("Inspection Result", "Inspection Result", "EH_FOOD", "Correspondence", inspId, inspType);
}

else // 4. Below is scenario where user hits result inspection with SAVE button.
{
	// Send reports based on the variables.
	if (send5001Report)
	{
		logDebug("*** Emailing 5001 Report ***");
		var rptParams = aa.util.newHashMap();
		rptParams.put("inspectionid", inspId);
		rptParams.put("agencyid", 'SUFFOLKCO');	
		sendNotificationAndGenReport("SS_INSPECTION_RESULTED", "5001 Compliance Inspection Report SSRS", rptParams, [ "Facility Contact", "Facility Owner" ], true);
	}
	else if (send5002Report)
	{
		logDebug("*** Emailing 5002 Report ***");
		var rptParams = aa.util.newHashMap();
		rptParams.put("inspectionid", inspId);
		rptParams.put("agencyid", 'SUFFOLKCO');	
		sendNotificationAndGenReport("SS_INSPECTION_RESULTED", "5002 Observation Inspection Report SSRS", rptParams, [ "Facility Contact", "Facility Owner" ], true);
	}
}

function sendNotificationAndGenReport(notificationTemplateName, reportName, rptParams, toTypesArry, attachRptToEmail) {
	var reportFiles = null;

	if (reportName != null && reportName != "") {
		reportFiles = new Array();

		var report = aa.reportManager.getReportInfoModelByName(reportName);
		if (report == null) {
			logDebug("**WARN sendNotificationAndGenReport() getReportInfoModelByName returned NULL, reportType=" + reportName);
			return false;
		}
		if (report.getSuccess()) {
			report = report.getOutput();
			report.setModule(cap.getCapModel().getModuleName());
			report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
			report.setReportParameters(rptParams);

			report.getEDMSEntityIdModel().setAltId(capId.getCustomID());
			report.getEDMSEntityIdModel().setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());

			var hasPerm = aa.reportManager.hasPermission(reportName, aa.getAuditID());
			if (hasPerm.getSuccess() && hasPerm.getOutput().booleanValue()) {
				var reportResult = aa.reportManager.getReportResult(report);
				if (reportResult.getSuccess()) {
					reportResult = reportResult.getOutput();
					var reportFile = aa.reportManager.storeReportToDisk(reportResult);
					if (reportFile.getSuccess()) {
						reportFile = reportFile.getOutput();
						reportFiles.push(reportFile);
					} else {
						logDebug("**WARN sendNotificationAndGenReport() storeReportToDisk failed: " + reportFile.getErrorMessage());
					}
				}//report result OK
			}//has permission
		} else {//report OK
			logDebug("**WARN sendNotificationAndGenReport() getReportInfoModelByName failed: " + report.getErrorMessage());
			return false;
		}
	}//report required

	if (!attachRptToEmail) {
		reportFiles = new Array();
	}

	var mailFrom = lookup("RETURN_EMAILS", "PublicWorksGeneral");
	if (!mailFrom) {
		mailFrom = "";
	}

	var userToSend = aa.person.getUser(currentUserID).getOutput();
	logDebug("Current user: " + currentUserID);
	var usrname = "";
	if (userToSend != null)
	{
		usrname = userToSend.getFirstName() + " " + userToSend.getLastName();
		logDebug("Current username: " + usrname);
	}

	logDebug("username: " + usrname);

	var capContactObjs = getContactObjs(capId);
	for ( var c in capContactObjs) {
		if (exists(capContactObjs[c].people.getContactType(), toTypesArry)) {

			logDebug("Contact status is: " + capContactObjs[c].people.getAuditStatus());
			// Only if contact is active
			if (capContactObjs[c].people.getAuditStatus() != 'I')
			{
				// Set email parameters
				var eParams = aa.util.newHashtable();

				addParameter(eParams, "$$altId$$", cap.getCapModel().getAltID());
				addParameter(eParams, "$$altID$$", cap.getCapModel().getAltID());
				addParameter(eParams, "$$recordAlias$$", cap.getCapModel().getCapType().getAlias());
				addParameter(eParams, "$$recordStatus$$", cap.getCapModel().getCapStatus());

				addParameter(eParams, "$$inspResult$$", inspResult);
				addParameter(eParams, "$$inspComment$$", inspComment);
				addParameter(eParams, "$$inspResultDate$$", inspResultDate);
				//addParameter(eParams, "$$inspGroup$$", inspGroup);
				addParameter(eParams, "$$inspType$$", inspType);
				addParameter(eParams, "$$inspSchedDate$$", inspSchedDate);
				logDebug("*** username ***: " + usrname);
				addParameter(eParams,	"$$username$$", usrname);
				addACAUrlsVarToEmail(eParams, capId);
				//debugObject(capContactObjs[c].people);
				var name = getContactName(capContactObjs[c]);
				addParameter(eParams, "$$ContactName$$", name);
				addParameter(eParams, "$$contactFullName$$", name);

				eParams = getACARecordParam4Notification(eParams);
				adResult = aa.address.getPrimaryAddressByCapID(capId, "Y");
				if (adResult.getSuccess()) {
					ad = adResult.getOutput().getAddressModel();
					addParameter(eParams, "$$FullAddress$$", ad.getDisplayAddress());
				}

				var altIDScriptModel = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
				var sent = aa.document.sendEmailAndSaveAsDocument("", capContactObjs[c].people.getEmail(), "", notificationTemplateName, eParams, altIDScriptModel, reportFiles);
				if (!sent.getSuccess()) {
					logDebug("**WARN sendNotificationAndGenReport(), Error: " + sent.getErrorMessage());
				}
			}
			else
			{
				logDebug("Skip sending email to this contact. Contact status is: " + capContactObjs[c].people.getAuditStatus());
				logDebug("**Full Name:  " +  capContactObjs[c].people.getFullName());
				logDebug("**First Name:  " +  capContactObjs[c].people.getFirstName());
				logDebug("**Last Name:  " +  capContactObjs[c].people.getLastName());
				logDebug("**Contact ID: " +  capContactObjs[c].people.getContactSeqNumber());		

			}
		}//contact type matched
	}//for all contacts
}
function runReportAndAttachAsync(reportName, documentName, documentGroup, documentCategory, inspectionId, inspectionType) {
    var scriptName = "STDBASE_RUNREPORTANDATTACHASYNC";
    var envParameters = aa.util.newHashMap();
    envParameters.put("DocumentName", String(documentName));
    envParameters.put("DocumentGroup", String(documentGroup));
    envParameters.put("DocumentCategory", String(documentCategory));
    envParameters.put("InspectionID", inspectionId);
    envParameters.put("InspectionType", String(inspectionType));
    envParameters.put("ReportName", String(reportName));
    envParameters.put("ReportUser", currentUserID);
    envParameters.put("CustomCapId", capId.getCustomID());
    envParameters.put("CapID", capId);
    envParameters.put("ServProvCode", servProvCode);
    envParameters.put("EventName", controlString);





    logDebug("(runReportAndAttachAsync) Calling runAsyncScript for [" + reportName + "]");
    aa.runAsyncScript(scriptName, envParameters);

}


function debugObject(object) {
	var output = ''; 
	for (property in object) { 
	  output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	} 
	logDebug(output);
} 

function addACAUrlsVarToEmail(vEParams, capId) {
    // Get base ACA site from standard choices
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

    // Save Base ACA URL
    addParameter(vEParams, "$$acaURL$$", acaSite);

    // Save Record Direct URL
    addParameter(vEParams, "$$acaRecordURL$$", acaSite + getACAUrl(capId));

    var paymentUrl = vEParams.get("$$acaRecordURL$$");
    paymentUrl = paymentUrl.replace("type=1000", "type=1009");
    addParameter(vEParams, "$$acaPaymentUrl$$", paymentUrl);
}


function getInspectionId(capIdObJ){

    var inspResults = aa.inspection.getInspections(capIdObJ);
    if (inspResults.getSuccess()) {
        var inspAll = inspResults.getOutput();
        var inspectionId;
        for (ii in inspAll)
        {
            inspectionId = inspAll[ii].getIdNumber();		// Inspection identifier
        }
        return inspectionId;
    } else{
        logDebug("**ERROR: getting inspections: " + inspResults.getErrorMessage());
        return false;
    }
}

function getContactName(vConObj) {

	logDebug("**Contact Type Flag:  " + vConObj.people.getContactTypeFlag());
	logDebug("**Full Name:  " + vConObj.people.getFullName());
	logDebug("**First Name:  " + vConObj.people.getFirstName());
	logDebug("**Last Name:  " + vConObj.people.getLastName());
	logDebug("**Contact ID: " + vConObj.people.getContactSeqNumber());		
	if (vConObj.people.getContactTypeFlag() == "organization") {
		if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
			return vConObj.people.getBusinessName();
		
		return vConObj.people.getBusinessName2();
	}
	else {
		if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "") {
			return vConObj.people.getFullName();
		}
		if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null) {
			return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
		}
		if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
			return vConObj.people.getBusinessName();
	
		return vConObj.people.getBusinessName2();
	}
}