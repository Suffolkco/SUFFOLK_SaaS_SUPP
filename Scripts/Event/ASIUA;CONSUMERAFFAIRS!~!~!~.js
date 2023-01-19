// /ASIUA:
// This is to update renewal expiration date to match the custom field expiration date.
var showDebug = true;
try
{
	var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString(); 

	cap = aa.cap.getCap(capId).getOutput();	
	if (cap) 
	{
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		logDebug("Record Type: " + appTypeString);     

		if((appTypeArray[0] == "ConsumerAffairs" && appTypeArray[1] == "Licenses" && appTypeArray[3] == "NA") ||
		(appTypeArray[0] == "ConsumerAffairs" && appTypeArray[1] == "ID Cards" && appTypeArray[3] == "NA") ||
		(appTypeArray[0] == "ConsumerAffairs" && appTypeArray[1] == "Registrations" && appTypeArray[3] == "NA")) 
		{			    
			var customFieldExpDate = getAppSpecific("Expiration Date")
			
			logDebug("customFieldExpDate: " + customFieldExpDate);     
			
			if (customFieldExpDate && customFieldExpDate != "")
			{
				var b1ExpResult = aa.expiration.getLicensesByCapID(capId);

				if (b1ExpResult.getSuccess())
				{
					b1Exp = b1ExpResult.getOutput();
				
					var curExp = b1Exp.getExpDate();
					if (curExp != null)
					{
						
						dateMMDDYYY = customFieldExpDate;						
						dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);


						dateCheckString = String(customFieldExpDate).split("/")
        				var dateToCheck = (String('0' + dateCheckString[0]).slice(-2) + '/' + String('0' + dateCheckString[1]).slice(-2) + '/' + dateCheckString[2]);

						var dd = String('0' + dateCheckString[0]).slice(-2) ;
						var mm = String('0' + dateCheckString[1]).slice(-2);
						var yyyy = dateCheckString[2];
				
						logDebug("Format Date:"+ dd + ", " + mm + "," + yyyy);

						if(dd<10) 
						{
							dd='0'+dd;
						} 
				
						if(mm<10) 
						{
							mm='0'+mm;
						} 
				
						var correctFormatExpDate = mm+'/'+ dd +'/'+ yyyy;

						logDebug("New Format Date:"+ correctFormatExpDate);
						editAppSpecific("Expiration Date", correctFormatExpDate);
						logDebug("Set Expiration date ASI to : " + correctFormatExpDate);

						b1Exp.setExpDate(dateMMDDYYY);			
						aa.expiration.editB1Expiration(b1Exp.getB1Expiration());					
						logDebug(capId.getCustomID() + ": Updated renewal expiration date to " + customFieldExpDate);
					}
					
				}
			}
		}
	}
}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}


