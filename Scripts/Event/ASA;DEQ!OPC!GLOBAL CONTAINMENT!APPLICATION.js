//ASA:DEQ/OPC/GLOBAL CONTAINMENT/APPLICATION

var showDebug = false;

var feeEx = AInfo["Fee Exempt"];
var scopeWork = AInfo["Scope of Work"];
 
var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";   
    varcapAddresses = null;  
    var shortNotes = getShortNotes(capId);

 // Send email to all contacts 
 if (!publicUser)
 {
  var s_result = aa.address.getAddressByCapId(capId);
  if(s_result.getSuccess())
  {
    capAddresses = s_result.getOutput();
  }
  logDebug("Getting emails.");

  if(matches(fromEmail, null, "", undefined))
  {
    fromEmail = "";
  }
  for (con in conArray)
  {
    if (!matches(conArray[con].email, null, undefined, ""))
    {
      logDebug("Contact email: " + conArray[con].email);
      conEmail += conArray[con].email + "; ";
    }
  }
  var lpResult = aa.licenseScript.getLicenseProf(capId);
  if (lpResult.getSuccess())
  { 
    var lpArr = lpResult.getOutput();  
  } 
  else 
  { 
    logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
  }
  for (var lp in lpArr)
  {
    if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
    {
      logDebug("LP email: " + lpArr[lp].email);
      conEmail += lpArr[lp].getEmail() + "; ";
    }
  }
  getRecordParams4Notification(emailParams);
      
  addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
  addParameter(emailParams, "$$shortNotes$$", shortNotes);  
  addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
  if (capAddresses != null)
  {
    logDebug("Record address:" +capAddresses[0]);
      addParameter(emailParams, "$$address$$", capAddresses[0]);
  }

  if (conEmail != null)
  {
        logDebug ("test");
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, reportFile);
  }
}

// Avoid duplicate fees if users go back in ACA step
voidRemoveFees("HM-CON-GC");
voidRemoveFees("HM-CON-COV");

if (feeEx == "No" || feeEx == null)
{
    if (scopeWork != null)
    {
        if (scopeWork == "New Construction")
        {
			if (!feeExists("HM-CON-GC"))
			{
				updateFee("HM-CON-GC", "DEQ_GCAPP", "FINAL", 1, "Y");
			}
			if (!feeExists("HM-REG-GC"))
			{
				updateFee("HM-REG-GC", "DEQ_GCAPP", "FINAL", 1, "Y");
			}
        }
        else if (scopeWork == "Conversion")
        {
			if (!feeExists("HM-CON-COV"))
			{
				updateFee("HM-CON-COV", "DEQ_GCAPP", "FINAL", 1, "Y");
			}
			if (!feeExists("HM-REG-GC"))
			{
				updateFee("HM-REG-GC", "DEQ_GCAPP", "FINAL", 1, "Y");
			}
        }
    }
}

var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
if(capmodel.isCompleteCap() && capmodel.getCreatedByACA() == "N")
{
    var parentId = getParent();
    var newTankapp = createChildLocal("DEQ", "OPC", "Hazardous Tank", "Permit", "Tank", parentId);

    if (newTankapp != null)
    {
        var newTankSCDHS = getAppSpecific("SCDHS Tank #", capId);
        logDebug("SCDHS Tank # is " + newTankSCDHS);
        var newTankVol = getAppSpecific("Global Containment Volume", capId);
        newTankVol = parseInt(newTankVol);
        copyAddress(capId, newTankapp);
        logDebug("Global Containment Volume is " + newTankVol);
        copyParcel(capId, newTankapp);
        copyPeople(capId, newTankapp);
        copyOwner(capId, newTankapp);
        editAppSpecific("Tank ID From Plan", newTankSCDHS, newTankapp);
        editAppSpecific("Capacity", newTankVol, newTankapp);
        editAppSpecific("Generic Manufacturer", "NA", newTankapp);
        editAppSpecific("Generic Model #", "NA", newTankapp);     
        editAppSpecific("Generic Tank Info", "Non Generic|NA|NA", newTankapp);       

      }

}
else if (publicUser)
{
	var childArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);
	if (childArray == null || (parseInt(childArray.length) != 1))
	{
		var parentId = getParent();
		var cTypeArray = new Array("DEQ", "OPC", "Hazardous Tank", "Permit");
		var childTank =	createChildTempRecordOPC(cTypeArray, parentId);
		var newTankSCDHS = getAppSpecific("SCDHS Tank #", capId);
		var newTankVol = getAppSpecific("Global Containment Volume", capId);
		newTankVol = parseInt(newTankVol);
    
		copyAddress(capId, childTank);
		copyParcel(capId, childTank);
		copyPeople(capId, childTank);
		copyOwner(capId, childTank);

		editAppSpecific("Tank ID From Plan", newTankSCDHS, childTank);
		editAppSpecific("Capacity", newTankVol, childTank);
		editAppSpecific("Generic Manufacturer", "NA", childTank);
    editAppSpecific("Generic Model #", "NA", childTank);
    editAppSpecific("Generic Tank Info", "Non Generic|NA|NA", childTank);          
	}
}

