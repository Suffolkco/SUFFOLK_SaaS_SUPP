function checkForRelatedSITERecord(parcelNumber) {
    var foundSite = false;
    var siteCap;
    var listOfRelatedRecorsdFromParcel = capIdsGetByParcel(parcelNumber);


    for (record in listOfRelatedRecorsdFromParcel) {
        //Here we will pull out the cap. 
        //We are looking for a related SITE record for this particular Parcel Number
        var itemCap = listOfRelatedRecorsdFromParcel[record];
        var itemCapType = aa.cap.getCap(itemCap).getOutput().getCapType().toString();
        logDebug("We found this record: " + itemCap.getCustomID() + " which is a: " + itemCapType);
        if (itemCapType == "DEQ/General/Site/NA") {
            //Set globally true if there's a site.
            foundSite = true;
            siteCap = itemCap;
        }
    }

    //No Site Found: we need to create one and copy everything over. 
    //We should also create a new site record
    if (!foundSite) {

         // Copy project/app name from the child to site when it's created from OPC records.
         var capType = aa.cap.getCap(capId).getOutput().getCapType().toString();
         logDebug("Cap Type is: " + capType);
         if(matches(capType, "DEQ/OPC/Global Containment/Application", "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Hazardous Tank Closure/Application", "DEQ/OPC/Swimming Pool/Application", "DEQ/OPC/Swimming Pool/Permit","DEQ/OPC/Site Assessment/Application")) 
         {
              // Short Note is a project name.
              var shortNotes = getShortNotes(capId);
              logDebug("Record short notes : " + shortNotes); 
              // Special Text is application name.
              cap = aa.cap.getCap(capId).getOutput();
              var appName = cap.getSpecialText();
                          
             var updateToName;
             if (publicUser) {	      
                 
                 updateToName = appName;                
             }
             else
             {
                 updateToName = shortNotes;               
             }
             var myParent = createParentOPC("DEQ", "General", "Site", "NA", "Created from " + updateToName);
 
             copyParcels(capId, myParent);                          
             copyOwner(capId, myParent);
             copyParcelGisObjectsParent(capId, myParent);
             updateShortNotes(updateToName, myParent);        
             editAppName(updateToName, myParent);
             
             var parentShortNotes = getShortNotes(myParent);
            
             var parentCap =aa.cap.getCap(myParent).getOutput();
             parentAppName = parentCap.getSpecialText();
             logDebug("Updating Site record project and app name fields to:  " + updateToName);
             var siteCapType = aa.cap.getCap(myParent).getOutput().getCapType().toString();
            
             //msg = "Parcel No" + parcelNumber + ".Length: " + parcelNumber.length() + "My parent: " + myParent + ". Parent Cap Type is: " + siteCapType + ".Short note: " + parentShortNotes + ".App Name: " + parentAppName;            
         }
         else
         {
            var myParent = createParent("DEQ", "General", "Site", "NA", "Created from " + capId.getCustomID());
            copyParcels(capId, myParent);
            copyOwner(capId, myParent);
            copyParcelGisObjectsParent(capId, myParent);

            //copyParcelGisObjects() needs to be placed here to copy the Gis object from the child to the new site parent
            logDebug("Site was not found, creating a new one. " + "Created from " + capId.getCustomID());
         }
    }
    else if (foundSite) {
        logDebug("We found a matching SITE record: " + siteCap.getCustomID());
        var appStatus;        
        sca = String(siteCap).split("-");
        logDebug("Site Cap Id is: " + siteCap);
        logDebug("Site sca is: " + sca);
        
		siteCapId = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput()
        var siteResult = aa.cap.getCap(siteCapId);
        logDebug("Success? " + siteResult.getSuccess());
        if (siteResult.getSuccess()) {
           licCap = siteResult.getOutput();
           if (licCap != null) {
              appStatus = "" + licCap.getCapStatus();  
              logDebug("App Status is:" + appStatus);            
           }        
        if (appStatus != "Retired")
        {
            ammendARecord(capId, siteCap);
            addParent(siteCap);
            copyConditions(siteCap);
        }
        else
        {
            logDebug("Not to relate to parent Site: " + siteCap.getCustomID() + "App Status is:" + appStatus);   
        }
    }

}
}
	
function copyParcelGisObjectsParent(childId, parentId) {
    var capParcelResult = aa.parcel.getParcelandAttribute(childId, null);
    if (capParcelResult.getSuccess()) {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels) {
            var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
            logDebug("Looking at parcel " + ParcelValidatedNumber);
            var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
            if (gisObjResult.getSuccess())
                var fGisObj = gisObjResult.getOutput();
            else { logDebug("**WARNING: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

            for (a1 in fGisObj) // for each GIS object on the Cap
            {
                var gisTypeScriptModel = fGisObj[a1];
                var gisObjArray = gisTypeScriptModel.getGISObjects()
                for (b1 in gisObjArray) {
                    var gisObjScriptModel = gisObjArray[b1];
                    var gisObjModel = gisObjScriptModel.getGisObjectModel();

                    var retval = aa.gis.addCapGISObject(parentId, gisObjModel.getServiceID(), gisObjModel.getLayerId(), gisObjModel.getGisId());

                    if (retval.getSuccess()) { logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId() + " to: " + parentId.getCustomID()) }
                    
                    else { logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()); return false }
                }
            }
        }
    }
    else { logDebug("**ERROR: Getting Parcels from Cap.  Reason is: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false }
}

function copyConditions(fromCapId) // optional toCapID
{

	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	var getFromCondResult = aa.capCondition.getCapConditions(fromCapId);
	if (getFromCondResult.getSuccess())
		var condA = getFromCondResult.getOutput();
	else {
		logDebug("**ERROR: getting cap conditions: " + getFromCondResult.getErrorMessage());
		return false
	}

	for (cc in condA) {
		var thisC = condA[cc];

		var addCapCondResult = aa.capCondition.addCapCondition(itemCap, thisC.getConditionType(), thisC.getConditionDescription(), thisC.getConditionComment(), thisC.getEffectDate(), thisC.getExpireDate(), sysDate, thisC.getRefNumber1(), thisC.getRefNumber2(), thisC.getImpactCode(), thisC.getIssuedByUser(), thisC.getStatusByUser(), thisC.getConditionStatus(), currentUserID, String("A"), null, thisC.getDisplayConditionNotice(), thisC.getIncludeInConditionName(), thisC.getIncludeInShortDescription(), thisC.getInheritable(), thisC.getLongDescripton(), thisC.getPublicDisplayMessage(), thisC.getResolutionAction(), null, null, thisC.getReferenceConditionNumber(), thisC.getConditionGroup(), thisC.getDisplayNoticeOnACA(), thisC.getDisplayNoticeOnACAFee(), thisC.getPriority(), thisC.getConditionOfApproval());
		if (addCapCondResult.getSuccess())
			logDebug("Successfully added condition (" + thisC.getImpactCode() + ") " + thisC.getConditionDescription());
		else
			logDebug("**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
	}
} 

function createParentOPC(grp,typ,stype,cat,desc) 
//
// creates the new application and returns the capID object
//
	{
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
		var result = aa.cap.createAppHierarchy(newId, capId); 
		if (result.getSuccess())
			logDebug("Parent application successfully linked");
		else
			logDebug("Could not link applications");

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
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

		// DO NOT Copy Contacts - EHIMS-5290
		/*capContactResult = aa.people.getCapContactByCapID(capId);
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
			} */	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(capId);
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
		logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
		}
	}