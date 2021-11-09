using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace InterfaceLib.Common.Service
{
    public class TokenAPIHelper : APIHelper
    {
        private const string OAUTH_TOKEN_PATH = "/oauth2/token";

        public TokenAPIHelper()
        {
            log = log4net.LogManager.GetLogger(typeof(TokenAPIHelper));
        }

        public string Signon(string agencyId, string userId, string password, string environment, string clientId, string clientSecret)
        {
            string sessionId = null;
            try
            {
                List<KeyValuePair<string, string>> body = new List<KeyValuePair<string, string>>();
                body.Add(new KeyValuePair<string, string>("agency_name", agencyId));
                body.Add(new KeyValuePair<string, string>("username", userId));
                body.Add(new KeyValuePair<string, string>("password", password));
                body.Add(new KeyValuePair<string, string>("environment", environment));
                body.Add(new KeyValuePair<string, string>("client_id", clientId));
                body.Add(new KeyValuePair<string, string>("client_secret", clientSecret));
                body.Add(new KeyValuePair<string, string>("grant_type", "password"));
                body.Add(new KeyValuePair<string, string>("scopes", "payments run_emse_script open_data_query run_generic_search records settings"));

                KeyValuePair<bool, dynamic> result = Execute<dynamic>(HttpMethod.Post, OAUTH_TOKEN_PATH, null, body);
                if (result.Key)
                {
                    sessionId = result.Value.access_token;
                }
            }
            catch (AggregateException err)
            {
                foreach (var errInner in err.InnerExceptions)
                {
                    log.Error("Login failed:" + err.Message, err);
                }
                throw err;
            }
            catch (Exception e)
            {
                log.Error("Login failed:" + e.Message, e);
                log.Error(e.ToString());
                throw new Exception("Login failed:" + e.Message);
            }
            return sessionId;
        }
    }
}