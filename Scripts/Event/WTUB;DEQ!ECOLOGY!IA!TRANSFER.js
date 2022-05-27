//WTUB:DEQ/ECOLOGY/IA/TRANSFER


if (wfTask == "Review form and check that documents are correct" && wfStatus == "Complete")
{
    var sampleResults = AInfo["Sample Results"];
    var phase = AInfo["Phase"];
    if (sampleResults == "CHECKED" && matches(phase, "", null, " ", undefined))
    {
        cancel = true;
        showMessage = true;
        comment("SELECT THE APPROPRIATE APPROVAL PHASE FOR THE SUBMITTED SAMPLE RESULT");
    }
}