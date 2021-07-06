// ASA;CONSUMERAFFAIRS!TLC!RENEWAL!NA
showDebug = true;

logDebug ("parent capid is: " + parentCapId);

if (getParents('ConsumerAffairs/TLC/Drivers/New'))
{
    updateFee('TLC_DRIVER', 'TLC_DRIVER', 'FINAL', 1, 'N');
}
if (getParents('ConsumerAffairs/TLC/Vehicles/New'))
{
    updateFee('TLC_RENEW_VEHICLE', 'TLC_RENEW_V', 'FINAL', 1, 'N');
}