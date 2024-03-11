//ASA;CONSUMERAFFAIRS!WEIGHTS AND MEAUSRES!WAIVERS!NA//
var showDebug = true;
var emailAddress = "ada.chan@suffolkcountyny.gov";


addFee("CAPOS_WT_MRS", "IPW_WM_W1", "FINAL", 1, "Y")

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
if (footage != null)
{
	logDebug("footage: " + parseInt(footage));

	if (parseInt(footage) <= 3000)
	{
		updateFee("CAPOS_WT_MRS", "IPW_WM_W1", "FINAL", 1, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W2", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W3", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "PW_WM_W4", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W5", "FINAL", 0, "Y");
		
	}
	else if (parseInt(footage) > 3000 && parseInt(footage) <= 10000)
	{
		updateFee("CAPOS_WT_MRS", "IPW_WM_W2", "FINAL", 1, "Y");

		updateFee("CAPOS_WT_MRS", "IPW_WM_W1", "FINAL", 0, "Y");			
		updateFee("CAPOS_WT_MRS", "IPW_WM_W3", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "PW_WM_W4", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W5", "FINAL", 0, "Y");

		
	}
	else if (parseInt(footage) > 10000 && parseInt(footage) <= 30000)
	{
		updateFee("CAPOS_WT_MRS", "IPW_WM_W3", "FINAL", 1, "Y");

		updateFee("CAPOS_WT_MRS", "IPW_WM_W1", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W2", "FINAL", 0, "Y");			
		updateFee("CAPOS_WT_MRS", "PW_WM_W4", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W5", "FINAL", 0, "Y");
		
	}
	else if (parseInt(footage) > 30000 && parseInt(footage) <= 90000)
	{
		updateFee("CAPOS_WT_MRS", "IPW_WM_W4", "FINAL", 1, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W1", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W2", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W3", "FINAL", 0, "Y");			
		updateFee("CAPOS_WT_MRS", "IPW_WM_W5", "FINAL", 0, "Y");
		
	}
	else if (parseInt(footage) > 90000)
	{

		updateFee("CAPOS_WT_MRS", "IPW_WM_W5", "FINAL", 1, "Y");

		updateFee("CAPOS_WT_MRS", "IPW_WM_W1", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W2", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "IPW_WM_W3", "FINAL", 0, "Y");
		updateFee("CAPOS_WT_MRS", "PW_WM_W4", "FINAL", 0, "Y");
		
	}
}


aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "ASA WM", emailText);

