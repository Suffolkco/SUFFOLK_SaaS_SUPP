<!--*** Language declaration goes ***-->

<%@ Page Language="C#" AutoEventWireup="true" ValidateRequest="false" %>

<!--*** Language declaration end ***-->

<%@ Import Namespace="Accela.ACA.Web" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head id="Head1">
    <title>City of Metropolis - Citizen Portal
    </title>

    <%= Accela.ACA.Common.Util.AccessibilityUtil.AccessibilityEnabled ? "<link rel='stylesheet' type='text/css' href='App_Themes/Accessibility/AccessibilityDefault.css' />" : ""%>
    <%--  <link type="text/css" rel="stylesheet" href="<%=FileUtil.CustomizeFolderRootWithoutLang %>stylesheet.css" />--%>
    <link type="text/css" rel="Stylesheet" href="<%=FileUtil.AppendApplicationRoot("Customize/font.css")%>" />
    <link rel="stylesheet" type="text/css" href="<%=FileUtil.AppendApplicationRoot("css/main.css")%>" />
    <%= FileUtil.IsCustomizeStyleExisting("stylesheet.css") ? "<link rel='stylesheet' type='text/css' href='" + FileUtil.CustomizeFolderRoot + "stylesheet.css' />" : ""%>
    <%= Accela.ACA.Common.Util.AccessibilityUtil.AccessibilityEnabled ? "<link rel='stylesheet' type='text/css' href='App_Themes/Accessibility/Accessibility.css' />" : ""%>

     <script type="text/JavaScript" language="JavaScript">        
         function MM_preloadImages() {}
      </script>
