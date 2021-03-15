if (balanceDue <= 0 && (capStatus == "About to Expire" || capStatus == "Expired")) {
	updateAppStatus("License Active", "Status Updated by EMSE Script", capId); 
	updateExpStatus(capId, "Active", 365);
} 
