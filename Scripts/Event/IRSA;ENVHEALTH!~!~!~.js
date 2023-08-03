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
if (inspType == "020 Complaint Investigation" && (inspResult == "Satisfactory" || 
inspResult == "Follow-up Action Required"))
{
	send5002Report = true;
	logDebug("Detect " + inspType + ". result: " + inspResult + ". Send 5002 Report.");
}
//021
if (inspType == "021 Complaint Follow-up" && 
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

var userToSend = aa.person.getUser(currentUserID).getOutput();
logDebug("Current user: " + currentUserID);
if (userToSend != null)
{
	var username = userToSend.getFirstName() + " " + userToSend.getLastName();
	logDebug("Current username: " + username);
}


// Send reports based on the variables.
if (send5001Report)
{
	logDebug("*** Emailing 5001 Report ***");
	var rptParams = aa.util.newHashMap();
	rptParams.put("inspectionid", inspId);
	rptParams.put("agencyid", 'SUFFOLKCO');
	rptParams.put("username", username);
	sendNotificationAndGenReport("SS_INSPECTION_RESULTED", "5001 Compliance Inspection Report SSRS", rptParams, [ "Facility Contact", "Facility Owner" ], true);
}
else if (send5002Report)
{
	logDebug("*** Emailing 5002 Report ***");
	var rptParams = aa.util.newHashMap();
	rptParams.put("inspectionid", inspId);
	rptParams.put("agencyid", 'SUFFOLKCO');
	rptParams.put("username", username);
	sendNotificationAndGenReport("SS_INSPECTION_RESULTED", "5002 Observation Inspection Report SSRS", rptParams, [ "Facility Contact", "Facility Owner" ], true);
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

	var capContactObjs = getContactObjs(capId);
	for ( var c in capContactObjs) {
		if (exists(capContactObjs[c].people.getContactType(), toTypesArry)) {
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
			
			addACAUrlsVarToEmail(eParams, capId);

			var name = capContactObjs[c].getContactName();
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
		}//contact type matched
	}//for all contacts
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