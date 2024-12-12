SST Blazor Server Web App developed in Visual Studio 2019:
1. Environment:
  a) In Visual Studio Dev Env., to change environment, update SST.Web\Properties\launchSettings.json:
     ASPNETCORE_ENVIRONMENT": 
     "AzProd", "AzSupp", "AzTest".
     The values map to the file names appsettings.{envName}.json.
     launchSettings.json is not deployed to IIS. It's for local Development only.

  b) In IIS server environment, web.config contains the environment info, eg.
       <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="AzSupp" />
     On IIS server, we can simply edit web.config to switch the environment for quick test.
     But the proper way is to update the publish profile(.pubxml) which controls web.config.

  c) Publish profiles: in tag <PublishUrl> and <EnvironmentName>:
     FolderProfileAzSupp:  = AzSupp
     FolderProfileAzTest:  = AzTest
     FolderProfileAzProd:  = AzProd


2. Three log files:
   nlog-own-2020-12-06.log
   nlog-all-2020-12-06.log
   internal-nlog.txt

   nlog.config: Log file location is hard coded for now. Facing issue writting them in IIS folder.
     C:\Logs\SST\*.log


3. In case of system maintaince, switch Index.razor with PortalDown.razor:
   a) In Index.razor, change line 1 to @page "/searchhide".
   b) In PortalDown.razor, change to @page "/home".
   c) Repubulish.
      

