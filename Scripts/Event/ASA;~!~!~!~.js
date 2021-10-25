showDebug = true; 

if (!publicUser) {
        logDebug("**START** " + capId);
        createupdateRefLPFromRecordLP(capId);
        logDebug("**SECOND** " + capId);
		createRefContactsFromCapContactsAndLink(capId, null, null, null, true, comparePeopleMatchCriteria);
        logDebug("**THIRD** " + capId);
} 
