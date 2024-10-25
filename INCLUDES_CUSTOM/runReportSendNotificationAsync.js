function runReportSendNotificationAsync(capId, from, to, cc, emailTemplate, emailParams, reportData) {
      
	var script = 'runReportSendNotificationAsync';
	var envParams = aa.util.newHashMap();
	envParams.put('capId', capId);
	abc.debug('capId ' + capId);
	envParams.put('from', from);
	abc.debug('from ' + from);
	if (to && to.length > 0) {
		envParams.put('to', to);
	}

	abc.debug('to ' + to);
	if (cc) {
		envParams.put('cc', cc);
	}

	abc.debug('cc ' + cc);
	envParams.put('emailTemplate', emailTemplate);
	abc.debug('emailTemplate ' + emailTemplate);
	envParams.put('emailParams', emailParams);
	abc.debug('emailParams ' + emailParams);
	envParams.put('reportData', reportData);
	abc.debug('reportDate ' + reportData);

	abc.debug('running async script ' + script);
	aa.runAsyncScript(script, envParams);
}