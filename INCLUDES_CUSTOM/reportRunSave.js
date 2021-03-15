function reportRunSave(reportName, view, edmsSave, storeToDisk, reportModule, reportParams) 
{
	var name = "";
	var rFile = new Array();
	var error = "";
	var reportModel = aa.reportManager.getReportModelByName(reportName); //get detail of report to drive logic
	if (reportModel.getSuccess()) 
	{
		reportDetail = reportModel.getOutput();
		name = reportDetail.getReportDescription();
		if (name == null || name == "") 
		{
			name = reportDetail.getReportName();
		}
		var reportInfoModel = aa.reportManager.getReportInfoModelByName(reportName);  //get report info to change the way report runs
		if (reportInfoModel.getSuccess()) 
		{ 
			report = reportInfoModel.getOutput();
			report.setModule(reportModule); 
			report.setCapId(capId);
			reportInfo = report.getReportInfoModel();
			report.setReportParameters(reportParams);
			//process parameter selection and EDMS save
			if (edmsSave == true && view == true ) 
			{
				reportRun = aa.reportManager.runReport(reportParams, reportDetail);
				showMessage = true;
				comment(reportRun.getOutput()); //attaches report
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(false);
					reportResult = aa.reportManager.getReportResult(report); //attaches report
					if (reportResult.getSuccess()) 
					{
						reportOut = reportResult.getOutput();
						reportOut.setName(changeNameofAttachment(reportOut.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportOut);
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug reportFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message, line 52";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			} 
			else if (edmsSave == true && view == false) 
			{
				reportInfo.setNotSaveToEDMS(false);
				reportResult = aa.reportManager.getReportResult(report); //attaches report
				if (reportResult.getSuccess()) 
				{
					reportOut = reportResult.getOutput();
					reportOut.setName(changeNameofAttachment(reportOut.getName()));
					if (storeToDisk == true) 
					{
						rFile = aa.reportManager.storeReportToDisk(reportOut);
						if (rFile.getSuccess()) 
						{
							logDebug("Storing to disk");
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
					}
				} 
				else 
				{
					rFile = new Array();
					error = "Report failed to run and store to disk.  Debug reportResult for error message, line 93";
					logDebug(error);
				}
			} 
			else if (edmsSave == false && view == true) 
			{
				reportRun = aa.reportManager.runReport(reportParams, reportDetail);
				showMessage = true;
				comment(reportRun.getOutput());
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(true);
					reportResult = aa.reportManager.getReportResult(report);
					if (reportResult.getSuccess()) 
					{
						reportResult = reportResult.getOutput();
						reportResult.setName(changeNameofAttachment(reportResult.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportResult);
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message, line 125";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			} 
			else if (edmsSave == false && view == false) 
			{
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(true);
					reportResult = aa.reportManager.getReportResult(report);
					if (reportResult.getSuccess()) 
					{
						reportResult = reportResult.getOutput();
						reportResult.setName(changeNameofAttachment(reportResult.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportResult);
						logDebug("Report File: " + rFile.getSuccess());
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
							logDebug("Actual Report: " + rFile);
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					}
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message, line 163";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			}
		} 
		else 
		{
			rFile = new Array();
			error = "Failed to get report information.  Check report name matches name in Report Manager.";
			logDebug(error);
		}
	} 
	else 
	{
		rFile = new Array();
		error = "Failed to get report detail.  Check report name matches name in Report Manager.";
		logDebug(error);
	}
	function changeNameofAttachment(attachmentName) 
	{
		rptExtLoc = attachmentName.indexOf(".");
		rptLen = attachmentName.length();
		ext = attachmentName.substr(rptExtLoc, rptLen);
		attachName = name + ext;
		return attachName
	}	
	return rFile;
}