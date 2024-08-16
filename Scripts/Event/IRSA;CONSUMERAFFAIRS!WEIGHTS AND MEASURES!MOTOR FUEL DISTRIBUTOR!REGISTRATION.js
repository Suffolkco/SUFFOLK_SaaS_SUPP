showDebug = true;

logDebug("inspResult: " + inspResult);

b1ExpResult = aa.expiration.getLicensesByCapID(capId)
if (b1ExpResult.getSuccess())
{
	if (b1ExpResult.getOutput() != "" && b1ExpResult.getOutput() != null)
	{
		var b1Exp = b1ExpResult.getOutput();
		var curExp = b1Exp.getExpDate();
		if (curExp != null)
		{
			var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
			var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
			var dateDif;
			dateDif = parseFloat(dateDiff(todayDate, curExpCon));
			var dateDifRound = Math.floor(dateDif);
			logDebug("todayDate: " + todayDate);		 
			logDebug("<b>" + capIDString + "<b>" + ": Expiration date: " + curExpCon + " datedif: " + dateDifRound);
			if (dateDifRound <= 90)
			{
				message = 'The license is expiring soon on: ' + curExpCon;		
				reportName = 'Motor Fuel Distributor Registration Application';			
				var reportInfoModel = aa.reportManager.getReportInfoModelByName(reportName);  //get report info to change the way report runs
				if (reportInfoModel.getSuccess()) 
				{
					report = reportInfoModel.getOutput();
					report.setModule("ConsumerAffairs");
					report.setCapId(capId);
					reportInfo = report.getReportInfoModel();
					report.setReportParameters(reportParams);
					reportRun = aa.reportManager.runReport(reportParams, reportDetail);
					
					showMessage = true;
					comment(message);
					comment(reportRun.getOutput());
				}
			}
		}
	}
}
