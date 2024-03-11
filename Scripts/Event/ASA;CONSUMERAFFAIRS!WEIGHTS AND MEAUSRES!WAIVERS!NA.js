//ASA;CONSUMERAFFAIRS!WEIGHTS AND MEAUSRES!WAIVERS!NA//
var showDebug = true;
var emailAddress = "ada.chan@suffolkcountyny.gov";
var emailText ="";

var footage;
if(!publicUser)
{
	footage =getAppSpecific("Gross Square Footage of Store", capId);
	logDebug("This is the value for AA Gross Square Footage of Store: " + footage);
}
else
{
	footage = AInfo["Gross Square Footage of Store"];
	logDebug("This is the value for Gross Square Footage of Store: " + footage);
}
if (!matches(footage, null, undefined, ""))
{
	logDebug("footage: " + parseInt(footage));

	if (parseInt(footage) <= 3000)
	{
		updateFee("IPW_WM_W1", "CAPOS_WT_MRS", "FINAL", 1, "Y");
		updateFee("IPW_WM_W2","CAPOS_WT_MRS",  "FINAL", 0, "Y");
		updateFee("IPW_WM_W3", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("PW_WM_W4", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W5", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		
	}
	else if (parseInt(footage) > 3000 && parseInt(footage) <= 10000)
	{
		updateFee("IPW_WM_W2", "CAPOS_WT_MRS", "FINAL", 1, "Y");

		updateFee("IPW_WM_W1", "CAPOS_WT_MRS",  "FINAL", 0, "Y");			
		updateFee("IPW_WM_W3", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("PW_WM_W4", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W5", "CAPOS_WT_MRS", "FINAL", 0, "Y");

		
	}
	else if (parseInt(footage) > 10000 && parseInt(footage) <= 30000)
	{
		updateFee("IPW_WM_W3", "CAPOS_WT_MRS", "FINAL", 1, "Y");

		updateFee("IPW_WM_W1", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W2", "CAPOS_WT_MRS", "FINAL", 0, "Y");			
		updateFee("PW_WM_W4", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W5", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		
	}
	else if (parseInt(footage) > 30000 && parseInt(footage) <= 90000)
	{
		updateFee("IPW_WM_W4","CAPOS_WT_MRS",  "FINAL", 1, "Y");
		updateFee("IPW_WM_W1", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W2", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W3", "CAPOS_WT_MRS", "FINAL", 0, "Y");			
		updateFee("IPW_WM_W5", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		
	}
	else if (parseInt(footage) > 90000)
	{

		updateFee("IPW_WM_W5", "CAPOS_WT_MRS", "FINAL", 1, "Y");

		updateFee("IPW_WM_W1", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W2", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("IPW_WM_W3", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		updateFee("PW_WM_W4", "CAPOS_WT_MRS", "FINAL", 0, "Y");
		
	}
}


aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "ASA WM", emailText);

