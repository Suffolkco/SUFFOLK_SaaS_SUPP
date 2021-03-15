//ASA:DEQ/WR/PRIVATE WELL REQUEST/APPLICATION

var typeReq = AInfo["Type of Request"];
var appMul = AInfo["Application for Multiple Wells"];
var howMan = AInfo["How Many Wells"];
var testPriv = AInfo["Test as Private"];
var feeEx = AInfo["Fee Exempt"];

if (feeEx == "No" || feeEx == null)
{
     if (appMul != null)
    {
        if (appMul.equals("No"))
        {
            if (typeReq.equals("Private"))
            {
                updateFee("PRIV", "DEQ_PWR", "FINAL", 1, "Y");
            }
            if (typeReq.equals("C.O."))
            {
                updateFee("CO", "DEQ_PWR", "FINAL", 1, "Y");
            }
            if ((typeReq.equals("Test")) && (testPriv == null || testPriv.equals("UNCHECKED")))
            {
                updateFee("TEST", "DEQ_PWR", "FINAL", 1, "Y");
            }
            if (testPriv != null)
            {
                if (testPriv.equals("CHECKED"))
                {
                    updateFee("TESTPR", "DEQ_PWR", "FINAL", 1, "Y");
                }
            }
        }
        else
        {
            if (typeReq.equals("Private"))
            {
                updateFee("PRIV", "DEQ_PWR", "FINAL", parseInt(howMan), "Y");
            }
            if (typeReq.equals("C.O."))
            {
                updateFee("CO", "DEQ_PWR", "FINAL", parseInt(howMan), "Y");
            }
            if ((typeReq.equals("Test")) && (testPriv == null || testPriv.equals("UNCHECKED")))
            {
                updateFee("TEST", "DEQ_PWR", "FINAL", parseInt(howMan), "Y");
            }
            if (testPriv != null)
            {
                if (testPriv.equals("CHECKED"))
                {
                    updateFee("TESTPR", "DEQ_PWR", "FINAL", parseInt(howMan), "Y");
                }
            }
        }
    }
}
