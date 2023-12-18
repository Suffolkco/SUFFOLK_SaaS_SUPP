<%@ WebHandler Language="C#" Class="Handler" %>
using System;
using System.Linq;
using System.Web;
using System.Text;
using System.Net;
using System.IO;
using System.Xml.Linq;
using Accela.ACA.UI.Model;
using System.Collections.Generic;
using Accela.ACA.BLL.Account;
using Accela.ACA.WSProxy;
using Accela.ACA.Web.Util;
using System.Web.Configuration;
using System.Web.Script.Serialization;
using System.Diagnostics;
using System.Configuration;

public class Handler : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        Dictionary<string, string> inputDict = new Dictionary<string, string>();
        inputDict["AltId"] = context.Request.QueryString["AltId"];
        inputDict["InspId"] = context.Request.QueryString["InspId"];

        var serializer = new JavaScriptSerializer();
        var emseScriptInput = serializer.Serialize(inputDict);


        var webServiceConfig = XDocument.Load(AppDomain.CurrentDomain.SetupInformation.ConfigurationFile).Root.Element("webServiceConfiguration");

        var wsUrl = (string)webServiceConfig.Element("webSites").Elements("webSite").Where(x => (string)x.Attribute("name") == "wsServer01").Single().Attribute("url");
        Uri urlObj = new Uri(wsUrl);
        var bizServer = urlObj.GetLeftPart(UriPartial.Authority).ToString();

        var user = (Accela.ACA.BLL.Account.User)context.Session["SESSION_USER"];
        var token = user.UserToken;
        if (string.IsNullOrEmpty(token))
        {
            Dictionary<string, string> authDict = new Dictionary<string, string>();
            authDict["agency"] = ConfigurationManager.AppSettings["ServProvCode"];
            authDict["userId"] = "INSPACA";
            authDict["password"] = "Accela2023!!!";
            var authBody = serializer.Serialize(authDict);
            var authUrl = bizServer + "/apis/agency/auth";
            var authRes = SendWebRequest(authUrl, "POST", authBody);
            token = authRes["result"];
        }

        var url = "/apis/v4/scripts/ACA_GET_INSP_DOC?token=" + token;
        url = bizServer + url;

        var response = SendWebRequest(url, "POST", emseScriptInput);

        context.Response.Clear();
        if (Convert.ToBoolean(response["result"]["documentFound"]))
        {
            string base64Content = response["result"]["base64"];
            byte[] bytes = System.Convert.FromBase64String(base64Content);
            context.Response.AddHeader("content-disposition", "attachment;filename=" + response["result"]["fileName"] + ".pdf");
            context.Response.ContentType = "application/pdf";
            context.Response.BinaryWrite(bytes);
            context.Response.Flush();
        }
        else
        {
            context.Response.Write("<script type='text/javascript'>alert('No documents were found for inspection " + inputDict["InspId"] + " !');window.close();</script>");
        }
        HttpContext.Current.Response.End();
    }

    public static dynamic SendWebRequest(string url, string method, string body)
    {
        var data = new byte[0];
        if (method.ToUpper().Equals("POST") || method.ToUpper().Equals("PUT"))
        {
            data = Encoding.UTF8.GetBytes(body);
        }

        return SendWebRequest(url, method, data);
    }

    public static dynamic SendWebRequest(string url, string method, byte[] data = null)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new ArgumentException("Request URL is required");
        }

        if (string.IsNullOrWhiteSpace(method))
        {
            throw new ArgumentException("Request Method is required");
        }

        if (data == null)
        {
            data = new byte[0];
        }

        if (method.ToUpper().Equals("POST") || method.ToUpper().Equals("PUT"))
        {
            if (data.Length == 0)
            {
                throw new ArgumentException("Request Body is required");
            }
        }

        string responseString = "";
        try
        {
            var requestUri = new Uri(url);
            var request = (HttpWebRequest)WebRequest.Create(requestUri);
            if (request == null)
            {
                throw new Exception("Request is null");
            }
            request.Method = method;
            request.ContentType = "application/json";
            request.AllowAutoRedirect = false;
            request.Timeout = 180000;
            var proxy = WebConfigurationManager.AppSettings["proxy"];
            if (proxy != null && proxy.Length > 0)
            {
                var webproxy = new WebProxy(proxy);
                request.Proxy = webproxy;
            }

            if (method.ToUpper().Equals("POST") || method.ToUpper().Equals("PUT"))
            {
                request.ContentLength = data.Length;

                using (var stream = request.GetRequestStream())
                {
                    stream.Write(data, 0, data.Length);
                }
            }

            var response = (HttpWebResponse)GetResponseWithoutException(request);

            using (var stream = response.GetResponseStream())
            {
                if (stream == null)
                {
                    throw new Exception("", new Exception(method + " request to " + url + " didn't return a response"));
                }
                var reader = new StreamReader(stream, Encoding.UTF8);
                responseString = reader.ReadToEnd();
            }
        }
        catch (Exception e)
        {
            var st = new StackTrace(e, true);
            // Get the top stack frame
            var frame = st.GetFrame(0);
            // Get the line number from the stack frame
            var line = frame.GetFileLineNumber();
            throw new Exception("An exception occured while trying to send a " + method + " request to " + url + ". Exception: " + e.Message + " at " + line);
        }

        if (string.IsNullOrEmpty(responseString))
        {
            throw new Exception("", new Exception(method + " request to " + url + " didn't return a response"));
        }

        var serializer = new JavaScriptSerializer();
        dynamic output;
        try
        {
            // in case we fail to parse the json return an error
            output = serializer.Deserialize<object>(responseString);
        }
        catch (Exception e)
        {
            throw new Exception("", new Exception(method + " request to " + url + " returned invalid JSON. Exception: " + e.Message));
        }

        if (output.ContainsKey("status"))
        {
            var status = output["status"];

            if (status != 200)
            {
                var errorMessage =
                    "An error occured while trying to send a " + method + " request to " + url + ". Status: " + status +
                     ", error code: " + (output.ContainsKey("code") ? output["code"] : "Not Specified") +
                     ", message: " + (output.ContainsKey("message") ? output["message"] : "Not Specified");
                throw new Exception(output.ContainsKey("message") ? output["message"] : "", new Exception(errorMessage));
            }
        }
        return output;
    }

    public static WebResponse GetResponseWithoutException(WebRequest request)
    {
        try
        {
            return request.GetResponse();
        }
        catch (WebException e)
        {
            if (e.Response == null)
            {
                throw;
            }
            return e.Response;
        }
    }


    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
