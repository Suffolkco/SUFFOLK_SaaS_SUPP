DECLARE
	HAVE_ADAPTER_REC	NUMBER;
	SEQ             NUMBER;			---SEQ for XPOLICY_SEQ
	AGENCY_ID			  VARCHAR2(200);	---agency SERV_PROV_CODE
	ADAPTER_NAME		VARCHAR2(50);	---Adapter Name
	ADAPTER_CONF		VARCHAR2(1000);	---Adapter Configuration
	GATEWAY_CONF		VARCHAR2(1000);	---Gateway Host Configuaration
	MERCHANT_CONF   VARCHAR2(1000);	---payment Parameter,e.g:ApplicationID=1234
	
BEGIN
  ---init
  ---@TODO: replace @AGENCY_CODE@ with exact SERV_PROV_CODE, e.g:'FLAGSTAFF'
  AGENCY_ID		:='SUFFOLKCO';

  ADAPTER_NAME 	:='Elavon_Adapter_TestEnv';
  ADAPTER_CONF	:='Adapter=Redirect';
  
  --@TODO: please replace below @HostURL@ with exact first data provider URL, e.g: HostURL=http://aca-server.achievo.com/TPEPayment/BeginPayment.aspx
  GATEWAY_CONF	:='HostURL=https://acadev.suffolkcountyny.gov/Elavon_Adapter_TESTENV/BeginPayment.aspx'; 
  
  ---@TODO: replace me with ApplicationID=${ApplicationID}'
  MERCHANT_CONF	:='ApplicationID=1;CountryCode=US;TotalAmountFormula=1.0154,1,0.11,0,999999,999999;ConvenienceFeeFormula=0.0154,1,0.11,0,999999,999999;'; 
  --end init
	HAVE_ADAPTER_REC :=0;
	SELECT count(*) into HAVE_ADAPTER_REC
	FROM XPOLICY
	WHERE SERV_PROV_CODE = AGENCY_ID
	AND POLICY_NAME = 'PaymentAdapterSec'
	AND LEVEL_TYPE = 'Adapter'
	AND LEVEL_DATA = ADAPTER_NAME;
	IF (HAVE_ADAPTER_REC <= 0) THEN  
		-- insert Adapter record
		SELECT T.LAST_NUMBER
		INTO SEQ
		FROM AA_SYS_SEQ T
		WHERE T.SEQUENCE_NAME = 'XPOLICY_SEQ';

		SEQ := SEQ + 1;

		INSERT INTO XPOLICY
			(SERV_PROV_CODE, POLICY_SEQ, POLICY_NAME, LEVEL_TYPE, LEVEL_DATA, DATA1, RIGHT_GRANTED,
			STATUS, REC_DATE, REC_FUL_NAM, REC_STATUS, MENUITEM_CODE, DATA2, DATA3, DATA4, MENU_LEVEL,
			DATA5, RES_ID)
		VALUES
			(AGENCY_ID, SEQ, 'PaymentAdapterSec', 'Adapter', ADAPTER_NAME, ADAPTER_CONF, 'F',
			'A', SYSDATE, 'ADMIN', 'A', '', GATEWAY_CONF , '', MERCHANT_CONF, '',
			'', '');

		UPDATE AA_SYS_SEQ SET LAST_NUMBER = SEQ WHERE SEQUENCE_NAME = 'XPOLICY_SEQ';
	END IF;
	UPDATE XPOLICY
	SET 
		DATA1=ADAPTER_CONF,
		DATA2=GATEWAY_CONF ,
		DATA3='',
		DATA4=MERCHANT_CONF,
		REC_DATE=SYSDATE,
		REC_FUL_NAM='ADMIN'
	WHERE SERV_PROV_CODE = AGENCY_ID
	AND POLICY_NAME = 'PaymentAdapterSec'
	AND LEVEL_TYPE = 'Adapter'
	AND LEVEL_DATA = ADAPTER_NAME;
	
  COMMIT;
END;
/

