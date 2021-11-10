using System;
using System.ServiceModel;
using System.Configuration;
using System.Collections.Generic;

namespace InterfaceLib.Common.Service
{
    public class SSOWS
    {
        private static log4net.ILog log = log4net.LogManager.GetLogger(typeof(SSOWS));

        private static String SSOSERVICE_URL = "/av-biz-ws-0.9/services/SSOService?wsdl";
        private string bizUrl;
        public SSOWS(string bizUrl)
        {
            this.bizUrl = bizUrl;
        }

        public String Signon(String agencyId, String userId, String password)
        {
            BasicHttpBinding binding = new BasicHttpBinding();
            EndpointAddress address = new EndpointAddress(bizUrl + SSOSERVICE_URL);
            
            SSOService.SSOClient client = new SSOService.SSOClient(binding, address);
            String sessionId = null;
            try
            {
                sessionId = client.signon(agencyId, userId, password);
            }
            catch (Exception e)
            {
                log.Error("Login failed:" + e.Message);
                throw new Exception("Login failed:" + e.Message);
            }
            return sessionId;
        }
    }
}
