using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using Newtonsoft.Json;
using System.Text;

namespace InterfaceLib.Common.Service
{
    /// <summary>
    /// This is the base class for *APIHelper classes used to iteract with the Construct API
    /// This base class provides common functionality used by all API interactions
    /// </summary>
    public abstract class APIHelper
    {
        protected static HttpClient client = null;
        protected static log4net.ILog log = log4net.LogManager.GetLogger(typeof(APIHelper));
        public string Url { get; set; }

        protected KeyValuePair<bool, T> Execute<T>(HttpMethod method, string path, string token, object body)
        {
            client = GetHTTPClient();

            string url = client.BaseAddress + path;
            HttpRequestMessage request = new HttpRequestMessage(method, url);

            KeyValuePair<bool, T> result = new KeyValuePair<bool, T>(false, default(T));

            if (!path.Contains("oauth2/token"))
            {
                if (!string.IsNullOrWhiteSpace(token))
                {
                    request.Headers.Add("Authorization", token);
                }
                else
                {
                    // Warn if there's no token, but proceed anyways in case this is valid
                    log.Warn($"No token provided for request to {url}");
                }
            }

            try
            {
                if (method != HttpMethod.Get)
                {
                    if (!path.Contains("oauth2/token"))
                    {
                        request.Content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
                    }
                    else
                    {
                        log.Debug("Token request, casting body as List<KeyValuePair<string,string>>");
                        request.Content = new FormUrlEncodedContent((List<KeyValuePair<string, string>>)body);
                        log.Debug(body.ToString());
                    }
                }

            }
            catch (Exception ex)
            {
                log.Error($"Unable to form request body from string {body}", ex);
                throw ex;
            }


            try
            {

                HttpResponseMessage response;
                string resContent = "";
                try
                {
                    response = client.SendAsync(request).Result;
                    var traceid = response.Headers.First(x => x.Key.Equals("x-accela-traceid", StringComparison.OrdinalIgnoreCase)).Value.First();
                    log.Info($"TraceId: {traceid}");
                    resContent = response.Content.ReadAsStringAsync().Result;
                }
                catch (Exception he)
                {
                    log.Error($"Failed to send request to {path}", he);
                    log.Debug("Dumping API request body...");
                    log.Debug(request.Content);
                    throw he;
                }

                T res = default(T); // Initializing, can't set to null

                try
                {
                    res = JsonConvert.DeserializeObject<T>(resContent);
                    result = new KeyValuePair<bool, T>(true, res);
                }
                catch (JsonException jse)
                {
                    log.Debug("Dumping API response content...");
                    log.Debug(resContent);
                    log.Error("Failed to deserialize api response", jse);
                }
            }
            catch (Exception e)
            {
                log.Debug("Dumping API request body...");
                log.Debug(request.Content);
                log.Error($"Error encountered during api request: {method.Method} {path}", e);
            }

            return result;
        }

        /// <summary>
        /// Retrieves an HTTP client instance
        /// </summary>
        /// <param name="baseUrl">The base url for Construct. Defaults to https://apis.accela.com if not specified</param>
        protected HttpClient GetHTTPClient(string baseUrl = "https://apis.accela.com")
        {
            Url = baseUrl;

            if (client != null)
                return client;

            client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(225); // Construct frontend request timeout is 230 seconds
            client.BaseAddress = new Uri(baseUrl);

            return client;
        }
    }
}