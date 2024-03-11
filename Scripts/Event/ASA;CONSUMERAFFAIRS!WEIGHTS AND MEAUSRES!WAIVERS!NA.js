//ASA;CONSUMERAFFAIRS!WEIGHTS AND MEAUSRES!WAIVERS!NA//
var footage = AInfo["Gross Square Footage of Store"];

if (footage != null)
{
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




