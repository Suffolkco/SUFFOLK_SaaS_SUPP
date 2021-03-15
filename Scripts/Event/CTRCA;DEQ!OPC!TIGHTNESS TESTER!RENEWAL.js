//CTRCA:DEQ/OPC/TIGHTNESS TESTER/RENEWAL
var feeCount = 0;
var methArray = [];

if (!publicUser)
{
    var testMethods = loadASITable("TEST METHODS", capId);
    if (testMethods.length >= 1)
    {
        for(var x = 0; x < testMethods.length; x++)
        { 
            var testMeth = testMethods[x]["Test Method"]; 
            var methArrayStr = methArray.toString();
            var index = methArrayStr.indexOf(testMeth.toString());
            if (index == -1)
            {
                methArray.push(testMeth);
                logDebug("Adding 1 to feeCount");
                feeCount++;
            }   
        }
        if (feeCount >= 1)
        {
            logDebug("TEST METHODS has " + feeCount + " unique test methods");
            updateFee("DEQ_TTC_TTI", "DEQ_TTC_TTI", "FINAL", feeCount, "Y");
        }
    }
}