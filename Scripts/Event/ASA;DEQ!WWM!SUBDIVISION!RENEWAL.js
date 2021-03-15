//ASA:DEQ/WWM/SUBDIVISION/RENEWAL
 
var showDebug = false;

logDebug("We are in ASA:DEQ/WWM/SUBDIVISION/RENEWAL");
var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
aa.cap.updateAccessByACA(capId, "N");
copyContacts(parentCapId, capId);
copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);
copyAddresses(parentCapId, capId);
copyOwner(parentCapId, capId);
copyParcels(parentCapId, capId);
copyParcelGisObjects();
