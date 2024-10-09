using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace SIPSync
{
    internal class HTTPHelper
    {
        //===================================================
        // GET Request with async/await
        //===================================================
        public async Task<string> HttpGet(string queryUrl, Dictionary<string, string> headers = null)
        {
            try
            {
                var request = CreateHttpRequest(queryUrl, "GET", headers);
                return await GetResponseContentAsync(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Exception in GET request: {ex.Message}");
            }
        }

        //===================================================
        // GET Request with synchronous method
        //===================================================
        public string HttpGet(string access_token, string query)
        {
            try
            {
                var headers = new Dictionary<string, string> { { "authorization", access_token } };
                var request = CreateHttpRequest(query, "GET", headers);
                return GetResponseContent(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Exception in GET request: {ex.Message}");
            }
        }

        //===================================================
        // Form POST Method
        //===================================================
        public async Task<string> FormPost(string queryURL, Dictionary<string, string> parameters, Dictionary<string, string> headers = null)
        {
            string body = BuildQueryString(parameters);

            try
            {
                var request = CreateHttpRequest(queryURL, "POST", headers, "application/x-www-form-urlencoded", body);
                return await GetResponseContentAsync(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error posting to the URL: {queryURL} with values: {body}. The error was: {ex.Message}");
            }
        }

        //===================================================
        // JSON Request Method
        //===================================================
        public async Task<string> JSONRequest(string queryURL, object classObject, string method = "POST", Dictionary<string, string> headers = null)
        {
            string json = JsonConvert.SerializeObject(classObject);

            try
            {
                var request = CreateHttpRequest(queryURL, method, headers, "application/json", json);
                return await GetResponseContentAsync(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error posting to the URL: {queryURL} with JSON: {json}. The error was: {ex.Message}");
            }
        }

        //===================================================
        // Helper Method: Create HttpWebRequest
        //===================================================
        private static HttpWebRequest CreateHttpRequest(string url, string method, Dictionary<string, string> headers, string contentType = null, string body = null)
        {
            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = method;
            request.ContentType = contentType;
            request.AllowAutoRedirect = false;
            request.Timeout = 300000;

            // Only use TLS 1.2
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            if (headers != null)
            {
                foreach (var header in headers)
                {
                    request.Headers.Add(header.Key, header.Value);
                }
            }

            if (!string.IsNullOrEmpty(body))
            {
                byte[] data = Encoding.UTF8.GetBytes(body);
                request.ContentLength = data.Length;
                using (Stream newStream = request.GetRequestStream())
                {
                    newStream.Write(data, 0, data.Length);
                }
            }

            return request;
        }

        //===================================================
        // Helper Method: Get Response Content Async
        //===================================================
        private static async Task<string> GetResponseContentAsync(HttpWebRequest request)
        {
            using (var response = (HttpWebResponse)await request.GetResponseAsync())
            using (var stream = response.GetResponseStream())
            {
                if (stream == null)
                {
                    throw new Exception("No response stream received");
                }
                using (var reader = new StreamReader(stream, Encoding.UTF8))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }

        //===================================================
        // Helper Method: Get Response Content Synchronous
        //===================================================
        private static string GetResponseContent(HttpWebRequest request)
        {
            using (var response = (HttpWebResponse)request.GetResponse())
            using (var stream = response.GetResponseStream())
            {
                if (stream == null)
                {
                    throw new Exception("No response stream received");
                }
                using (var reader = new StreamReader(stream, Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        //===================================================
        // Helper Method: Build Query String
        //===================================================
        public static string BuildQueryString(Dictionary<string, string> parameters)
        {
            var url = new StringBuilder();
            foreach (var parameter in parameters)
            {
                url.AppendFormat("&{0}={1}", parameter.Key, parameter.Value);
            }
            return url.Length > 0 ? url.ToString().Substring(1) : string.Empty;
        }
    }
}