function createChildLocal(grp,typ,stype,cat,desc) // optional parent capId
{
	//
	// creates the new application and returns the capID object
	//

	var itemCap = capId
	if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args
	
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(itemCap, newId); 
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(itemCap,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
				}
			}

		// DO NOT COPY CONTACTS

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(itemCap);
		if (capAddressResult.getSuccess())
			{
			Address = capAddressResult.getOutput();
			for (yy in Address)
				{
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
				}
			}
		
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}
function createChildTempRecordOPC(cTypeArray, parentCapId) // optional parentCap
{
	var childId = null;
	var groupsIgnoreArray;

	

		try{	
			ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
			ctm.setGroup(cTypeArray[0]);
			ctm.setType(cTypeArray[1]);
			ctm.setSubType(cTypeArray[2]);
			ctm.setCategory(cTypeArray[3]);
			childId = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE TMP").getOutput();
			aa.cap.createAssociatedFormsHierarchy(capId, childId);
		
		}
		catch (err) {
			logDebug("createChildTempRecordOPC Error occured: " + err.message);
		}		
	
	return childId;
}
function copyPeople(srcCapId, targetCapId)
{
  //1. Get people with source CAPID.
  var capPeoples = getPeople(srcCapId);
  aa.print("Source Cap ID:" + srcCapId);

  if (capPeoples == null || capPeoples.length == 0)
  {
    aa.print("Didn't get the source peoples!");
    return;
  }
  //2. Get people with target CAPID.
  var targetPeople = getPeople(targetCapId);
  //3. Check to see which people is matched in both source and target.
  for (loopk in capPeoples)
  {
    sourcePeopleModel = capPeoples[loopk];
    //3.1 Set target CAPID to source people.
    sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
    
    targetPeopleModel = null;
    //3.2 Check to see if sourcePeople exist.
    if (targetPeople != null && targetPeople.length > 0)
    {
      for (loop2 in targetPeople)
      {
        if (isMatchPeople(sourcePeopleModel, targetPeople[loop2]))
        {
          targetPeopleModel = targetPeople[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched people model.
    if (targetPeopleModel != null)
    {
      //3.3.1 Copy information from source to target.
      aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), 

      targetPeopleModel.getCapContactModel());
      //3.3.2 Edit People with source People information. 
      aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
    }
    //3.4 It is new People model.
    else
    {
      //3.4.1 Create new people.
      aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
    }
  }
}
function copyOwner(srcCapId, targetCapId)
{
  //1. Get Owners with source CAPID.
  var capOwners = getOwner(srcCapId);
  if (capOwners == null || capOwners.length == 0)
  {
    return;
  }
  //2. Get Owners with target CAPID.
  var targetOwners = getOwner(targetCapId);
  //3. Check to see which owner is matched in both source and target.
  for (loopk in capOwners)
  {
    sourceOwnerModel = capOwners[loopk];
    //3.1 Set target CAPID to source Owner.
    sourceOwnerModel.setCapID(targetCapId);
    targetOwnerModel = null;
    //3.2 Check to see if sourceOwner exist.
    if (targetOwners != null && targetOwners.length > 0)
    {
      for (loop2 in targetOwners)
      {
        if (isMatchOwner(sourceOwnerModel, targetOwners[loop2]))
        {
          targetOwnerModel = targetOwners[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched owner model.
    if (targetOwnerModel != null)
    {
      //3.3.1 Copy information from source to target.
      aa.owner.copyCapOwnerModel(sourceOwnerModel, targetOwnerModel);
      //3.3.2 Edit owner with source owner information. 
      aa.owner.updateDailyOwnerWithAPOAttribute(targetOwnerModel);
    }
    //3.4 It is new owner model.
    else
    {
      //3.4.1 Create new Owner.
      aa.owner.createCapOwnerWithAPOAttribute(sourceOwnerModel);
    }
  }
}
function copyAddress(srcCapId, targetCapId)
{
    //1. Get address with source CAPID.
    var capAddresses = getAddress(srcCapId);
    if (capAddresses == null || capAddresses.length == 0)
    {
      return;
    }
    //2. Get addresses with target CAPID.
    var targetAddresses = getAddress(targetCapId);
    //3. Check to see which address is matched in both source and target.
    for (loopk in capAddresses)
    {
      sourceAddressfModel = capAddresses[loopk];
      //3.1 Set target CAPID to source address.
      sourceAddressfModel.setCapID(targetCapId);
      targetAddressfModel = null;
      //3.2 Check to see if sourceAddress exist.
      if (targetAddresses != null && targetAddresses.length > 0)
      {
        for (loop2 in targetAddresses)
        {
          if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2]))
          {
            targetAddressfModel = targetAddresses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched address model.
      if (targetAddressfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
        //3.3.2 Edit address with source address information. 
        aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
      }
      //3.4 It is new address model.
      else
      { 
        //3.4.1 Create new address.
        aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
      }
    }
}
function copyParcel(srcCapId, targetCapId)
{
  //1. Get parcels with source CAPID.
  var copyParcels = getParcel(srcCapId);
  if (copyParcels == null || copyParcels.length == 0)
  {
    return;
  }
  //2. Get parcel with target CAPID.
  var targetParcels = getParcel(targetCapId);
  //3. Check to see which parcel is matched in both source and target.
  for (i = 0; i < copyParcels.size(); i++)
  {
    sourceParcelModel = copyParcels.get(i);
    //3.1 Set target CAPID to source parcel.
    sourceParcelModel.setCapID(targetCapId);
    targetParcelModel = null;
    //3.2 Check to see if sourceParcel exist.
    if (targetParcels != null && targetParcels.size() > 0)
    {
      for (j = 0; j < targetParcels.size(); j++)
      {
        if (isMatchParcel(sourceParcelModel, targetParcels.get(j)))
        {
          targetParcelModel = targetParcels.get(j);
          break;
        }
      }
    }
    //3.3 It is a matched parcel model.
    if (targetParcelModel != null)
    {
      //3.3.1 Copy information from source to target.
      var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, 

      sourceParcelModel).getOutput();
      var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, 

      targetParcelModel).getOutput();
      aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
      //3.3.2 Edit parcel with sourceparcel. 
      aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
    }
    //3.4 It is new parcel model.
    else
    {
      //3.4.1 Create new parcel.
      aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel

      (targetCapId, sourceParcelModel).getOutput());
    }
  }
}
function getOwner(capId)
{
  capOwnerArr = null;
  var s_result = aa.owner.getOwnerByCapId(capId);
  if(s_result.getSuccess())
  {
    capOwnerArr = s_result.getOutput();
    if (capOwnerArr == null || capOwnerArr.length == 0)
    {
      aa.print("WARNING: no Owner on this CAP:" + capId);
      capOwnerArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to Owner: " + s_result.getErrorMessage());
    capOwnerArr = null; 
  }
  return capOwnerArr;
}

function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	// MODIFY THIS It's in PROD!!!
	acaUrl = "https://aca.suffolkcountyny.gov/CitizenAccess/Cap/CapDetail.aspx?"
	var itemCapModel = aa.cap.getCap(capId).getOutput().getCapModel();
	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + itemCapModel.getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")){
			 acaRecordUrl += "&FromACA=Y";
			logDebug("ACA record Url is:" + acaRecordUrl); 
			return acaRecordUrl;
		}
} 