</head>
<body style="width: 100%; margin: 0 auto;"
    onload="MM_preloadImages('<%=FileUtil.CustomizeFolderRootWithoutLang %>images/nav_business-over.gif','<%=FileUtil.CustomizeFolderRootWithoutLang %>images/nav_residents-over.gif','<%=FileUtil.CustomizeFolderRootWithoutLang %>images/nav_visitors-over.gif','<%=FileUtil.CustomizeFolderRootWithoutLang %>images/button_search-over.gif','<%=FileUtil.CustomizeFolderRootWithoutLang %>images/nav_home-over.gif','<%=FileUtil.CustomizeFolderRootWithoutLang %>images/nav_government-over.gif')">
    <form runat="server" id="theForm">
        <!--Section 508 Support goes-->
        <script type="text/javascript" src="<%=FileUtil.AppendApplicationRoot("Scripts/lib/jquery/dist/jquery.min.js")%>"></script>
        <script type="text/javascript" src="<%=FileUtil.AppendApplicationRoot("Scripts/aca.jquery.etxensions.js")%>"></script>
        <script type="text/javascript" src="<%=FileUtil.AppendApplicationRoot("Scripts/GlobalConst.aspx")%>"></script>
        <script type="text/javascript" src="<%=FileUtil.AppendApplicationRoot("Scripts/global.js")%>"></script>
        <script type="text/javascript" src="<%=FileUtil.AppendApplicationRoot("Scripts/dialog.js")%>"></script>
        <script type="text/JavaScript" language="JavaScript">
            <!--
            function skipTo(iframeID) {
                var expectedArgLength = skipTo.length;
                var oIframe = null;
                var oDoc = document;

                if (iframeID) {
                    oIframe = window.frames[iframeID] ? window.frames[iframeID] : document.getElementById(iframeID);
                    oDoc = oIframe ? oIframe.document || oIframe.contentDocument : null;
                }
                else {
                    oIframe = window;
                    oDoc = window.document;
                }

                var oAnchor = null;
                if (oDoc && arguments.length > expectedArgLength) {
                    for (i = expectedArgLength; i < arguments.length; i++) {
                        oAnchor = oDoc.getElementById(arguments[i]);
                        if (oAnchor != null) {
                            break;
                        }
                    }
                }

                var originalNeedAsk = oIframe && oIframe.NeedAsk ? oIframe.NeedAsk : null;
                if (originalNeedAsk != null) {
                    oIframe.SetNotAsk(false);
                }
                if (oAnchor) {
                    oAnchor.scrollIntoView();
                    oAnchor.focus();
                }
                if (originalNeedAsk != null) {
                    oIframe.SetNotAsk(originalNeedAsk);
                }
            }

            function skipToBeginningOfACA() {
                skipTo("ACAFrame", "ctl00_hlSkipToolBar", "SecondAnchorInACAMainContent");
            }

            function skipToMainContent() {
                skipTo("ACAFrame", "SecondAnchorInACAMainContent", "FirstAnchorInACAMainContent");
            }
        </script>

        <script runat="server">
    
            /// <summary>
            /// Get the current url from AppSession or URL paramter
            /// </summary>
            public string CurrentURL
            {
                get
                {
                    string currentURL = Accela.ACA.Web.Common.AppSession.CurrentURL;
                    string tmpCurrentURL = Request.Params["CurrentURL"];

                    // Only support internal url with the same domain
                    if (!string.IsNullOrEmpty(tmpCurrentURL) && !Accela.ACA.Web.Common.FileUtil.IsExternalUrl(tmpCurrentURL))
                    {
                        string bridgeViewPage = ConfigurationManager.AppSettings["DefaultPageFile"];

                        // The special url paramter CurrentURL is only supported on the default page or bridgeview page.             
                        if (Request.Url.AbsolutePath.IndexOf("Default.aspx", StringComparison.InvariantCultureIgnoreCase) >= 0
                            || (!string.IsNullOrEmpty(bridgeViewPage)
                                && Request.Url.AbsolutePath.IndexOf(bridgeViewPage, StringComparison.InvariantCultureIgnoreCase) >= 0))
                        {
                            currentURL = tmpCurrentURL;
                        }
                    }

                    return currentURL;
                }
            }
        </script>
        <!--Section 508 Support end-->


        <div class="header">
            <div class="container">
                <div class="logo"></div>
                <div class="contact">
                    <h2>Welcome to City of Metropolis !!</h2>
                    <span>Helpline<b> (888) 722-2352</b></span>
                </div>
                <div class="return">
                    <a href="http://www.cityofmetropolis.com/">Return to City of Metropolis</a>
                </div>
            </div>
        </div>
        <div class="aca">

            <table role="presentation">
                <tbody>
                    <tr>
                        <td style="background-color: #ffffff; vertical-align: top;">
                            <table role="presentation">
                                <tbody>
                                    <tr>
                                        <td style="vertical-align: top;">
                                            <table cellspacing="0" cellpadding="0" border="0" role="presentation">
                                                <tbody>

                                                    <tr>
                                                        <td valign="top">
                                                            <!-- **** ACA iframe goes here ****-->
                                                            <iframe id="ACAFrame" name="ACAFrame" height="1200" style="overflow-y: auto; width: 960px;" scrolling="no" frameborder="0" marginwidth="15" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" oallowfullscreen="true" msallowfullscreen="true" title="<%=LabelUtil.GetGlobalTextByKey("iframe_bridgeview_title") %>"
                                                                src='<%=CurrentURL%>'><%=String.Format(LabelUtil.GetGlobalTextByKey("iframe_nonsupport_message"), CurrentURL)%></iframe>
                                                            <!-- **** ACA iframe end ****-->
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <img style="width: 50.2em;" height="24" alt="" src="<%=FileUtil.CustomizeFolderRootWithoutLang %>images/spacer.gif" /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="footer">
            <table role="presentation" style="margin: 0 auto;">
                <tbody>
                    <tr>
                        <td>
                            <p style="text-align: center">
                                <%=DateTime.Now.Year%> City of Metropolis All rights reserved.
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <input type="submit" name="Submit" value="Submit" style="display: none; z-index: -1;" />
    </form>
</body>
</html>

