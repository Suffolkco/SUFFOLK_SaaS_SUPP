/*------------------------------------------------------------------------------------------------------/
| Program : PF_DEQ_IA_TRAN_COPY_ASI
| Event   : ACA OnLoad Event
|
| Usage   : Developed by Jacob Greene. 02/24/2022
|
| Client  : Suffolk County
|//
|
| Notes   Reequires the IA Application Record Number & corresponding PIN.
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;                                                                                        // Set to true to see results in popup window
var showDebug = false;                                                                                             // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false;                                   // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;                                 // Use Group name when populating Task Specific Info Values
var cancel = false;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message =    "";       // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
   useSA = true;      
   SA = bzr.getOutput().getDescription();
   bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
   if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
   }
if (SA) {
   eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
   eval(getScriptText(SAScript,SA));
   }
else {
   eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
  }
               
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName){
   var servProvCode = aa.getServiceProviderCode();
   if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
   vScriptName = vScriptName.toUpperCase();          
   var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
   try {
	  var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
	  return emseScript.getScriptText() + "";      
	} catch(err) {
		return "";
   }
}

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()                          // Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();                                                 // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();           // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();                                     // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");                                        // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();

var AInfo = new Array();        // Create array for tokenized variables
//loadAppSpecific4ACA(AInfo);   // Add AppSpecific Info
//loadTaskSpecific(AInfo);      // Add task specific info
//loadParcelAttributes(AInfo);  // Add parcel attributes
//loadASITables4ACA();

loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
  var iaNumber = getApplication(AInfo["IA Record Number"]);
    var parentResult = aa.cap.getCapID(iaNumber);
    logDebug("parentResult = " + parentResult);
	if (parentResult.getSuccess()) {
		var parentCapId = parentCapId.getOutput();
        //var wwmApp = AInfo["WWM Application Number"];
        //var inspApp = AInfo["Inspection Number"];
    
        var parentCap =aa.cap.getCapViewBySingle4ACA(parentCapId);
        if (parentCap) {
            cap.setAppSpecificTableGroupModel(parentCap.getAppSpecificTableGroupModel());
        }

        //copyAppName(parentCapId,cap);
    
        //copyLicensedProf(parentCapId, capId);
    
        copyAddress(parentCapId, capId);
    
        copyParcel(parentCapId, capId);
    
        copyContactIA(parentCapId, capId);
    
        //copyOwner(parentCapId, capId);

        var Manufacturer = getAppSpecific("Manufacturer", parentCapId);
        var model = getAppSpecific("Model", parentCapId);
        var installDate = getAppSpecific("Installation Date", parentCapId);
        var type = getAppSpecific("Type", parentCapId);
    
        aa.env.setValue('CapModel', cap);
    
        editAppSpecific4ACA("Manufacturer", Manufacturer, cap);
        editAppSpecific4ACA("Model", model, cap);
        editAppSpecific4ACA("Installation Date", installDate, cap);
        editAppSpecific4ACA("Type", type, cap);
    }
}	
catch (err) { aa.print("**ERROR : " + err); }
               
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function copyLicensedProf(sCapId, tCapId)
{
	//Function will copy all licensed professionals from source CapID to target CapID

	var licProf = aa.licenseProfessional.getLicensedProfessionalsByCapID(sCapId).getOutput();
	if (licProf != null)
		for(x in licProf)
		{
			licProf[x].setCapID(tCapId);
			aa.licenseProfessional.createLicensedProfessional(licProf[x]);
			logDebug("Copied " + licProf[x].getLicenseNbr());
		}
	else
		logDebug("No licensed professional on source");
}
 
 
function copyPeople(srcCapId, targetCapId) {
  //1. Get people with source CAPID.
  var capPeoples = getPeople(srcCapId);
  aa.print("Source Cap ID:" + srcCapId.getCustomID());

  if (capPeoples == null || capPeoples.length == 0) {
    aa.print("Didn't get the source peoples!");
    return;
  }
  //2. Get people with target CAPID.
  var targetPeople = getPeople(targetCapId);
  //3. Check to see which people is matched in both source and target.
  for (loopk in capPeoples) {
    sourcePeopleModel = capPeoples[loopk];
    //3.1 Set target CAPID to source people.
    sourcePeopleModel.getCapContactModel().setCapID(targetCapId);

    targetPeopleModel = null;
    //3.2 Check to see if sourcePeople exist.
    if (targetPeople != null && targetPeople.length > 0) {
      for (loop2 in targetPeople) {
        if (isMatchPeople(sourcePeopleModel, targetPeople[loop2])) {
          targetPeopleModel = targetPeople[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched people model.
    if (targetPeopleModel != null) {
      //3.3.1 Copy information from source to target.
      aa.people.copyCapContactModel(
        sourcePeopleModel.getCapContactModel(),

        targetPeopleModel.getCapContactModel()
      );
      //3.3.2 Edit People with source People information.
      aa.people.editCapContactWithAttribute(
        targetPeopleModel.getCapContactModel()
      );
    }
    //3.4 It is new People model.
    else {
      //3.4.1 Create new people.
      aa.people.createCapContactWithAttribute(
        sourcePeopleModel.getCapContactModel()
      );
    }
  }
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2) {
  if (capContactScriptModel == null || capContactScriptModel2 == null) {
    return false;
  }
  var contactType1 = capContactScriptModel
    .getCapContactModel()
    .getPeople()
    .getContactType();
  var contactType2 = capContactScriptModel2
    .getCapContactModel()
    .getPeople()
    .getContactType();
  var firstName1 = capContactScriptModel
    .getCapContactModel()
    .getPeople()
    .getFirstName();
  var firstName2 = capContactScriptModel2
    .getCapContactModel()
    .getPeople()
    .getFirstName();
  var lastName1 = capContactScriptModel
    .getCapContactModel()
    .getPeople()
    .getLastName();
  var lastName2 = capContactScriptModel2
    .getCapContactModel()
    .getPeople()
    .getLastName();
  var fullName1 = capContactScriptModel
    .getCapContactModel()
    .getPeople()
    .getFullName();
  var fullName2 = capContactScriptModel2
    .getCapContactModel()
    .getPeople()
    .getFullName();
  if (
    (contactType1 == null && contactType2 != null) ||
    (contactType1 != null && contactType2 == null)
  ) {
    return false;
  }
  if (contactType1 != null && !contactType1.equals(contactType2)) {
    return false;
  }
  if (
    (firstName1 == null && firstName2 != null) ||
    (firstName1 != null && firstName2 == null)
  ) {
    return false;
  }
  if (firstName1 != null && !firstName1.equals(firstName2)) {
    return false;
  }
  if (
    (lastName1 == null && lastName2 != null) ||
    (lastName1 != null && lastName2 == null)
  ) {
    return false;
  }
  if (lastName1 != null && !lastName1.equals(lastName2)) {
    return false;
  }
  if (
    (fullName1 == null && fullName2 != null) ||
    (fullName1 != null && fullName2 == null)
  ) {
    return false;
  }
  if (fullName1 != null && !fullName1.equals(fullName2)) {
    return false;
  }
  return true;
}

function getPeople(inputtedCap) {
  capPeopleArr = null;
  var s_result = aa.people.getCapContactByCapID(inputtedCap);
  if (s_result.getSuccess()) {
    capPeopleArr = s_result.getOutput();
    if (capPeopleArr == null || capPeopleArr.length == 0) {
      aa.print("WARNING: no People on this CAP:" + inputtedCap.getCustomID());
      capPeopleArr = null;
    }
  } else {
    aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
    capPeopleArr = null;
  }
  return capPeopleArr;
}

function copyLicenseProfessional(srcCapId, targetCapId) {
  //1. Get license professionals with source CAPID.
  var capLicenses = getLicenseProfessional(srcCapId);
  if (capLicenses == null || capLicenses.length == 0) {
    return;
  }
  //2. Get license professionals with target CAPID.
  var targetLicenses = getLicenseProfessional(targetCapId);
  //3. Check to see which licProf is matched in both source and target.
  for (loopk in capLicenses) {
    sourcelicProfModel = capLicenses[loopk];
    //3.1 Set target CAPID to source lic prof.
    sourcelicProfModel.setCapID(targetCapId);
    targetLicProfModel = null;
    //3.2 Check to see if sourceLicProf exist.
    if (targetLicenses != null && targetLicenses.length > 0) {
      for (loop2 in targetLicenses) {
        if (
          isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2])
        ) {
          targetLicProfModel = targetLicenses[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched licProf model.
    if (targetLicProfModel != null) {
      //3.3.1 Copy information from source to target.
      aa.licenseProfessional.copyLicenseProfessionalScriptModel(
        sourcelicProfModel,
        targetLicProfModel
      );
      //3.3.2 Edit licProf with source licProf information.
      aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
    }
    //3.4 It is new licProf model.
    else {
      //3.4.1 Create new license professional.
      aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
    }
  }
}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2) {
  if (licProfScriptModel1 == null || licProfScriptModel2 == null) {
    return false;
  }
  if (
    licProfScriptModel1
      .getLicenseType()
      .equals(licProfScriptModel2.getLicenseType()) &&
    licProfScriptModel1
      .getLicenseNbr()
      .equals(licProfScriptModel2.getLicenseNbr())
  ) {
    return true;
  }
  return false;
}

function getLicenseProfessional(capId) {
  capLicenseArr = null;
  var s_result = aa.licenseProfessional.getLicenseProf(capId);
  if (s_result.getSuccess()) {
    capLicenseArr = s_result.getOutput();
    if (capLicenseArr == null || capLicenseArr.length == 0) {
      aa.print("WARNING: no licensed professionals on this CAP:" + capId);
      capLicenseArr = null;
    }
  } else {
    aa.print(
      "ERROR: Failed to license professional: " + s_result.getErrorMessage()
    );
    capLicenseArr = null;
  }
  return capLicenseArr;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) {
    var contactAddressModelArr = null;
  
    if (
      contactAddressScriptModelArr != null &&
      contactAddressScriptModelArr.length > 0
    ) {
      contactAddressModelArr = aa.util.newArrayList();
  
      for (loopk in contactAddressScriptModelArr) {
        contactAddressModelArr.add(
          contactAddressScriptModelArr[loopk].getContactAddressModel()
        );
      }
    }
  
    return contactAddressModelArr;
  }
  
  function copyContactIA(pFromCapId, pToCapId) {
    //Copies all contacts from pFromCapId to pToCapId
    //07SSP-00037/SP5017
    //
    if (pToCapId == null)
     var vToCapId = capId;
    else
     var vToCapId = pToCapId;
   
   var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess()) {
     var Contacts = capContactResult.getOutput();
      for (yy in Contacts) {
        var newContact = Contacts[yy].getCapContactModel();
        if (Contacts[yy].getPeople().getContactType() == "Property Owner") {
  
      // Retrieve contact address list and set to related contact
        var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
        if (contactAddressrs.getSuccess()) {
        var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
        newContact.getPeople().setContactAddressList(contactAddressModelArr);
        }
        newContact.setCapID(vToCapId);
    
  
  
  
      // Create cap contact, contact address and contact template
        aa.people.createCapContactWithAttribute(newContact);
        copied++;
        //logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      }
    }
    } else {
     logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
     return false;
    }
    return copied;
   }

  
function getGuidesheetASIField(inspId, gName, gItem, asiGroup, asiSubGroup, asiLabel, capId) 
{
	var asiValue = "";
	var itemCap = capId;
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) 
	{
		var inspArray = r.getOutput();
		for (i in inspArray) 
		{
			if (inspArray[i].getIdNumber() == inspId) 
			{
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) 
				{
					for(var i=0; i< gs.size(); i++)
					{
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) 
						{
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0; j< guidesheetItem.size(); j++)
							{
								var item = guidesheetItem.get(j);
								if(item && gItem == item.getGuideItemText() && asiGroup == item.getGuideItemASIGroupName()) 
								{
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) 
									{
										for(var k = 0; k < ASISubGroups.size(); k++) 
										{
											var ASISubGroup = ASISubGroups.get(k);
											if(ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup) 
											{
												var ASIModels =  ASISubGroup.getAsiList();
												if(ASIModels) 
												{
													for( var m = 0; m < ASIModels.size(); m++) 
													{
														var ASIModel = ASIModels.get(m);
														if(ASIModel && ASIModel.getAsiName() == asiLabel) 
														{
															aa.print("ASI value: " + ASIModel.getAttributeValue());
															asiValue = ASIModel.getAttributeValue();		
														}
													}
												}
											}
										}
									}
								}
							}							
						}
					}
				} 
				else 
				{
					aa.print("No guidesheets for this inspection");
					return asiValue;
				}
			}
		}
	} 
	else 
	{
		aa.print("No inspections on the record");
		return asiValue;
	}
	aa.print("No updates to the guidesheet made");
	return asiValue;
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
  


function getCompletedInspectionID(insp2Check, capId)
	{
	// warning, returns only the first scheduled occurrence
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
    for (xx in inspList)
    aa.print("type: " + inspList[xx].getInspectionType() + " status: " + inspList[xx].getInspectionStatus().toUpperCase());
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("COMPLETE"))
				return inspList[xx].getIdNumber();
		}
	return false;
    }
    
function copyAppName(srcCapId, capModel) {
    var appName = aa.cap.getCap(srcCapId).getOutput().specialText;
    capModel.setSpecialText(appName);

    var result = aa.cap.editCapByPK(capModel);
    if (!result.getSuccess()) {
        logError("Failed to update app name");
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
      aa.print("WARNING: no addresses on this CAP:" + capId);
      capAddresses = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to address: " + s_result.getErrorMessage());
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
      aa.print("WARNING: no parcel on this CAP:" + capId);
      capParcelArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to parcel: " + s_result.getErrorMessage());
    capParcelArr = null;  
  }
  return capParcelArr;
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