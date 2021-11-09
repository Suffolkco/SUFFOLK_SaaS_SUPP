using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Runtime.Serialization;
using log4net;


namespace suffolk.lims {

    public class AccelaRestHandler {
        static ILog Logger;
        public static EmseResultObject<T> ProcessDataList<T>(string[] header, List<string[]> rList) {
            dynamic dataIn = new ExpandoObject();
            List<string> rowList = new List<string>();
            foreach (string[] row in rList) {
                rowList.Add(JsonConvert.SerializeObject(row));
            }
            dataIn.input = rowList.ToArray();
            dataIn.operation = "PROCESSDATA";
            return CallLIMSScript<T>(header, dataIn);      
        }

        public static EmseResultObject<T> isDuplicateFieldNum<T>(string fieldNum) {
            dynamic dataIn = new ExpandoObject();
            dataIn.fieldNum = fieldNum;
            dataIn.operation = "DETERMINEDUP";
            return CallLIMSScript<T>(dataIn);
        }

        public static EmseResultObject<T> CompleteKeyProcess<T>(string fieldNum) {
            dynamic dataIn = new ExpandoObject();
            dataIn.fieldNum = fieldNum;
            dataIn.operation = "COMPLETEPROCESSING";
            return CallLIMSScript<T>(dataIn);
        }

        public static EmseResultObject<T> CallLIMSScript<T>(string[] header, dynamic input) {
            string body = JsonConvert.SerializeObject(input);
            return InvokeLIMSScript<T>(body);
        }

        public static EmseResultObject<T> CallLIMSScript<T>(dynamic input) {
            string body = JsonConvert.SerializeObject(input);
            return InvokeLIMSScript<T>(body);
        }



        public static EmseResultObject<T> InvokeLIMSScript<T>(string body) {
            var result = SendRestRequestJSON<EmseResultObject<T>>($"v4/scripts/LIMS_INTERFACE", "POST", body);
            return result.Result;
        }

        public static string GetAccelaToken(bool getNewToken = false) {
            var token = Utility.GetCache("token");
            if (token == null || getNewToken) {
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
                token = String.Empty;
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
                    else break;
                    tryCount++;
                }

                if (token == null || token.ToString() == String.Empty) {
                    throw new Exception($"Accela REST API authentication. Error: {Utility.GetKeyValue(output, "error_description", error)}\nFull Response: {responseString}");
                }

                int expiresIn = Utility.GetKeyValue(output, "expires_in", 86400);
                Utility.SetCache("token", token, expiresIn);
            }
            return (string)token;
        }

        public static RestResponse<T> SendRestRequest<T>(string url, string method, string body = null) {
            Logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
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
            RestResponse<T> res = null;
            try {
                res = Utility.DeserializeJson<RestResponse<T>>(responseString);

                if (res.Status != 200) {
                    throw new Exception($"{method} request to {url} with data {body ?? ""} returned status {res.Status} and message {res.Message}");
                }
            }
            catch (Exception e) {
                Logger.Error("Exception processing response string");
                Logger.Info(responseString);
                Logger.Info(e.Message);
            }
            return res;
        }

        public static RestResponse<T> SendRestRequestJSON<T>(string url, string method, string body = null) {
            Logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
            url = Config.AccelaRequestUrl + "/" + url;
            var headers = new Dictionary<string, string> {
                ["Authorization"] = GetAccelaToken(),
                ["x-accela-appid"] = Config.AccelaClientId,
                ["x-accela-appsecret"] = Config.AccelaClientSecret
            };
            var responseString = WebRequestHandler.SendJSON(url, body, method, headers);
            if (string.IsNullOrEmpty(responseString)) {
                throw new Exception($"{method} request to {url} with data {body ?? ""} didn't return a response");

            }
            RestResponse<T> res = null;
            try {
                res = Utility.DeserializeJson<RestResponse<T>>(responseString);

                if (res.Status != 200) {
                    throw new Exception($"{method} request to {url} with data {body ?? ""} returned status {res.Status} and message {res.Message}");
                }
            }
            catch (Exception e) {
                Logger.Error("Exception processing response string");
                Logger.Info(responseString);
                Logger.Info(e.Message);
            }
            return res;
        }
    }

    [DataContract]
    public class RestResponse<T> {
        [DataMember(Name = "result")]
        public T Result { get; set; }

        [DataMember(Name = "status")]
        public int Status { get; set; }

        [DataMember(Name = "message")]
        public string Message { get; set; }
    }

    // Data Objects used for response from REST calling EMSE
    [DataContract]
    public struct EmseResultObject<T> {   
        [DataMember(Name = "message")]
        public string Message { get; set; }

        [DataMember(Name = "success")]
        public bool Success { get; set; }

        [DataMember(Name = "content")]
        public T Content { get; set; }

        [DataMember(Name = "warning")]
        public List<string> Warnings { get; set; }

        [DataMember(Name = "info")]
        public List<string> Info { get; set; }

        [DataMember(Name = "error")]
        public List<string> Errors { get; set; }
    }
}
