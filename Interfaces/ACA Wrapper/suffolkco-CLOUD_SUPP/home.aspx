<!--*** Language declaration goes ***-->

<%@ Page Language="C#" AutoEventWireup="true" ValidateRequest="false" %>

<!--*** Language declaration end ***-->

<%@ Import Namespace="Accela.ACA.Web" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<script language="CS" runat="server"> 
		void Page_Load(object sender, System.EventArgs e)  
		{      
		   //base.Page_Load(sender, e);
		   
		    string currentURL = Accela.ACA.Web.Common.AppSession.CurrentURL;
			string tmpCurrentURL = Request.Params["CurrentURL"];

			// Only support internal url with the same domain
			if (!string.IsNullOrEmpty(tmpCurrentURL) && !Accela.ACA.Web.Common.FileUtil.IsExternalUrl(tmpCurrentURL))
			{
				Response.Redirect(tmpCurrentURL);
			}
			else{
				Response.Redirect(currentURL);
			}
		} 
	</script>
</head>
<body>

		
</body>
</html>

