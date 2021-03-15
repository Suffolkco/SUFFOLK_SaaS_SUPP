function ammendARecord(capId, parentCapId)
{
//PUSh
   // copyAppSpecific(parentCapId);
	copyPeopleForLic(capId, parentCapId);
	copyLicenseProfessionalForLic(capId, parentCapId);
	copyOwnerForLic(capId, parentCapId);
   // /copyAppSpecificTableForLic(capId, parentCapId);
    copyAddressForLic(capId, parentCapId);
    copyParcelForLic(capId, parentCapId);
}
