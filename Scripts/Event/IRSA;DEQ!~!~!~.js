//IRSA:DEQ/~/~/~

var insYear = inspObj.getInspectionStatusDate().getYear().toString();
var insMonth = inspObj.getInspectionStatusDate().getMonth().toString();
var insDay = inspObj.getInspectionStatusDate().getDayOfMonth().toString();

if (insMonth.length == 1)
{
    insMonth = "0" + insMonth;
}
if (insDay.length == 1)
{
    insDay = "0" + insDay;
}

var insCon = insMonth + "/" + insDay + "/" + insYear;

if (inspType == "Sampling Event" && inspResult == "Sent to Lab")
{
    insId = inspObj.getIdNumber();
    var rParams = aa.util.newHashMap();
    var rFile = new Array();
    rParams.put("INSP_SEQ_NO", insId.toString());
    rParams.put("BLANK", insCon);
    //logDebug("Params are: " + rParams);// 
    // Old report
    //rFile = reportRunSave("Analysis_Request_Form_by_Insp_Seq_No", true, false, true, "General", rParams);
    // New report
    rFile = reportRunSave("603_Sample_Submission_Form_New", true, false, true, "General", rParams);

}

//IA Record Creation from WWM Record 



if (appTypeArray[1] == "WWM")
{
    if (inspType == "WWM_RES_System 1")
    {
        var vInspection = aa.inspection.getInspection(capId, inspId);
        if (vInspection.getSuccess())
        {
            var vInspection = vInspection.getOutput();
            var vInspectionActivity = vInspection.getInspection().getActivity();
            // Get the guidesheets and their items from the activity model
            var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
            var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
            if (vGuideSheetArray.length != 0)
            {
                var x = 0;
                for (x in vGuideSheetArray)
                {
                    var iaManufacturer = null;
                    var iaModel = null;
                    var iaLeachPoolType = null;
                    var iaLeachOtherType = null;
                    var iaLeachProduct = null;
                    var iaNumber = null;
                    var iaASIModel = null;
                    var vGuideSheet = vGuideSheetArray[x];
                    if ("Sewage Disposal & Water Supply".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
                    {
                        var vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                        var z = 0;
                        for (z in vGuideSheetItemsArray)
                        {
                            var vGuideSheetItem = vGuideSheetItemsArray[z];
                            var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
                            if (ASISubGroups)
                            {
                                for (var k = 0; k < ASISubGroups.size(); k++)
                                {
                                    var ASISubGroup = ASISubGroups.get(k);
                                    var ASIModels = ASISubGroup.getAsiList();
                                    if (ASIModels)
                                    {
                                        for (var m = 0; m < ASIModels.size(); m++)
                                        {
                                            var ASIModel = ASIModels.get(m);
                                            if (ASIModel)
                                            {
                                                if (ASIModel.getAsiName() == "Manufacturer")
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
                                                    {
                                                        iaManufacturer = ASIModel.getAttributeValue();
                                                    }

                                                }
                                                else if (ASIModel.getAsiName() == "Model")
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
                                                    {
                                                        iaModel = ASIModel.getAttributeValue();
                                                    }

                                                }
                                                else if (ASIModel.getAsiName() == "Type")
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    if (vGuideSheetItem.getGuideItemText() == "Leaching Pool(s)/Galley(s)")
                                                    {
                                                        iaLeachPoolType = ASIModel.getAttributeValue();
                                                    }

                                                }
                                                else if (ASIModel.getAsiName() == "Leaching Type")
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
                                                    {
                                                        iaLeachOtherType = ASIModel.getAttributeValue();
                                                    }

                                                }
                                                else if (ASIModel.getAsiName() == "Leaching Product")
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
                                                    {
                                                        iaLeachProduct = ASIModel.getAttributeValue();
                                                    }

                                                }
                                                else if (ASIModel.getAsiName() == "IA Record Number")
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
                                                    {
                                                        iaNumber = ASIModel.getAttributeValue();
                                                        if (ASIModel.getAttributeValue() == null)
                                                        {
                                                            iaASIModel = ASIModel;
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else
                    {
                        logDebug("Failed to get guide sheet item");
                    }
                    if (iaManufacturer)
                    {
                        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Technology Name/Series", iaManufacturer);
                        if (getCapResult.getSuccess())
                        {
                            var apsArray = getCapResult.getOutput();
                            for (aps in apsArray)
                            {
                                myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
                                logDebug("apsArray = " + apsArray);
                                var relCap = myCap.getCapID();
                                logDebug("relCapID = " + relCap.getCustomID());
                            }
                        }
                        if (iaNumber == null)
                        {
                            var desc = "Automated via:" + capIDString;
                            var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc);
                            logDebug("wwmIA =" + wwmIA);
                            var iaCustom = wwmIA.getCustomID();
                            copyLicensedProfByType(capId, wwmIA, ["IA Installer"]);
                            if (relCap != null)
                            {
                                copyLicensedProfByType(relCap, wwmIA, ["IA Vendor"]);
                            }
                            copyContactsByType(capId, wwmIA, ["Property Owner"]);
                            copyAddress(capId, wwmIA);
                            copyParcel(capId, wwmIA);
                            copyDocumentsToCapID(capId, wwmIA);
                            editAppSpecificLOCAL("Installation Date", insCon, wwmIA);
                            editAppSpecificLOCAL("Manufacturer", iaManufacturer, wwmIA);
                            editAppSpecificLOCAL("Model", iaModel, wwmIA);
                            editAppSpecificLOCAL("WWM Application Number", capIDString, wwmIA);
                            if (iaLeachPoolType != null)
                            {
                                editAppSpecificLOCAL("Leaching", iaLeachPoolType, wwmIA);
                            }
                            else if (iaLeachPoolType == null)
                            {
                                editAppSpecificLOCAL("Leaching", iaLeachOtherType, wwmIA);
                            }
                            var pinNumber = makePIN(8);
                            editAppSpecific('IA PIN Number', pinNumber, wwmIA)
                            //Start Notification to Parent Contacts/LPs
                            
                            var conEmail = "";
                            
                            //gathering LPs from parent
                            var licProfResult = aa.licenseScript.getLicenseProf(capId);
                            var capLPs = licProfResult.getOutput();
                            for (l in capLPs)
                            {
                                if (!matches(capLPs[l].email, null, undefined, ""))
                                {
                                    conEmail += capLPs[l].email + ";"
                                }
                            }

                            //gathering contacts from parent
                            var contactResult = aa.people.getCapContactByCapID(capId);
                            var capContacts = contactResult.getOutput();
                            for (c in capContacts)
                            {
                                if (!matches(capContacts[c].email, null, undefined, ""))
                                {
                                    conEmail += capContacts[c].email + ";"
                                }
                            }

                            //Sending Notification

                            var vEParams = aa.util.newHashtable();
                            var addrResult = getAddressInALine(wwmIA);
                            addParameter(vEParams, "$$altID$$", relCapID);
                            addParameter(vEParams, "$$address$$", addrResult);
                            addParameter (vEParams, "$$pin$$", pinNumber);

                            sendNotification("", conEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);



                            //Update the guidesheet
                            if (iaASIModel)
                            {
                                iaASIModel.setAttributeValue(iaCustom);
                                var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                if (updateResult.getSuccess())
                                {
                                    logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                } else
                                {
                                    logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                }
                            }
                        }
                        else
                        {
                            var getCapResult = aa.cap.getCapID(iaNumber);
                            if (getCapResult.getSuccess())
                            {
                                var wwmIA = getCapResult.getOutput();
                                editAppSpecificLOCAL("Installation Date", insCon, wwmIA);
                                editAppSpecificLOCAL("Manufacturer", iaManufacturer, wwmIA);
                                editAppSpecificLOCAL("Model", iaModel, wwmIA);
                                editAppSpecificLOCAL("WWM Application Number", capIDString, wwmIA);
                                if (iaLeachPoolType != null)
                                {
                                    editAppSpecificLOCAL("Leaching", iaLeachPoolType, wwmIA);
                                }
                                else if (iaLeachPoolType == null)
                                {
                                    editAppSpecificLOCAL("Leaching", iaLeachOtherType, wwmIA);
                                }
                            }
                            else
                            { logDebug("**ERROR: getting cap id (" + iaNumber + "): " + getCapResult.getErrorMessage()) }


                        }
                    }
                    else
                    {
                        logDebug("No Manufacturer");
                    }
                }
            } else
            {
                logDebug("Failed to get guidesheets");
            }
        } else
        {
            logDebug("Failed to get inpection");
        }
    }
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

function copyDocumentsToCapID(fromCapID, toCapID)
{
    var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(), "CAP").getOutput();
    var vDocArray = opDocArray.toArray();
    for (var vCounter in vDocArray)
    {
        var vDoc = vDocArray[vCounter];
        aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
    }
}

function getGuidesheetASIField(pInspId, gName, gItem, asiGroup, asiSubGroup, asiLabel)
{
    var vInspId = parseFloat(pInspId);
    var vInspectionActivity;
    var asiValue = "";
    var guideBiz;
    var vGuideSheetArray = [];
    var vGuideSheet;
    var vGuideSheetItemsArray = [];
    var vGuideSheetItem;
    var vInspection;

    // Get the specific inspection model
    vInspection = aa.inspection.getInspection(capId, vInspId);
    if (vInspection.getSuccess())
    {
        vInspection = vInspection.getOutput();
        vInspectionActivity = vInspection.getInspection().getActivity();

        // Get the guidesheets and their items from the activity model
        guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
        vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                vGuideSheet = vGuideSheetArray[x];
                if (gName.toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
                {
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    var z = 0;
                    for (z in vGuideSheetItemsArray)
                    {
                        vGuideSheetItem = vGuideSheetItemsArray[z];
                        if (vGuideSheetItem && gItem == vGuideSheetItem.getGuideItemText() && asiGroup == vGuideSheetItem.getGuideItemASIGroupName())
                        {
                            var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
                            if (ASISubGroups)
                            {
                                for (var k = 0; k < ASISubGroups.size(); k++)
                                {
                                    var ASISubGroup = ASISubGroups.get(k);
                                    if (ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup)
                                    {
                                        var ASIModels = ASISubGroup.getAsiList();
                                        if (ASIModels)
                                        {
                                            for (var m = 0; m < ASIModels.size(); m++)
                                            {
                                                var ASIModel = ASIModels.get(m);
                                                if (ASIModel && ASIModel.getAsiName() == asiLabel)
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    asiValue = ASIModel.getAttributeValue();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else
                {
                    logDebug("Failed to get guide sheet item");
                }
            }
        } else
        {
            logDebug("Failed to get guidesheets");
        }
    } else
    {
        logDebug("Failed to get inpection");
    }
    return asiValue;
}
function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0) { logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false }


        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
    // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
    // and replacing with the field name

    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess())
    {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0)
        {
            var asiField = asiFieldArray[0];
            if (asiField)
            {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);

                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess())
                {
                    logDebug("Successfully updated custom field on record: " + itemCap.getCustomID() + " on " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) //If no capId passed update the ASI Array
                        AInfo[itemName] = itemValue;
                }
                else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
            }
            else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}
function makePIN(length)
{
    var result = '';
    var characters = 'ABCDEFGHJKMNPQRTWXY2346789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function createChild(grp, typ, stype, cat, desc) // optional parent capId
{
    //
    // creates the new application and returns the capID object
    //

    var itemCap = capId
    if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args

    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
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

        var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
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
        /*capContactResult = aa.people.getCapContactByCapID(itemCap);
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
            }	*/

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
        logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
    }
}
function copyContactsByType(srcCapId, targetCapId, ContactTypeArr)
{
    //1. Get people with source CAPID.
    var capPeoples = getPeople3_0(srcCapId);
    if (capPeoples == null || capPeoples.length == 0)
    {
        return;
    }
    //2. Get people with target CAPID.
    var targetPeople = getPeople3_0(targetCapId);
    //3. Check to see which people is matched in both source and target.
    for (loopk in capPeoples)
    {
        sourcePeopleModel = capPeoples[loopk];
        //Check if contact type should be ignored
        doCopy = false;
        for (kk in ContactTypeArr)
        {
            if (ContactTypeArr[kk] == sourcePeopleModel.getCapContactModel().getContactType())
                doCopy = true;
        }
        if (doCopy)
        {
            //3.1 Set target CAPID to source people.
            sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
            targetPeopleModel = null;
            //3.2 Check to see if sourcePeople exist.
            if (targetPeople != null && targetPeople.length > 0)
            {
                for (loop2 in targetPeople)
                {
                    if (isMatchPeople3_0(sourcePeopleModel, targetPeople[loop2]))
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
                aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
                //3.3.2 Copy contact address from source to target.
                if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople())
                {
                    targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
                }
                //3.3.3 Edit People with source People information.
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
}
function getPeople3_0(capId)
{
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if (s_result.getSuccess())
    {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr != null || capPeopleArr.length > 0)
        {
            for (loopk in capPeopleArr)
            {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess())
                {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        }
        else
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
function copyLicensedProfByType(capIdFrom, capIdTo, typesArray)
{
    var n = aa.licenseProfessional.getLicensedProfessionalsByCapID(capIdFrom).getOutput();
    var isByType = typesArray != null && typesArray.length > 0;
    if (n != null)
        for (x in n)
        {
            if (isByType && !arrayContainsValue(typesArray, n[x].getLicenseType()))
            {
                continue;
            }//isByType
            n[x].setCapID(capIdTo);
            aa.licenseProfessional.createLicensedProfessional(n[x]);
        }//for all LPs
    else
        logDebug("No licensed professional on source");
    return true;
}
function arrayContainsValue(ary, value)
{
    if (ary != null)
    {
        //if not array, convert to array
        if (!Array.isArray(ary))
        {
            ary = [ary];
        }
        for (t in ary)
        {
            if (ary[t] == value)
            {
                return true;
            }
        }//for all types
    }
    return false;
}