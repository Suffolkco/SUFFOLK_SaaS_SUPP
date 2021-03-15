function splitByDashes(ASI_Name, label, code, capId)
{
    var variable = getAppSpecific(ASI_Name, capId);
    if (variable != null)
    {
        var varSplit = variable.split("-");
        var secondvalue = "";
        for(counter = 1; counter < varSplit.length; counter++)
        {
            var firstValue = varSplit[0];
            //logDebug("The first value is: " + firstValue + " counter is: " + counter);
            if (counter < (varSplit.length -1))
            {
                secondvalue +=  varSplit[counter]  + "-";
                //logDebug("Second Value: " + secondvalue + " counter is: " + counter);
            }
            else
            {
                secondvalue +=  varSplit[counter];
                //logDebug("Second Value in Final: " + secondvalue + " counter is: " + counter);
            }
        }
        firstValue = String(firstValue);
        editAppSpecific(label, secondvalue, capId);
        editAppSpecific(code, firstValue, capId);
    }
}
