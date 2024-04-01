//ASA:DEQ/WWM/RESIDENCE/APPLICATION

var methWat = AInfo["Method of Water Supply"];
var methSew = AInfo["Method of Sewage Disposal"];
var feeEx = AInfo["Fee Exempt"];
var countyState = AInfo["Is this application part of the County/State I/A OWTS SIP grant/loan program?"]

//if (countyState == "No" || countyState == null)
//{
	if (feeEx == "No" || feeEx == null )
	{
		if (methSew.equals("Public Sewers")  ||
		methSew.equals("Construct an STP") ||
		methSew.equals("Existing STP"))
		{
			updateFee("RES-PW-PS", "DEQ_SFR", "FINAL", 1, "Y");
		}
		else
		{
			updateFee("RES-PW-PS", "DEQ_SFR", "FINAL", 0, "Y");
		}
		if (methWat.equals("Private Well"))
		{
			updateFee("RES-WELL-OWT", "DEQ_SFR", "FINAL", 1, "Y");
			
			if (feeExists("RES-PW-OWTS"))
			{
				updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 0, "Y");
			}
		}
		else if (methWat.equals("Public Water"))
		{
			if (feeExists("RES-WELL-OWT"))
			{
				updateFee("RES-WELL-OWT", "DEQ_SFR", "FINAL", 0, "Y");
			}
			if (methSew.equals("Conventional Septic System") || methSew.equals("I/A System"))
			{
				updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 1, "Y");
				
			}
			else
			{
				updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 0, "Y");
			}
		} 
		else 
		{
			logDebug("No Fee.");
		}
	}
//}
removeBORFees(capId);

// Add BOR fee if the custom field is set to Yes by public user
if (publicUser)
{
	/*var bor = AInfo["Are you applying for a Board of Review (BOR) hearing at this time? If yes, submit form WWM-061"];	
	removeBORFees(capId);

	if (bor == 'Yes')
	{
	    addFee("BOR", "DEQ_SFR", "FINAL", 1, "Y")
	}*/
	var borDocCheck = determineACADocumentAttached("Board of Review Application");    
    
    if(borDocCheck)
    {       
		addFee("BOR", "DEQ_SFR", "FINAL", 1, "Y");
	}

}

var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
if(capmodel.isCompleteCap() && capmodel.getCreatedByACA() == "N")
{
	var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
	if (b1ExpResult.getSuccess())
	{
		b1Exp = b1ExpResult.getOutput();
		var todaysDate = new Date();
		var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
		//logDebug("This is the current month: " + todaysDate.getMonth());
		//logDebug("This is the current day: " + todaysDate.getDate());
		//logDebug("This is the current year: " + todaysDate.getFullYear());
		b1Exp = b1ExpResult.getOutput();
		var dateAdd = addDays(todDateCon, 2190);
		var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

		dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
		b1Exp.setExpDate(dateMMDDYYY);
		b1Exp.setExpStatus("Pending");
		aa.expiration.editB1Expiration(b1Exp.getB1Expiration());      
	}
}

//Populate G rerocd and WWM Record
if(!publicUser)
{

 var parcelNumber= getFirstParcelFromCapId(capId);
					 var latestRecordID = checkForRelatedSIPRecord(parcelNumber);
aa.print(latestRecordID);
if(latestRecordID !=null)
{

var ssrecord= getAppSpecific("SIP Ref #",capId);
if(ssrecord !=null)
					editAppSpecific("SIP Ref #", latestRecordID);
var getCapResult = aa.cap.getCapID(latestRecordID);
if (getCapResult.getSuccess())
{
    var RRecord = getCapResult.getOutput();
  if (appMatch("DEQ/Ecology/SIP/Application", RRecord))
{
var wrecord= getAppSpecific("WWM Ref #",capId);
if(wrecord != null)
editAppSpecific("WWM Ref #",capId.getCustomID(),RRecord);
}
}
}

}

function checkForRelatedSIPRecord(parcelNumber) {
		
		var listOfRelatedRecorsdFromParcel = capIdsGetByParcel(parcelNumber);
		var sipRecord = new Array();
		var resArray = new Array();
	

    for (record in listOfRelatedRecorsdFromParcel) 
	{

        var itemCap = listOfRelatedRecorsdFromParcel[record];
//aa.print(itemCap);
        var itemCapType = aa.cap.getCap(itemCap).getOutput().getCapType().toString();
        //aa.print("We found this record: " + itemCap.getCustomID() + " which is a: " + itemCapType);
        if (itemCapType == "DEQ/Ecology/SIP/Application")
		{
aa.print(itemCap);
           sipRecord.push(itemCap);
        }
    }
	for( i in sipRecord)
	{

		var altId= sipRecord[i].getCustomID();

		//aa.print(altId);
					
					var ddate =   aa.cap.getCap(capId).getOutput().getFileDate();
					scheduledDate = dateFormatted(ddate.getMonth(), ddate.getDayOfMonth(), ddate.getYear(), "MM/DD/YYYY");

					var tempArr = new Array();
					tempArr['altId'] = sipRecord[i].getCustomID();
					tempArr['date'] = convertDate(ddate);
					resArray.push(tempArr);
					break;
           
                
			
	}

			resArray.sort(function(a,b){
			  // Turn your strings into dates, and then subtract them
			  // to get a value that is either negative, positive, or zero.
			  return new Date(b.date) - new Date(a.date);
			});
if(resArray[0] != undefined)
			return resArray[0].altId;

	}





function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}

  
  function getFirstParcelFromCapId(capId)
{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
							if (capParcelResult.getSuccess())
							{
								var Parcels = capParcelResult.getOutput().toArray();
							}

							for ( i in Parcels)
							{
							var parcelNumber = Parcels[0].getParcelNumber();
							}

		return parcelNumber;
}

function determineACADocumentAttached(docType) 
{
    var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            logDebug("here");
            return false;
        }
        else 
		{
            attach = false;
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
				//debugObject(doc);
                docCat = doc.getDocCategory();
                if (docCat.equals(docType)) 
				{
                    attach = true;
                }
            }
            if (attach) 
			{
                return true;
            }
            else 
			{
                return false;
            }
        }
    }
    else 
	{
        return false;
    }
}

function removeBORFees(itemCap) 
{
	getFeeResult = aa.fee.getFeeItems(itemCap, null, "NEW");
	if (getFeeResult.getSuccess()) 
	{
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList) 
		{
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) 
			{
				
				if (feeList[feeNum].getFeeCod() == "BOR")
				{
					var feeSeq = feeList[feeNum].getFeeSeqNbr();
					var editResult = aa.finance.removeFeeItem(itemCap, feeSeq);
					if (editResult.getSuccess()) {
						logDebug("Removed existing Fee Item: " + feeList[feeNum].getFeeCod());
					} else {
						logDebug("**ERROR: removing fee item (" + feeList[feeNum].getFeeCod() + "): " + editResult.getErrorMessage());
						break
					}
				}
				
			}
			
		}
	} 
	else {
		logDebug("**ERROR: getting fee items (" + feeList[feeNum].getFeeCod() + "): " + getFeeResult.getErrorMessage())
	}

} 

function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
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
