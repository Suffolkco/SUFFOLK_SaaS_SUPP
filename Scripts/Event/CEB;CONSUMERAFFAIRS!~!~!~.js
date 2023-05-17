showMessage=true;
showDebug=true;

(!publicUser)
{    

    if (matches(appTypeArray[1], "Licenses") || matches(appTypeArray[1], "ID Cards") || matches(appTypeArray[1], "Registration"))     
    {
        logDebug(contact.contactType );

        if (contact.contactType  == 'Vendor')
        {
            // Vendor address
            var vAddrLine1 = contact.addressLine1;       
            var vCity = contact.city;
            var vState = contact.state;
            var vZip = contact.zip;
                    
            logDebug(vAddrLine1 + ", " + vCity + ", " + vState + ", " + vZip);

            // Record Address
            var capAddrResult = aa.address.getAddressByCapId(capId);
            var addressToUse = null;

            if (capAddrResult.getSuccess())
            {
                var addresses = capAddrResult.getOutput();
                if (addresses)
                {
                    for (zz in addresses)
                    {
                        capAddress = addresses[zz];
                        if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                            addressToUse = capAddress;
                    }
                    if (addressToUse == null)
                        addressToUse = addresses[0];

                    if (addressToUse)
                    {                                    
                        var newAddr1 = addressToUse.getAddressLine1();                                  
                        var newStreeName = addressToUse.getStreetName();                                                  
                        var newCity = addressToUse.getCity();                                 
                        var newState = addressToUse.getState();                                   
                        var newZip = addressToUse.getZip();
                               
                     
                        logDebug("Vendor Address Line 1: " + vAddrLine1 + " | Loc: " + newAddr1);
                        logDebug("Vendor Street Name: " + vAddrLine1 + " | Loc: " + newStreeName);
                        logDebug("Vendor City: " + vCity + " | Loc: " + newCity);
                        logDebug("Vendor State: " + vState + " | Loc: " + newState);
                        logDebug("Vendor Zip: " + vZip + " | Loc: " + newZip);

                                                
                        if (vAddrLine1 != newAddr1 || newStreeName != vAddrLine1 || vCity != newCity || vState !== newState || vState != newZip)                                
                        {        

                            addressToUse.setAddressLine1(vAddrLine1);
                            addressToUse.setStreetName(vAddrLine1);
                            addressToUse.setCity(vCity);
                            addressToUse.setState(vState);
                            addressToUse.setZip(vZip);                            
                            updateResult = aa.address.editAddress(addressToUse);

                            if (updateResult.getSuccess()) {
                                logDebug("Copy vendor address successfully to Address.");
                            }
                            else {
                                logDebug("Error updating address: " + updateResult.getErrorMessage());
                            }

                            //createNewAddress(vAddress);   
                            
                        }
                    }
                }
            }            
    }        
                

    }
}

