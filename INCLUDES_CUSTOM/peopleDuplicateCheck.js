// adding for test of STDBASE_BATCH_CONNECT_TO_PUBLIC_USER
function peopleDuplicateCheck(ipPeop){
	// This function uses the close match criteria stored in the
	// INDIVIDUAL_CONTACT_MATCH_CRITERIA and ORGANIZATION_CONTACT_MATCH_CRITERIA standard choices to check the reference
	// contact library for potential duplicates
	// takes a single peopleModel as a parameter, and will return an array of people models (peopResult)
	// returns null if there are no matches

	var fvContType = ipPeop.getContactType();

	var fvCriteriaStdChoice = "INDIVIDUAL_CONTACT_MATCH_CRITERIA";
	// default to individual unless flag is Org
	if (fvContType == "Organization")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}
	if (lookup("REF_CONTACT_CREATION_RULES",fvContType) == "O")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}

	//Add agency specific logic here if needed
	var fvBizDomainSR = aa.bizDomain.getBizDomain(fvCriteriaStdChoice);
	if (!fvBizDomainSR || !fvBizDomainSR.getSuccess())
	{
		logDebug("Standard Choice '" + fvCriteriaStdChoice + "' not defined.");
		return null;
	}
	var fvBizDomain = fvBizDomainSR.getOutput();
	if (!fvBizDomain || fvBizDomain.size() == 0)
	{
			logDebug("No criteria defined in Standard Choice '" + fvCriteriaStdChoice + "'.");
			return null;
	}

	for(var fvCounter1 = 0; fvCounter1 < fvBizDomain.size(); fvCounter1++)
	{
		var fvCloseMatchCriteriaObj = fvBizDomain.get(fvCounter1);
		var fvCriteriaStr = fvCloseMatchCriteriaObj.getDispBizdomainValue();
		if (!fvCriteriaStr || fvCriteriaStr == "")
			continue;

		var fvPeop = aa.people.createPeopleModel().getOutput().getPeopleModel();

		var fvCriteriaArr = fvCriteriaStr.split(";");

		var fvSkipThisCriteria = false;
		for (var fvCounter2 in fvCriteriaArr)
		{
		   var fvCriteriaFld = fvCriteriaArr[fvCounter2];
		   if (ipPeop[fvCriteriaFld] == null)
		   {
			   fvSkipThisCriteria = true;
			   logDebug("Value for " + fvCriteriaFld + " is null.");
			   break;
		   }
		   fvPeop[fvCriteriaFld] = ipPeop[fvCriteriaFld];
		   logDebug("Search for " + fvCriteriaFld + " " + fvPeop[fvCriteriaFld]);
		}

		if (fvSkipThisCriteria)
		{
			logDebug("WARNING: One or more Values for the Fields defined in this Criteria are null. Skipping this criteria.");
			continue;
		}

		var fvResult = aa.people.getPeopleByPeopleModel(fvPeop);
		if ( !fvResult.getSuccess())
		{
			logDebug("WARNING: Error searching for duplicate contacts : " + fvResult.getErrorMessage());
			continue;
		}

		var fvPeopResult = fvResult.getOutput();
		if (fvPeopResult.length == 0)
		{
			logDebug("Searched for REF contact, no matches found.");
			continue;
		}

		if (fvPeopResult.length > 0)
		{
			logDebug("Searched for a REF Contact, " + fvPeopResult.length + " matches found! returning the first match : " + fvPeopResult[0].getContactSeqNumber());
			return fvPeopResult[0].getContactSeqNumber();
		}
	}
	logDebug("No matches found. Returning Null.");
	return null;
}