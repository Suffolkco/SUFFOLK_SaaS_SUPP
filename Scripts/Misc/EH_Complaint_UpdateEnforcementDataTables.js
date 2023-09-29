// This Script creates an Enforcement Case Record with data from the Permit
// The Enforcement Case will become a child of the Facility, not the Permit
// Any Row in the Violations table that has the checkbox "Create Enforcement Actions" selected will be copied to this new record
// ANy row where "Create Enforcement Actions" is not checked will but there is a value in "Enf Case #" will get updated on that Enf Case"

var myTable = new Array;
var fieldValsArray = new Array;
var myTable = loadASITable("VIOLATIONS",capId);
var violationsAryNew = new Array();
var parentFacilityID =  getFacilityId(capId);

if(!parentFacilityID){
    parentFacilityID = capId;
}
if (myTable != null && parentFacilityID) {
    for (x in myTable) {
        var current_row = myTable[x];
        var asitRow = new Array();
        if(current_row["Create/Assign Enforcement"] == "CHECKED" && matches(current_row["Enf Case #"],null,undefined,"")){
            //No Enf Case entered on table so attempt to create new case initiated
            //Create Enforcement Record unless previously created
            //Check Child records for the Existing Checklist Item Seq No
            var cldEnfAry = new Array;
            var flagFoundGS = false;
            cldEnfAry = getChildren("EnvHealth/Enforcement/Violation/NA",parentFacilityID);
            for(x in cldEnfAry){
                var childEnfCapId = cldEnfAry[x];
                if(valueExistInASIT2Col("VIOLATIONS","Checklist Item ID",current_row["Checklist Item ID"],"Inspection ID",current_row["Inspection ID"],childEnfCapId)){
                    flagFoundGS = true;
                }
            }
            if(flagFoundGS){
                showMessage = true;
                comment("<B><Font Color='RED'>WARNING: This Violation " + current_row["Violation Name"] + " ia already being used on Enforcement record " + childEnfCapId.getCustomID() + ", skipping</Font></B>")
            }else{
                asitRow["Permit #"] = new asiTableValObj("Permit #", "", "Y");
                if(!matches(current_row["Violation Name"],null,undefined,"null")){
                    asitRow["Violation Name"] = new asiTableValObj("Violation Name", current_row["Violation Name"].toString(), "Y");
                }
                if(!matches(current_row["Status"],null,undefined,"null")){
                    asitRow["Status"] = new asiTableValObj("Status", current_row["Status"].toString(), "Y");
                }
                if(!matches(current_row["Degree"],null,undefined,"null")){
                    asitRow["Degree"] = new asiTableValObj("Degree", current_row["Degree"].toString(), "Y");
                }
                if(!matches(current_row["Observed Date"],null,undefined,"null")){
                    asitRow["Observed Date"] = new asiTableValObj("Observed Date",  current_row["Observed Date"].toString(), "Y");
                }
                if(!matches(current_row["Comply By"],null,undefined,"null")){
                    asitRow["Comply By"] = new asiTableValObj("Comply By",current_row["Comply By"].toString(),"N");
                }
                if(!matches(current_row["Complied On"],null,undefined,"null")){
                    asitRow["Complied On"] = new asiTableValObj("Complied On",current_row["Complied On"].toString(),"N");
                }
                if(!matches(current_row["Compliance Type"],null,undefined,"null")){
                    asitRow["Compliance Type"] = new asiTableValObj("Compliance Type",current_row["Compliance Type"].toString(),"N");
                }
                if(!matches(current_row["Checklist Comment"],null,undefined,"null")){
                    asitRow["Checklist Comment"] = new asiTableValObj("Checklist Comment",current_row["Checklist Comment"].toString(),"Y");
                }
                asitRow["Checklist Item ID"] = new asiTableValObj("Checklist Item ID", current_row["Checklist Item ID"].toString(), "Y");
                asitRow["Inspection ID"] = new asiTableValObj("Inspection ID", current_row["Inspection ID"].toString(), "Y");
                asitRow["Permit #"] = new asiTableValObj("Permit #", capId.getCustomID(), "Y");
                violationsAryNew.push(asitRow);
            }
            //Set Create Enforcement Actions back to unchecked
			editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(current_row["Checklist Item ID"]),"Inspection ID", parseInt(current_row["Inspection ID"]),"Create/Assign Enforcement","UNCHECKED");
			
        }else if (current_row["Create/Assign Enforcement"] == "CHECKED" && !matches(current_row["Enf Case #"],null,undefined,"")){
            //If there is already a value in the Enf Case# then assume the user wants to add this Violation to an existing Case
            //Check Child records for the Existing Checklist Item Seq No
            //If not found then attempt to Add a ROw to the Violation table in an existing Record
            //Enf Record ASlt Id must match what was specified in the nf Case # field
            var flagFoundGSExisting = false;
            var flagCouldNotFindEnfCase = true;
            cldEnfAry = getChildren("EnvHealth/Enforcement/Violation/NA",parentFacilityID);
            for(x in cldEnfAry){
                var violationsAryExisting = new Array;
                var childEnfCapId = cldEnfAry[x];
                if(childEnfCapId.getCustomID() == current_row["Enf Case #"].toString()){
                    if(valueExistInASIT2Col("VIOLATIONS","Checklist Item ID",current_row["Checklist Item ID"].fieldValue,"Inspection ID",current_row["Inspection ID"].fieldValue,childEnfCapId)){
                        flagFoundGSExisting = true;
                    }
                    flagCouldNotFindEnfCase = false;
                    if(!flagFoundGSExisting){
                        //Add a row to the ASIT on target case
                        var existingEnfCaseID = getApplication(current_row["Enf Case #"].toString());
                        if(!matches(existingEnfCaseID,null,undefined,"")){
                            asitRow["Permit #"] = new asiTableValObj("Permit #", "", "Y");
                            if(!matches(current_row["Violation Name"],null,undefined,"null")){
                                asitRow["Violation Name"] = new asiTableValObj("Violation Name", current_row["Violation Name"].toString(), "Y");
                            }
                            if(!matches(current_row["Status"],null,undefined,"null")){
                                asitRow["Status"] = new asiTableValObj("Status", current_row["Status"].toString(), "Y");
                            }
                            if(!matches(current_row["Degree"],null,undefined,"null")){
                                asitRow["Degree"] = new asiTableValObj("Degree", current_row["Degree"].toString(), "Y");
                            }
                            if(!matches(current_row["Observed Date"],null,undefined,"null")){
                                asitRow["Observed Date"] = new asiTableValObj("Observed Date",  current_row["Observed Date"].toString(), "Y");
                            }
                            if(!matches(current_row["Comply By"],null,undefined,"null")){
                                asitRow["Comply By"] = new asiTableValObj("Comply By",current_row["Comply By"].toString(),"N");
                            }
                            if(!matches(current_row["Complied On"],null,undefined,"null")){
                                asitRow["Complied On"] = new asiTableValObj("Complied On",current_row["Complied On"].toString(),"N");
                            }
                            if(!matches(current_row["Compliance Type"],null,undefined,"null")){
                                asitRow["Compliance Type"] = new asiTableValObj("Compliance Type",current_row["Compliance Type"].toString(),"N");
                            }
                            if(!matches(current_row["Checklist Comment"],null,undefined,"null")){
                                asitRow["Checklist Comment"] = new asiTableValObj("Checklist Comment",current_row["Checklist Comment"].toString(),"Y");
                            }
                            asitRow["Checklist Item ID"] = new asiTableValObj("Checklist Item ID", current_row["Checklist Item ID"].toString(), "Y");
                            asitRow["Inspection ID"] = new asiTableValObj("Inspection ID", current_row["Inspection ID"].toString(), "Y");
                            asitRow["Permit #"] = new asiTableValObj("Permit #", capId.getCustomID(), "Y");
                            
                            violationsAryExisting.push(asitRow);
                            if(violationsAryExisting.length > 0){
                                addASITable("VIOLATIONS", violationsAryExisting, existingEnfCaseID);
                            }

                        }
                    }
                }
            }
            // If the Specified Case cant be found update the Enf Case # field in the table to "NOT FOUND"
           // if(flagCouldNotFindEnfCase){
			//	editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(current_row["Checklist Item ID"].fieldValue),"Inspection ID", parseInt(current_row["Inspection ID"].fieldValue), "Enf Case #","NOT FOUND");
            //}
            //Set Create Enforcement Actions back to unchecked
			editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(current_row["Checklist Item ID"].fieldValue),"Inspection ID", parseInt(current_row["Inspection ID"].fieldValue),"Create/Assign Enforcement","UNCHECKED");
        }else if (current_row["Create/Assign Enforcement"] != "CHECKED" && !matches(current_row["Enf Case #"],null,undefined,"")){
            enfCapId = getApplication(current_row["Enf Case #"].toString());
            var GSInspId = current_row["Inspection ID"].fieldValue;
            if(!matches(current_row["Checklist Item ID"],undefined,null)){
                var GSSeqNo = current_row["Checklist Item ID"].fieldValue;
                var tblStatus = current_row["Status"].fieldValue;
                var degree = current_row["Degree"].fieldValue;
                var obsDate = current_row["Observed Date"].fieldValue;
                var complyBy = current_row["Comply By"].fieldValue;
                var complyOn = current_row["Complied On"].fieldValue;
                var complyType = current_row["Compliance Type"].fieldValue;
                var checklistCom = current_row["Checklist Comment"].fieldValue;
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Status", tblStatus);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Degree", degree);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Observed Date", obsDate);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Comply By", complyBy);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Complied On", complyOn);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Compliance Type", complyType);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Checklist Comment", checklistCom);
            }
        }
    }
}

