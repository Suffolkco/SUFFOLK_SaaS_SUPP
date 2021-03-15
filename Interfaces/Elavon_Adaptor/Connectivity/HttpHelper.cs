using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Net;
using System.Net.Http;
using Newtonsoft.Json;
using log4net;
using Elavon_Adaptor.DataObjects;


namespace Elavon_Adaptor.Connectivity {
    public class HttpHelper {


        public static string SendTokenPostRequest(string url, List<KeyValuePair<string, string>> reqParams, ILog log) {

            HttpClient client = new HttpClient();


            string content = JsonConvert.SerializeObject(reqParams, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore });
            log.DebugFormat("Content sent to Converge {0} at URL {1}", content, url);
            HttpResponseMessage resp = client.PostAsync(url, new StringContent(content, Encoding.UTF8, "application/json")).Result;
            if (resp.IsSuccessStatusCode) {
                string respString = resp.Content.ReadAsStringAsync().Result;
                return respString;
            }
            return String.Empty;
        }

        public static string SendTokenPostRequest(string url, ConvergeTokenRequest request, ILog log) {

            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));//ACCEPT header

            string content = JsonConvert.SerializeObject(request, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore, DefaultValueHandling = DefaultValueHandling.Ignore });
            log.DebugFormat("Content sent to Converge {0} at URL {1}", content, url);
            System.Net.Http.Headers.HttpRequestHeaders reqHeaders = client.DefaultRequestHeaders;
            List<KeyValuePair<string, IEnumerable<string>>> headerList = reqHeaders.ToList();
            foreach (KeyValuePair<string, IEnumerable<string>> header in headerList) {
                string[] values = header.Value.ToArray();
                string valueStr = String.Empty;
                foreach (string val in values)
                    valueStr += val + ",";
                log.DebugFormat("Request Header {0} : {1}", header.Key, valueStr);
            }
            HttpRequestMessage httpRequest = new HttpRequestMessage(HttpMethod.Post, new Uri(url));
            httpRequest.Content = new StringContent(content, Encoding.UTF8, "application/json");
            httpRequest.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
            System.Net.Http.Headers.HttpContentHeaders contentHeaders = httpRequest.Content.Headers;
            List<KeyValuePair<string, IEnumerable<string>>> contentHeaderList = contentHeaders.ToList();
            foreach (KeyValuePair<string, IEnumerable<string>> header in contentHeaderList) {
                string[] values = header.Value.ToArray();
                string valueStr = String.Empty;
                foreach (string val in values)
                    valueStr += val + ",";
                log.DebugFormat("Content Header {0} : {1}", header.Key, valueStr);
            }

            HttpResponseMessage resp = client.SendAsync(httpRequest).Result;
            if (resp.IsSuccessStatusCode) {
                string respString = resp.Content.ReadAsStringAsync().Result;
                log.DebugFormat("Response from token request {0}", respString);
                return respString;
            }
            else {
                log.DebugFormat("HTTP Error in token response, HTTP Status {0} : {1}", resp.StatusCode, resp.ReasonPhrase);
            }
            return String.Empty;
        }

    }
}