//ASA:DEQ/OPC/HAZARDOUS TANK/APPLICATION
 
var showDebug = true;

var parentId = getParent();
var tankInfo = loadASITable("TANK INFORMATION");
var childNoteArray = new Array();
var plnFileTotal = 0;
var regFeeTotal = 0;
var abovegrTCap = 0;
var tankCapacity = 0;
var numOfSmAbovegrTank = 0;
var numOfSmTank = 0;
var insRegCount = 0;
var feeEx = AInfo["Fee Exempt"];

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
  logDebug("ASA: Submit Tank Installation/Registration");
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
      //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
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

var createDummyTank = true;

//Will not add 3, 4, or 5's if the user goes back in the pageflow
for (var k = 0; k < tankInfo.length; k++)
{
  var scoCod = tankInfo[k]["Scope of Tank Work Code"];
  logDebug("tankInfo.length:" + tankInfo.length);
  logDebug("scoCod:" + scoCod);
	if (!matches(scoCod, "3", "4", "5", "6", "7", "8"))
	{
		insRegCount++;
  }
  if (scoCod != "3" && scoCod != "4" && scoCod != "5" && scoCod != "6" && scoCod != "7" && scoCod != "8")
  {
    logDebug("Do not create Dummy Tank:" + scoCod);
    createDummyTank = false;

  }
}


