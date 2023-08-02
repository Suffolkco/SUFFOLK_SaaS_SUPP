if ((inspType == "010 Field/Periodic Inspection" || inspType == "012 Premise/Facility Inspection") && 
    (inspResult == "Follow-up Action Required" || inspResult == "Permit Issued" || inspResult == "Satisfactory")) {

	var rptParams = aa.util.newHashMap();
	rptParams.put("inspectionid", inspId);
	rptParams.put("agencyid", 'SUFFOLKCO');
	sendNotificationAndGenReport("SS_INSPECTION_RESULTED", "5001 Compliance Inspection Report SSRS", rptParams, [ "Facility Contact", "Facility Owner" ], true);
}

if ((inspType == "011 Reinspection/Follow-up" || inspType == "030 Emergency Investigation" || inspType == "038 Preliminary Inspection" || inspType == "012 Obs Premise/Facility Inspection") && 
    (inspResult == "Follow-up Action Required" || inspResult == "Permit Issued" || inspResult == "Satisfactory")) {

	var rptParams = aa.util.newHashMap();
	rptParams.put("inspectionid", inspId);
	rptParams.put("agencyid", 'SUFFOLKCO');
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