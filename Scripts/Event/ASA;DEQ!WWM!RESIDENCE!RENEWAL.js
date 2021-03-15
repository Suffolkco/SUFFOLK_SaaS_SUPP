//ASA:DEQ/WWM/RESIDENCE/RENEWAL

logDebug("ASA Start");
var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
aa.cap.updateAccessByACA(capId, "N");
copyContacts(parentCapId, capId);
copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);
copyAddresses(parentCapId, capId);
copyOwner(parentCapId, capId);
copyParcels(parentCapId, capId);
copyParcelGisObjects();

var feeEx = getAppSpecific("Fee Exempt");
if (feeEx == "No" || feeEx == null)
{
     if (!feeExists("COM-UP"))
	{
	addFee("COM-UP", "DEQ_OSFR", "FINAL", 1, "Y");
	}
}