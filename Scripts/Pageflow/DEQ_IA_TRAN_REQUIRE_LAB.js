//EHIMS2-50
//DEQ_IA_TRAN_REQUIRE_LAB
//Purpose: Required at least one row, if custom fields is checked 
//Author: Dpinzon

var samRes = AInfo["Sample Results"];

loadASITablesBefore();
if (samRes == "CHECKED") 
{
    if (typeof LABRESULTSANDFIELDDATA == "undefined" || LABRESULTSANDFIELDDATA.length == 0)
        {
        cancel = true;
        showMessage = true;
        comment("Please add at least one entry in table LAB RESULTS");
    }
    
}