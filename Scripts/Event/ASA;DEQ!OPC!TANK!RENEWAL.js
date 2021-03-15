var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
var parentID = getParentCapID4Renewal();
logDebug("Parent Id is: " + parentID);
logDebug("capId is: " + capId);

aa.cap.updateAccessByACA(capId, "N");
copyContacts(parentCapId, capId);
//copyASIFields(parentCapId, capId);
//copyASITables(parentCapId, capId);
copyAddresses(parentCapId, capId);
copyOwner(parentCapId, capId);
copyParcels(parentCapId, capId);
copyParcelGisObjects();