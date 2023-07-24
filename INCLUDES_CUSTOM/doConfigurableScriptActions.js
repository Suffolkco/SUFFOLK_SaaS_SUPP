function doConfigurableScriptActions() {
	var module = "";

	if (appTypeArray && appTypeArray[0] != undefined) {
		module = appTypeArray[0];
	}

	if (typeof capId !== 'undefined' && capId) {
		if (module == "") {
			var itemCap = aa.cap.getCap(capId).getOutput();
			var itemCapModel = itemCap.getCapModel();
			module = itemCapModel.getModuleName();
		}
	}

	if (module != "") {
		rulesetName = "CONFIGURABLE_RULESET_" + module;
		rulesetName = rulesetName.toUpperCase();
		logDebug("rulesetName: " + rulesetName);

		try {
			var configRuleset = getScriptText(rulesetName);
			if (configRuleset == "") {
				logDebug("No JSON file exists for this module.");
			} else {
				var configJSON = JSON.parse(configRuleset);

				// match event, run appropriate configurable scripts
				settingsArray = [];
				if (configJSON[controlString]) {
					var ruleSetArray = configJSON[controlString];
					var scriptsToRun = ruleSetArray.StandardScripts;
					var customScriptsToRun = ruleSetArray.CustomScripts;
					var script;
					var validScript;

					for (var s in scriptsToRun) {

						if (exists(scriptsToRun[s], customScriptsToRun)) {
							logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s] + " Overridden in CustomScripts, Skipped.");
							continue;
						}

						logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s]);
						script = scriptsToRun[s];
						validScript = getScriptText(script);
						if (validScript != "") {
							logDebug("Script " + script + " exist and executed from Non-Master scripts");
							eval(validScript);
						} else {
							eval(getScriptText(script, null, true)); // now calling this section from master scripts
						}
					}
					for (var cs in customScriptsToRun) {
						logDebug("doConfigurableScriptActions customScriptsToRun[cs]: " + customScriptsToRun[cs]);
						script = customScriptsToRun[cs];
						validScript = getScriptText(script);
						if (validScript == "") {
							logDebug("Configurable custom script " + script + " does not exist.");
						} else {
							eval(validScript);
						}
					}
				}
			}
		} catch (err) {
			logDebug("ERROR: doConfigurableScriptActions " + rulesetName + " Error Message:" + err.message);
			handleError(err, "doConfigurableScriptActions " + rulesetName);
		}
	}
}