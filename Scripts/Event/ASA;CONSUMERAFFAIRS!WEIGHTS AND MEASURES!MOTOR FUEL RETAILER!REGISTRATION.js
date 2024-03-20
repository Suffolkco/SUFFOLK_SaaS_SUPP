//ASA;CONSUMERAFFAIRS!WEIGHTS AND MEAUSRES!WAIVERS!NA//
var showDebug = true;

// Remove existing ones in case users click back ACA
voidRemoveFees("WM_12");
voidRemoveFees("WM_RA");

updateFee("WM_12", "CAPOS_WT_MRS", "FINAL", 1, "Y");	
updateFee("WM_RA", "CAPOS_WT_MRS", "FINAL", 200, "Y");		

