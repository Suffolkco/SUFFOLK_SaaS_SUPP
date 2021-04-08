function addACAUrlsVarToEmail(vEParams) {
	//Get base ACA site from standard choices
	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

	//Save Base ACA URL
	addParameter(vEParams,"$$acaURL$$",acaSite);

	//Save Record Direct URL
	addParameter(vEParams,"$$acaRecordURL$$",acaSite + getACAUrl());
	var paymentUrl = vEParams.get("$$acaRecordURL$$");
	paymentUrl = paymentUrl.replace("type=1000", "type=1009");
	addParameter(vEParams, "$$acaPaymentUrl$$", paymentUrl);
}