if(violationsAryNew.length > 0 ){
    //Create the Enforcement Case
    var newEnfCapId = createChildEnforcementAction("EnvHealth", "Enforcement", "Violation", "NA", "",parentFacilityID);
    var sourceCap = aa.cap.getCap(capId).getOutput();
	var sourceCapAppName = aa.cap.getCap(capId).getOutput().specialText;
    var newEnfCapAlias = sourceCap.getCapType().getAlias();
    editAppSpecific("Case Initiated Date",dateAdd(null,0),newEnfCapId);
	editAppSpecific("Facility ID", parentFacilityID.getCustomID(), newEnfCapId);
	editAppSpecific("Facility Name",sourceCapAppName,newEnfCapId);
	editAppName(sourceCapAppName, newEnfCapId);
    if(!matches(newEnfCapAlias,null,undefined)){
        editAppSpecific("Parent Record Type",newEnfCapAlias,newEnfCapId);
    }
	
	// Copy Contacts from sourceCap to newEnfCapId
	copyContacts(capId, newEnfCapId);
	
    addASITable("VIOLATIONS", violationsAryNew, newEnfCapId);
    //Final step is to update the Enf Case and Permit Number fields
    for (x in violationsAryNew){
		editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(violationsAryNew[x]["Checklist Item ID"]),"Inspection ID", parseInt(violationsAryNew[x]["Inspection ID"]),"Enf Case #",newEnfCapId.getCustomID());
    }
    for (x in violationsAryNew){
		editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(violationsAryNew[x]["Checklist Item ID"]),"Inspection ID", parseInt(violationsAryNew[x]["Inspection ID"]),"Permit #",capId.getCustomID());
    }
}

	

function createChildEnforcementAction(grp,typ,stype,cat,desc) // optional parent capId
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
		//capContactResult = aa.people.getCapContactByCapID(itemCap);
		//if (capContactResult.getSuccess())
		//	{
		//	Contacts = capContactResult.getOutput();
		//	for (yy in Contacts)
		//		{
		//		var newContact = Contacts[yy].getCapContactModel();
		//		newContact.setCapID(newId);
		//		aa.people.createCapContact(newContact);
		//		logDebug("added contact");
		//		}
		//	}	

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
