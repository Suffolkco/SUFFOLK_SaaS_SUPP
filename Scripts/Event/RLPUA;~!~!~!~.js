// Enter your script here...
logDebug("RLUPA....");

licModel = aa.env.getValue("LicenseModel");
licNumber = licModel.getStateLicense();
licType = licModel.getLicenseType();
logDebug(licNumber + ":" + licType);
refLicProf = new licenseProfObjectDCA(licNumber, licType);
refLicProf.updateAssociatedTransLPs();