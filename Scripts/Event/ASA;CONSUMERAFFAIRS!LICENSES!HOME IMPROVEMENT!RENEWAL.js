// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

//aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
//aa.runScript("APPLICATIONSUBMITAFTER4RENEW");


var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);

aa.cap.updateAccessByACA(capId, "N");
copyContacts(parentCapId, capId);
//copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);
copyAddresses(parentCapId, capId);
copyOwner(parentCapId, capId);
copyLicensedProf(parentCapId, capId);
copyParcels(parentCapId, capId);
copyParcelGisObjects();