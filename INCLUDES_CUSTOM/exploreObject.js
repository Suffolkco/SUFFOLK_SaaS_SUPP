function exploreObject(objExplore) {
    logDebug("Methods:");
    for (var x in objExplore) {
        if (typeof (objExplore[x]) === "function") {
            logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
            logDebug("   " + objExplore[x] + "<br>");
        }
        var counter = objExplore.length;
    }

    logDebug("");
    logDebug("Properties:");
    for (var y in objExplore) {
        if (typeof (objExplore[y]) !== "function") {
            logDebug("  <b> " + y + ": </b> " + objExplore[y]);
        }
    }
}
