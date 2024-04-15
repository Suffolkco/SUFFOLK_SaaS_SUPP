showDebug= true;
//cancel = true;
var cap = aa.env.getValue("CapModel");
//var capId = cap.getCapID();
// EHIMS2-295
var sd = getGISInfo_ASB("SUFFOLKCO_ACA","SanitationDistrictPolygon","SHORTNAME");
var ld = getGISInfo_ASB("SUFFOLKCO_ACA","LegislativeDistrict","NAME");
var p = getGISInfo_ASB("SUFFOLKCO_ACA","ReclaimWaterPolygon","PRIORITY");

logDebug("SD..." +sd);
logDebug("LD..." +ld);
logDebug("PRIO..." +p);

                  // Sewer District
                  /*editAppSpecific("Sewer District", getGISInfo_ASB("SUFFOLKCO_ACA","SanitationDistrictPolygon","SHORTNAME")); 

                  // Legislative District
                  editAppSpecific("Legislative District", getGISInfo_ASB("SUFFOLKCO_ACA","LegislativeDistrict","NAME")); 

                  // Priority Area 
                  editAppSpecific("Priority Area", getGISInfo_ASB("SUFFOLKCO_ACA","ReclaimWaterPolygon","PRIORITY")); 

					
					//EIHMS2 298

					if (AInfo["Catastrophic Failure"] == "Yes")
					  editAppSpecific("SCORE", 100); 
					if (AInfo["Non-Catastrophic"] == "Yes" && AInfo["Catastrophic Failure"] == "No")
					  editAppSpecific("SCORE", 90); 
					if (AInfo["Priority Area"] == "Priority 1" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 80); 
					if (AInfo["Priority Area"] == "Priority 2" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 70); 
					if (AInfo["Priority Area"] == "No Priority" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 60);*/

//aa.sendEmail("bhandhavya.nadagoud@scubeenterprise.com", "bhandhavya.nadagoud@scubeenterprise.com", "", "ASB debugObject Log", debug, null);



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
 
function getGISInfo_ASB(svc,layer,attributename)
{
	// use buffer info to get info on the current object by using distance 0
	// usage: 
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	//
	// to be used with ApplicationSubmitBefore only
	
	var distanceType = "feet";
	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
	{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
	}
	else
	{ logDebug("**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Parcel.  We'll only send the last value
	{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**ERROR: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
		{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
			{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
			}
		}
	}
	
	return retString
}