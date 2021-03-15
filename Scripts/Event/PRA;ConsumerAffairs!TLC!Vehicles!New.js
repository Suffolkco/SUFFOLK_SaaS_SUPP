if (balanceDue <= 0 && (capStatus == "About to Expire" || capStatus == "Expired")) {
	updateAppStatus("Registration Active", "Status Updated by EMSE Script", capId);
	updateExpStatus(capId, "Active", 365);
}
 