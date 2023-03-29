//WTUB:DEQ/ECOLOGY/IA/TRANSFER


if (wfTask == "Document Review" && wfStatus == "Complete")
{
    var sampleResults = AInfo["Sample Results"];
    var phase = AInfo["Phase"];
    if (sampleResults == "CHECKED" && matches(phase, "", null, " ", undefined))
    {
        cancel = true;
        showMessage = true;
        comment("SELECT THE APPROPRIATE APPROVAL PHASE FOR THE SUBMITTED SAMPLE RESULT");
    }

    var iaRecNum = AInfo["IA Record Number"];

    if (matches(iaRecNum, "", null, undefined))
    {
        cancel = true;
        showMessage = true;
        comment("Enter IA Record Number.");
    }
}