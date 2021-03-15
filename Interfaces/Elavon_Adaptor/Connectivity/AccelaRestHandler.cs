using System;
using System.Collections.Generic;
using Elavon_Adaptor.DataObjects;
using Elavon_Adaptor.Utilities;

namespace Elavon_Adaptor.Connectivity {
    public class AccelaRestHandler {
        public static EmseResultObject<string> GetMerchantDetails(string merchantId) {
            return CallEmseScript<string>(new Dictionary<string, object> {
                ["action"] = "getMerchantDetails",
                ["merchantId"] = merchantId
            });
        }

        public static EmseResultObject<T> CallEmseScript<T>(Dictionary<string, object> dictionary) {
            var body = Utility.SerializeToJson(dictionary);
            var result = SendRestRequest<EmseResultObject<T>>($"v4/scripts/PAYMENT_ADAPTER_MERCHANT", "POST", body);
            return result.Result;
        }

        public static string GetAccelaToken () {
            var requestBody = Utility.BuildUrlFromParameters(new Dictionary<string, string> {
                ["agency_name"] = Config.AccelaAgency,
                ["username"] = Config.AccelaUserName,
                ["password"] = Config.AccelaPassword,
                ["client_id"] = Config.AccelaClientId,
                ["client_secret"] = Config.AccelaClientSecret,
                ["environment"] = Config.AccelaEnvironment,
                ["scope"] = Config.AccelaScope,
                ["grant_type"] = Config.AccelaGrantType
            });

            int tryCount = 0;
            string token = null;
            string error = null;
            dynamic output = null;
            string responseString = null;
            while (tryCount < 3) {               
                try {
                    responseString = WebRequestHandler.SendPost(Config.AccelaAccessTokenUrl, requestBody);
                    // in case we fail to parse the json return an error
                    output = Utility.Serializer.Deserialize<object>(responseString);
                }
                catch (Exception e) {
                    throw new Exception($"Accela REST API authentication returned invalid JSON. Exception: {e.Message}\nFull Response: {responseString}");
                }

                error = Utility.GetKeyValue(output, "error", string.Empty);
                if (!string.IsNullOrEmpty(error)) {
                    //throw new Exception($"Accela REST API authentication. Error: {Utility.GetKeyValue(output, "error_description", error)}\nFull Response: {responseString}");
                }

                token = Utility.GetKeyValue(output, "access_token", null);
                if (token == null) {
                    // throw new Exception($"Accela REST API authentication. Error: No token was returned by the server\nFull Response: {responseString}");
                }
                tryCount++;
            }

            if (String.IsNullOrEmpty(token)) {
                throw new Exception($"Accela REST API authentication. Error: {Utility.GetKeyValue(output, "error_description", error)}\nFull Response: {responseString}");
            }

            return (string) token;
        }

        public static RestResponse<T> SendRestRequest<T> (string url, string method, string body=null) {
            url = Config.AccelaRequestUrl + "/" + url;
            var headers = new Dictionary<string, string> {
                ["Authorization"] = GetAccelaToken(),
                ["x-accela-appid"] = Config.AccelaClientId,
                ["x-accela-appsecret"] = Config.AccelaClientSecret
            };
            var responseString = WebRequestHandler.Send(url, body, method, headers);
            if (string.IsNullOrEmpty(responseString)) {
                throw new Exception($"{method} request to {url} with data {body ?? ""} didn't return a response");
            }

            var res = Utility.DeserializeFromJson<RestResponse<T>>(responseString);

            if (res.Status != 200) {
                throw new Exception($"{method} request to {url} with data {body ?? ""} returned status {res.Status} and message {res.Message}");
            }

            return res;
        }
    }
}