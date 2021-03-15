//ASA:DEQ/ECOLOGY/IA/RENEWAL

var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
var manuf = getAppSpecific("Manufacturer", parentCapId);
var model = getAppSpecific("Model Number", parentCapId);
var install = getAppSpecific("Installation Date", parentCapId);
var type = getAppSpecific("Type", parentCapId);
var use = getAppSpecific("Use", parentCapId);

aa.cap.updateAccessByACA(capId, "N");
copyContacts(parentCapId, capId);
//copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);
copyAddresses(parentCapId, capId);
copyOwner(parentCapId, capId);
copyLicensedProf(parentCapId, capId);
copyParcels(parentCapId, capId);
copyParcelGisObjects();

editAppSpecific("Manufacturer", manuf, capId);
editAppSpecific("Model Number", model, capId);
editAppSpecific("Installation Date", install, capId);
//editAppSpecific("Type", type, capId);
//editAppSpecific("Use", use, capId);
 