//CTRCA:DEQ/OPC/HAZARDOUS TANK/APPLICATION

var emailParams = aa.util.newHashtable();
var reportFile = null;
var altID = capId.getCustomID();
var conArray;
try
{
  conArray = getContactArray();
}
catch (ex)
{
  logDebug("**ERROR** runtime error " + ex.message);
}
var conEmail = "";
var emailAddress = "";
var childNoteArray = new Array();
var parentId = getParent();

var shortNotes = getShortNotes(capId);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
addParameter(emailParams, "$$shortNotes$$", shortNotes); 
addParameter(emailParams, "$$ALTID$$", altID);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
 capAddresses = s_result.getOutput();
}
if (capAddresses != null)
{
    addParameter(emailParams, "$$address$$", capAddresses[0]);
}

if (conArray != null)
{
  for (con in conArray)
  {
      if (!matches(conArray[con].email, null, undefined, ""))
      {
          conEmail += conArray[con].email + "; ";
      }
  }
  if (conEmail != null)
  {
      //sending Notification
      sendNotification("noreplyehims@suffolkcountyny.gov", conEmail, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, null);
  }
}

var lpResult = aa.licenseScript.getLicenseProf(capId);
if (lpResult.getSuccess())
{ 
    var lpArr = lpResult.getOutput();  
} 

if(lpArr != null)
{
    for (var lp in lpArr)
    {
        if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
        {
        emailAddress = lpArr[lp].getEmail();
        sendNotification("noreplyehims@suffolkcountyny.gov", emailAddress, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, null);
        }
    }      
}	


// This section is specially handled if the record has been created in ACA and backoffice clerk
// is completing the application for them due to payment other than credit card.
// It will still come through this CTRCA script
logDebug("Is publicUser? " + publicUser);
if (!publicUser)
{
	// Find if there is a any temp tank permit child under Tank Installation/Registration record created in ACA
	var tankArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);

	logDebug("tankArray: " + tankArray);
	logDebug("tankArray length: " + tankArray.length);
	if (tankArray != null)
	{
		for (t in tankArray)
		{
			var tankCapId = tankArray[t];
			var altID = tankCapId.getCustomID();
			logDebug("tank permit temp altID: " + altID);
			var tempCapID = tankArray[t];
			logDebug("tank permit temp capID: " + tempCapID);
			
			logDebug("Creating child for parent ID is: " + parentId);

			var childTank = createChild("DEQ", "OPC", "Hazardous Tank", "Permit", "Tank Installation", parentId);
			//logDebug("Child alt ID is: " + childTank.getCustomID());
			var capResult = aa.cap.getCap(childTank);

			var childCap = capResult.getOutput().getCapModel();				
			logDebug("New Child Tank Permit Alt Custom ID is: " + childTank.getCustomID());

			var childTankCapId = childCap.getCapID();					
			logDebug("New Child Tank Permit Cap ID is: " + childTankCapId);

			copyASIFields(tempCapID, childTankCapId);
			copyLicenseProfessional(tempCapID, childTankCapId);
			copyAddress(tempCapID, childTankCapId);
			copyParcel(tempCapID, childTankCapId);			
			copyPeople(tempCapID, childTankCapId);			
			copyOwner(tempCapID, childTankCapId);			
		}
	}

	// After we have created all the tank permit successfully, we can remove all the temp ones created in ACA
	if (tankArray != null)
	{
		for (t in tankArray)
		{			
			var tankCapId = tankArray[t];
			logDebug("tankCapId: " + tankCapId);
			/*
			var altID = tankCapId.getCustomID();
			logDebug("tank permit temp altID: " + altID);
			
			tempCap = tankArray[t];
			partialCapId = getPartialCapID(tempCap)
			logDebug("partialCapId: " + partialCapId);
				*/

			var capmodel = aa.cap.getCap(tankCapId).getOutput().getCapModel();
			logDebug("isCompleteCap? " + capmodel.isCompleteCap());	
			if(!capmodel.isCompleteCap())								
			{  			
				var deleteScriptResult = aa.cap.deletePartialCAP(tankCapId);

				if (deleteScriptResult.getSuccess()) {
					logDebug("Delete partial CAP successfully. " + tankCapId);
				}
				else
				{
					logDebug("Not sucessfully");
				}
			}
		}
  }

  var dummyTankArray = getChildren("DEQ/OPC/Hazardous Tank/ExistingTankVerification", capId);
  // Check to see if there is any temp dummy tank, we should remove the temp created in ACA
	if (dummyTankArray != null)
	{
		for (d in dummyTankArray)
		{			
			var dummyCapId = dummyTankArray[d];
			logDebug("dummyCapId: " + dummyCapId);		
			var capmodel = aa.cap.getCap(dummyCapId).getOutput().getCapModel();
      logDebug("isCompleteCap? " + capmodel.isCompleteCap());	
      if(!capmodel.isCompleteCap())								
			{  	
				var deleteDummyResult = aa.cap.deletePartialCAP(dummyCapId);

				if (deleteDummyResult.getSuccess()) {
					logDebug("Delete partial CAP successfully. " + dummyCapId);
				}
				else
				{
					logDebug("Not sucessfully");
				}
			}
    }
  }
}