// Add check to see if we should create a dummy tank to bypass the workflow
// This is to overcome the issue where there is no associated tank crated for the record
if (publicUser)
{ 
 
    // Find if there are any existing dummy child record under tank installation parent record already.
    var dummyChildArray = getChildren("DEQ/OPC/Hazardous Tank/ExistingTankVerification", capId);
    //Will not add more dummy record if the user goes back in the pageflow.
    // We only need one dummy record. 
    logDebug("dummyChildArray is:" + dummyChildArray);
      
    if (createDummyTank) 
    {
      logDebug("Create Dummy Tank.");

      if (dummyChildArray == null || dummyChildArray.length == 0) 
      {    
        var dummyTypeArray = new Array("DEQ", "OPC", "Hazardous Tank", "ExistingTankVerification");
        var dummyTank =	createChildTempRecordOPC(dummyTypeArray, capId);
        //logDebug("Child alt ID is: " + childTank.getCustomID());
        var capResult = aa.cap.getCap(dummyTank);
        var dummyCap = capResult.getOutput().getCapModel();
        // Update Access ACA, do not show in ACA 
        aa.cap.updateAccessByACA(dummyTank, "N");
      }

      // Delete any temp Tank permit since if a dummy tank is created, there is no tank permit.
      var tankChildArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);
			//Will not add the same tanks if the user goes back in the pageflow
      if (tankChildArray != null)
      {
        for (t in tankChildArray)
        {			
          var tCapId = tankChildArray[t];
          logDebug("tCapId: " + tCapId);		
          var tcapmodel = aa.cap.getCap(tCapId).getOutput().getCapModel();
          logDebug("isCompleteCap? " + tcapmodel.isCompleteCap());	
          if(!tcapmodel.isCompleteCap())								
          {  			
            var tDummyResult = aa.cap.deletePartialCAP(tCapId);
    
            if (tDummyResult.getSuccess()) {
              logDebug("Delete partial tank permit CAP successfully. " + tCapId);
            }
            else
            {
              logDebug("Not able to delete tank permit sucessfully");
            }
          }
        }
      }
      
    }
    else
    {    
      // Delete any existing dummy tank verification record in case user goes back to the previous page
      if (dummyChildArray != null)
      {
        for (d in dummyChildArray)
        {			
          var dummyCapId = dummyChildArray[d];
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
}

if(tankInfo.length != null && tankInfo.length >= 1)
{
	//logDebug("This is how many rows my table has: " + tankInfo.length);
	for(var x = 0; x < tankInfo.length; x++)
	{ 
		var genInfo = tankInfo[x]["Generic Tank Info"];
		var genMod = tankInfo[x]["Generic Model"];
		var genMan = tankInfo[x]["Generic Manufacturer"];
		var genVolume = tankInfo[x]["Capacity"];
		var tankLoc = tankInfo[x]["Tank Location"];
		var tankLab = tankInfo[x]["Tank Location Label"];
		var tankCod = tankInfo[x]["Tank Location Code"];
    /* There is an expression when user selects the "Scope of Tank Work" dropdown, 
    it will populate "Scope of Tank Work Code". */
    // var scoTank = tankInfo[x]["Scope of Tank Work"];
    // This is a read-only and populate by "Scope of Tank Work" dropdown expression
    // var scoLab = tankInfo[x]["Scope of Tank Work Label"];
    // This is a read-only and populate by "Scope of Tank Work" dropdown expression
		var scoCod = tankInfo[x]["Scope of Tank Work Code"];
		var storType = tankInfo[x]["Storage Type"];
		var storLab = tankInfo[x]["Storage Type Label"];
		var storCod = tankInfo[x]["Storage Type Code"];
		var proCat = tankInfo[x]["Product Stored Category"];
		var proLab = tankInfo[x]["Product Stored Label"];
		var proCod = tankInfo[x]["Product Stored Code"];
		var tankIdFromPlan = tankInfo[x]["Tank Id from Plan"];
		var genInfoStr = (genInfo.toString());
		var genModStr = (genMod.toString());
		var genManStr = (genMan.toString());
		var genVolStr = (genVolume.toString());
		var tankLocStr = (tankLoc.toString());
		var tankLabStr = (tankLab.toString());
		var tankCodStr = (tankCod.toString());
		var storTypeStr = (storType.toString());
		var storLabStr = (storLab.toString());
		var storCodStr = (storCod.toString());
		var proCatStr = (proCat.toString());
		var proLabStr = (proLab.toString());
		var proCodStr = (proCod.toString());
		var tankIdStr = (tankIdFromPlan.toString());
		
		//Assessing File Fees for the new install
		if (scoCod == "1" || scoCod == "7" || scoCod == "8")//New Install, Obtain Permit for Registered and Unregistered Tank
        {
	        //Plan Filing fee for any underground tanks
			if (tankCod == "3" || tankLoc == "4") //Location: Underground
            {
				logDebug("Adding 955 to plnFileTotal");
				plnFileTotal += 955;
			}
			//Plan Filing fee for aboveground tank/storage/sump…
            else 
            {	
	            //Plan Filing fee for Generic Tanks
                if (genInfo != "Non Generic|NA|NA")
			    {
					logDebug("Adding 240 to plnFileTotal");
					plnFileTotal += 240;
				}
				//Plan Filing fee for NON-Generic Tank
				else 
				{
					//Plan Filing fee for Drum and Portable Containers
					if (storCod == "1" || storType == "17")//Drum or Portable Containers
					{
						if( parseFloat(genVolume) > 1320)
						{
							logDebug("Adding 710 to plnFileTotal");
							plnFileTotal += 710;
						}
						else
						{
							logDebug("Adding 370 to plnFileTotal");
							plnFileTotal += 370;
						}
					}	
					//Plan Filing fee for Dry Storage and Transfer Pad
					else if (storCod == "5" || storCod == "13")//Dry Storage or Transfer Pad
					{
						logDebug("Adding 470 to plnFileTotal");
						plnFileTotal += 470;
					}
					//Plan Filing fee for Tank/Tots/Oil/water Separator/Parts Washer
					else
					{
						abovegrTCap += parseInt(genVolume);
						if (parseFloat(genVolume) > 250)
						{
							logDebug("Adding 955 to plnFileTotal");
							plnFileTotal += 955;
						}
						else
						{
							logDebug("Adding 1 to numOfSmAbovegrTank");
							numOfSmAbovegrTank++;
						}
					}

				}
			}
		}
		// Plan Filing fee for Registration or Re-Register
		else if (scoCod == "2" || scoCod == "6")
		{
			//no Plan Filing fee for tank Registration ONLY
		}
        //Plan Filing fee for modification
        else
        {
	        //Plan Filing Fee for Dry Storage and Transfer Pad modification
			if (storCod == "5" || storCod == "13")//Dry Storage or Transfer Pad
			{
				logDebug("Adding 470 to plnFileTotal");
				plnFileTotal += 470;
			}
			//Plan Filing Fee for other modifications
			else
			{
				if (scoCod == "4")//Substantial Repair/Modification of Piping/Dispenser Work Only
				{
					logDebug("Adding 160 to plnFileTotal");
					plnFileTotal += 160;
				}
				if (scoCod == "3")//Substantial Repair/Modification of Existing Storage Area/Tank Onl
				{
					logDebug("Adding 230 to plnFileTotal");
					plnFileTotal += 230;
				}
				if (scoCod == "5")//Substantial Repair/Modification of Tank and Piping/Dispenser Work
				{
					logDebug("Adding 350 to plnFileTotal");
					plnFileTotal += 350;
                }
            }
        }
    
		//Assessing Registration Fees
    if (scoCod == "1" || scoCod == "2" || scoCod == "6" || scoCod == "8")//New Install or Registration
		{
			//Registration fee for Drum Storage and Portable containers	
			if (storCod == "1" || storCod == "17")
			{
				if(parseFloat(genVolume) > 250)
				{
                    logDebug("Adding 165 to regFeeTotal");
					regFeeTotal += 165;
				}
				else if(tankCod == "2")
				{
					logDebug("Adding 165 to regFeeTotal");
					regFeeTotal += 165;
				}
			}
			//Registration fee for Dry Storage
			else if (storCod == "5")
			{ 
                if (parseFloat(genVolume) >= 1)
                {
					logDebug("Adding 165 to regFeeTotal");
					regFeeTotal += 165;
				}
			}
			//Registration Fees for tank/tote/evaporator/oil/water separator/parts washer
			else
			{
        		logDebug("Adding " + parseFloat(genVolume) + " to tankCapacity");
				tankCapacity +=(parseFloat(genVolume));

				if (parseFloat(genVolume) >= 80)
				{
					logDebug("Adding 165 to regFeeTotal");
					regFeeTotal += 165;
				}
				else 
				{
					logDebug("Adding 1 to numOfSmTank");
					numOfSmTank++;
				}
			}
		}
		else
        {
	        //no registration fee for modification
        }

		if (!publicUser)
		{
            logDebug("Scope of Tank work code is: " + scoCod);
      if (!matches(scoCod, "3", "4", "5", "6", "7", "8"))
            {
                var childTank = createChild("DEQ", "OPC", "Hazardous Tank", "Permit", "Tank Installation", parentId);
                //logDebug("Child alt ID is: " + childTank.getCustomID());
                var capResult = aa.cap.getCap(childTank);
                var childCap = capResult.getOutput().getCapModel();
				logDebug("Child alt ID is: " + childTank.getCustomID());
                childNoteArray.push(childTank.getCustomID());
            }
		}
		else if (publicUser)
		{
			var childArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);
			//Will not add the same tanks if the user goes back in the pageflow
			if (childArray == null || (parseInt(childArray.length) != parseInt(insRegCount)))
			{
				if (!matches(scoCod, "3", "4", "5", "6", "7", "8"))
				{
					var cTypeArray = new Array("DEQ", "OPC", "Hazardous Tank", "Permit");
					var childTank =	createChildTempRecordOPC(cTypeArray, capId);
					//logDebug("Child alt ID is: " + childTank.getCustomID());
					var capResult = aa.cap.getCap(childTank);
					var childCap = capResult.getOutput().getCapModel();
				}
			}
		}
        if (childTank != null)
		{
            if (!matches(scoCod, "3", "4", "5", "6", "7", "8"))
            {
                editAppSpecific("Generic Tank Info", genInfoStr, childTank);
                editAppSpecific("Generic Model #", genModStr, childTank);
                editAppSpecific("Generic Manufacturer", genManStr, childTank);
                editAppSpecific("Capacity", genVolStr, childTank);
                editAppSpecific("Tank Location", tankLocStr, childTank);
                editAppSpecific("Tank Location Label", tankLabStr, childTank);
                editAppSpecific("Tank Location Code", tankCodStr, childTank);
                editAppSpecific("Storage Type", storTypeStr, childTank);
                editAppSpecific("Storage Type Label", storLabStr, childTank);
                editAppSpecific("Storage Type Code", storCodStr, childTank);
                editAppSpecific("Product Stored", proCatStr, childTank);
                editAppSpecific("Product Stored Label", proLabStr, childTank);
                editAppSpecific("Product Stored Code", proCodStr, childTank);
                editAppSpecific("Tank ID From Plan", tankIdStr, childTank);

                copyLicenseProfessional(capId, childTank);

                copyAddress(capId, childTank);

                copyParcel(capId, childTank);
                
                copyPeople(capId, childTank);
                
                copyOwner(capId, childTank);
            }
		}
	}
	if (abovegrTCap > 250 && numOfSmAbovegrTank >= 1)
	{
		logDebug("Adding 955 to plnFileTotal on line 107");
		plnFileTotal += 955;
	}

	if (tankCapacity < 250 && numOfSmTank >= 1)
	{
		logDebug("Adding 165 to regFeeTotal on line 186");
		regFeeTotal += 165;
	}
	if (tankCapacity > 250 && numOfSmTank >= 1)
	{
		logDebug("Adding 165 to regFeeTotal on line 186");
		regFeeTotal += (165 * numOfSmTank);
	}
	//set max Plan Filing fee
	if (parseFloat(plnFileTotal) > 8855)
	{
		plnFileTotal = 8855;
  }
  if (feeEx == "No" || feeEx == null)
  {
    if (plnFileTotal > 0)
    {
      updateFee("HM-CON-FF", "DEQ_HAZCON", "FINAL", plnFileTotal, "Y");
    }
    if (regFeeTotal > 0)
    {
      updateFee("HM-CON-REG", "DEQ_HAZCON", "FINAL", regFeeTotal, "Y");
    }
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