function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	// MODIFY THIS It's in PROD!!!
	acaUrl = "https://acastaging.suffolkcountyny.gov/CitizenAccess/Cap/CapDetail.aspx?"
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

function getPartialCapID(capid)
{

    if (capid == null || aa.util.instanceOfString(capid))

    {

        return null;

    }

    //1. Get original partial CAPID  from related CAP table.

    var result = aa.cap.getProjectByChildCapID(capid, "EST", null);

    if(result.getSuccess())

    {

        projectScriptModels = result.getOutput();

        if (projectScriptModels == null || projectScriptModels.length == 0)

        {

            aa.print("ERROR: Failed to get partial CAP with CAPID(" + capid + ")");

            return null;

        }

        //2. Get original partial CAP ID from project Model

        projectScriptModel = projectScriptModels[0];

        return projectScriptModel.getProjectID();

    }  

    else 

    {

        aa.print("ERROR: Failed to get partial CAP by child CAP(" + capid + "): " + result.getErrorMessage());

        return null;

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

function createChild(grp,typ,stype,cat,desc) // optional parent capId
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

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

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


function editAppSpecific4ACA(itemName, itemValue, cap) {



    var i = cap.getAppSpecificInfoGroups().iterator();



    while (i.hasNext()) {

        var group = i.next();

        var fields = group.getFields();

        if (fields != null) {

            var iteFields = fields.iterator();

            while (iteFields.hasNext()) {

                var field = iteFields.next();

                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + 



field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {

                    field.setChecklistComment(itemValue);

                }

            }

        }

    }

}
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 

function copyLicenseProfessional(srcCapId, targetCapId)
{
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
      return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
      sourcelicProfModel = capLicenses[loopk];
      //3.1 Set target CAPID to source lic prof.
      sourcelicProfModel.setCapID(targetCapId);
      targetLicProfModel = null;
      //3.2 Check to see if sourceLicProf exist.
      if (targetLicenses != null && targetLicenses.length > 0)
      {
        for (loop2 in targetLicenses)
        {
          if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
          {
            targetLicProfModel = targetLicenses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched licProf model.
      if (targetLicProfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
        //3.3.2 Edit licProf with source licProf information. 
        aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
      }
      //3.4 It is new licProf model.
      else
      {
        //3.4.1 Create new license professional.
        aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
      }
    }
}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2)
{
    if (licProfScriptModel1 == null || licProfScriptModel2 == null)
    {
      return false;
    }
    if (licProfScriptModel1.getLicenseType().equals(licProfScriptModel2.getLicenseType())
      && licProfScriptModel1.getLicenseNbr().equals(licProfScriptModel2.getLicenseNbr()))
    {
      return true;
    }
    return  false;
}

function getLicenseProfessional(capId)
{
    capLicenseArr = null;
    var s_result = aa.licenseProfessional.getLicenseProf(capId);
    if(s_result.getSuccess())
    {
      capLicenseArr = s_result.getOutput();
      if (capLicenseArr == null || capLicenseArr.length == 0)
      {
        logDebug("WARNING: no licensed professionals on this CAP:" + capId);
        capLicenseArr = null;
      }
    }
    else
    {
      logDebug("ERROR: Failed to license professional: " + s_result.getErrorMessage());
      capLicenseArr = null; 
    }
    return capLicenseArr;
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

function isMatchAddress(addressScriptModel1, addressScriptModel2)
{
  if (addressScriptModel1 == null || addressScriptModel2 == null)
  {
    return false;
  }
  var streetName1 = addressScriptModel1.getStreetName();
  var streetName2 = addressScriptModel2.getStreetName();
  if ((streetName1 == null && streetName2 != null) 
    || (streetName1 != null && streetName2 == null))
  {
    return false;
  }
  if (streetName1 != null && !streetName1.equals(streetName2))
  {
    return false;
  }
  return true;
}

function getAddress(capId)
{
  capAddresses = null;
  var s_result = aa.address.getAddressByCapId(capId);
  if(s_result.getSuccess())
  {
    capAddresses = s_result.getOutput();
    if (capAddresses == null || capAddresses.length == 0)
    {
      logDebug("WARNING: no addresses on this CAP:" + capId);
      capAddresses = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to address: " + s_result.getErrorMessage());
    capAddresses = null;  
  }
  return capAddresses;
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

function isMatchParcel(parcelScriptModel1, parcelScriptModel2)
{
  if (parcelScriptModel1 == null || parcelScriptModel2 == null)
  {
    return false;
  }
  if (parcelScriptModel1.getParcelNumber().equals(parcelScriptModel2.getParcelNumber()))
  {
    return true;
  }
  return  false;
}

function getParcel(capId)
{
  capParcelArr = null;
  var s_result = aa.parcel.getParcelandAttribute(capId, null);
  if(s_result.getSuccess())
  {
    capParcelArr = s_result.getOutput();
    if (capParcelArr == null || capParcelArr.length == 0)
    {
      logDebug("WARNING: no parcel on this CAP:" + capId);
      capParcelArr = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to parcel: " + s_result.getErrorMessage());
    capParcelArr = null;  
  }
  return capParcelArr;
}

function copyPeople(srcCapId, targetCapId)
{
  //1. Get people with source CAPID.
  var capPeoples = getPeople(srcCapId);
  logDebug("Source Cap ID:" + srcCapId);

  if (capPeoples == null || capPeoples.length == 0)
  {
    logDebug("Didn't get the source peoples!");
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

function isMatchPeople(capContactScriptModel, capContactScriptModel2)
{
  if (capContactScriptModel == null || capContactScriptModel2 == null)
  {
    return false;
  }
  var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
  var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
  var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
  var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
  var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
  var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
  var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
  var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
  if ((contactType1 == null && contactType2 != null) 
    || (contactType1 != null && contactType2 == null))
  {
    return false;
  }
  if (contactType1 != null && !contactType1.equals(contactType2))
  {
    return false;
  }
  if ((firstName1 == null && firstName2 != null) 
    || (firstName1 != null && firstName2 == null))
  {
    return false;
  }
  if (firstName1 != null && !firstName1.equals(firstName2))
  {
    return false;
  }
  if ((lastName1 == null && lastName2 != null) 
    || (lastName1 != null && lastName2 == null))
  {
    return false;
  }
  if (lastName1 != null && !lastName1.equals(lastName2))
  {
    return false;
  }
  if ((fullName1 == null && fullName2 != null) 
    || (fullName1 != null && fullName2 == null))
  {
    return false;
  }
  if (fullName1 != null && !fullName1.equals(fullName2))
  {
    return false;
  }
  return  true;
}

function getPeople(capId)
{
  capPeopleArr = null;
  var s_result = aa.people.getCapContactByCapID(capId);
  if(s_result.getSuccess())
  {
    capPeopleArr = s_result.getOutput();
    if (capPeopleArr == null || capPeopleArr.length == 0)
    {
      logDebug("WARNING: no People on this CAP:" + capId);
      capPeopleArr = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
    capPeopleArr = null;  
  }
  return capPeopleArr;
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

function isMatchOwner(ownerScriptModel1, ownerScriptModel2)
{
  if (ownerScriptModel1 == null || ownerScriptModel2 == null)
  {
    return false;
  }
  var fullName1 = ownerScriptModel1.getOwnerFullName();
  var fullName2 = ownerScriptModel2.getOwnerFullName();
  if ((fullName1 == null && fullName2 != null) 
    || (fullName1 != null && fullName2 == null))
  {
    return false;
  }
  if (fullName1 != null && !fullName1.equals(fullName2))
  {
    return false;
  }
  return  true;
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
      logDebug("WARNING: no Owner on this CAP:" + capId);
      capOwnerArr = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to Owner: " + s_result.getErrorMessage());
    capOwnerArr = null; 
  }
  return capOwnerArr;
}

function copyCapCondition(srcCapId, targetCapId)
{
  //1. Get Cap condition with source CAPID.
  var capConditions = getCapConditionByCapID(srcCapId);
  if (capConditions == null || capConditions.length == 0)
  {
    return;
  }
  //2. Get Cap condition with target CAPID.
  var targetCapConditions = getCapConditionByCapID(targetCapId);
  //3. Check to see which Cap condition is matched in both source and target.
  for (loopk in capConditions)
  {
    sourceCapCondition = capConditions[loopk];
    //3.1 Set target CAPID to source Cap condition.
    sourceCapCondition.setCapID(targetCapId);
    targetCapCondition = null;
    //3.2 Check to see if source Cap condition exist in target CAP. 
    if (targetCapConditions != null && targetCapConditions.length > 0)
    {
      for (loop2 in targetCapConditions)
      {
        if (isMatchCapCondition(sourcelicProfModel, targetCapConditions[loop2]))
        {
          targetCapCondition = targetCapConditions[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched Cap condition model.
    if (targetCapCondition != null)
    {
      //3.3.1 Copy information from source to target.
      sourceCapCondition.setConditionNumber(targetCapCondition.getConditionNumber());
      //3.3.2 Edit Cap condition with source Cap condition information. 
      aa.capCondition.editCapCondition(sourceCapCondition);
    }
    //3.4 It is new Cap condition model.
    else
    {
      //3.4.1 Create new Cap condition.
      aa.capCondition.createCapCondition(sourceCapCondition);
    }
  }
}

function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2)
{
  if (capConditionScriptModel1 == null || capConditionScriptModel2 == null)
  {
    return false;
  }
  var description1 = capConditionScriptModel1.getConditionDescription();
  var description2 = capConditionScriptModel2.getStreetName();
  if ((description1 == null && description2 != null) 
    || (description1 != null && description2 == null))
  {
    return false;
  }
  if (description1 != null && !description1.equals(description2))
  {
    return false;
  }
  var conGroup1 = capConditionScriptModel1.getConditionGroup();
  var conGroup2 = capConditionScriptModel2.getConditionGroup();
  if ((conGroup1 == null && conGroup2 != null) 
    || (conGroup1 != null && conGroup2 == null))
  {
    return false;
  }
  if (conGroup1 != null && !conGroup1.equals(conGroup2))
  {
    return false;
  }
  return true;
}

function getCapConditionByCapID(capId)
{
  capConditionScriptModels = null;
  
  var s_result = aa.capCondition.getCapConditions(capId);
  if(s_result.getSuccess())
  {
    capConditionScriptModels = s_result.getOutput();
    if (capConditionScriptModels == null || capConditionScriptModels.length == 0)
    {
      logDebug("WARNING: no cap condition on this CAP:" + capId);
      capConditionScriptModels = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to get cap condition: " + s_result.getErrorMessage());
    capConditionScriptModels = null;  
  }
  return capConditionScriptModels;
}

function copyAdditionalInfo(srcCapId, targetCapId)
{
  //1. Get Additional Information with source CAPID.  (BValuatnScriptModel)
  var  additionalInfo = getAdditionalInfo(srcCapId);
  if (additionalInfo == null)
  {
    return;
  }
  //2. Get CAP detail with source CAPID.
  var  capDetail = getCapDetailByID(srcCapId);
  //3. Set target CAP ID to additional info.
  additionalInfo.setCapID(targetCapId);
  if (capDetail != null)
  {
    capDetail.setCapID(targetCapId);
  }
  //4. Edit or create additional infor for target CAP.
  aa.cap.editAddtInfo(capDetail, additionalInfo);
}

//Return BValuatnScriptModel for additional info.
function getAdditionalInfo(capId)
{
  bvaluatnScriptModel = null;
  var s_result = aa.cap.getBValuatn4AddtInfo(capId);
  if(s_result.getSuccess())
  {
    bvaluatnScriptModel = s_result.getOutput();
    if (bvaluatnScriptModel == null)
    {
      logDebug("WARNING: no additional info on this CAP:" + capId);
      bvaluatnScriptModel = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
    bvaluatnScriptModel = null; 
  }
  // Return bvaluatnScriptModel
  return bvaluatnScriptModel;
}

function getCapDetailByID(capId)
{
  capDetailScriptModel = null;
  var s_result = aa.cap.getCapDetail(capId);
  if(s_result.getSuccess())
  {
    capDetailScriptModel = s_result.getOutput();
    if (capDetailScriptModel == null)
    {
      logDebug("WARNING: no cap detail on this CAP:" + capId);
      capDetailScriptModel = null;
    }
  }
  else
  {
    logDebug("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
    capDetailScriptModel = null;  
  }
  // Return capDetailScriptModel
  return capDetailScriptModel;
}
function getChildren(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch)
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

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
  
  function copyASIFields(sourceCapId,targetCapId)
{
	var ignoreArray = new Array();
	for (var i = 2; i < arguments.length; i++)
	{
		ignoreArray.push(arguments[i]);
	}
	var targetCap = aa.cap.getCap(targetCapId).getOutput();
	var targetCapType = targetCap.getCapType();
	var targetCapTypeString = targetCapType.toString();
	var targetCapTypeArray = targetCapTypeString.split("/");
	var sourceASIResult = aa.appSpecificInfo.getByCapID(sourceCapId);
	if (sourceASIResult.getSuccess())
	{ 
		var sourceASI = sourceASIResult.getOutput(); 
	}
	else
	{ 
		aa.print( "**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
		return false;
	}
	for (ASICount in sourceASI)
	{
		thisASI = sourceASI[ASICount];
		if (!exists(thisASI.getCheckboxType(),ignoreArray))
		{
			thisASI.setPermitID1(targetCapId.getID1());
			thisASI.setPermitID2(targetCapId.getID2());
			thisASI.setPermitID3(targetCapId.getID3());
			thisASI.setPerType(targetCapTypeArray[1]);
			thisASI.setPerSubType(targetCapTypeArray[2]);
			aa.cap.createCheckbox(thisASI);
		}
	}
}
