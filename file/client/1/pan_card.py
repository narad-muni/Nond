from slack_sdk import WebClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime, timedelta
from ftplib import FTP

client = WebClient(token="xoxb-2748396223072-4439993225442-wmKkVskGQQhxCbpRyXj1DWW4")

engine = create_engine(
    "postgresql://schema_admin:9epHu+wlWR?THOtr0Fif@ventura1-prod-postgres-rds-audit.cxsiogefb5hv.ap-south-1.rds.amazonaws.com/sso_audit")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

def lambda_handler(event, context):
    try:

        i = 1

        x = engine.execute('''
            select a.client_id,b.last_seen,b.first_seen from
            (
            select distinct user_id,resp_json->>'client_id' as client_id
                from audit.sso_api_audit saa
                where api_id =1 and resp_code = 200 and date(req_dttm) = current_date - interval '{i} day'
            ) as a
            inner join
            (select user_id,max(req_dttm) as last_seen,min(resp_dttm) as first_seen
            from audit.sso_api_audit
            where api_id in (6,15,8) and resp_code=200 and date(req_dttm) = current_date - interval '{i} day'
            group by user_id) as b
            on b.user_id=a.user_id;
        '''.format(i=i)).fetchall()
        
        if(len(x) > 0):
            obj_list = [dict(a) for a in x]
        
            cur_date = str(datetime.now().date())
        
            pd.DataFrame(obj_list).to_csv("/tmp/"+cur_date+"_sso_logins.csv",index=False)
        
            response = client.files_upload_v2(
                channels="C04DMG8TE0Y",
                file="/tmp/"+cur_date+"_sso_logins.csv",
                title=cur_date+"_sso_logins"
            )

            file = open("/tmp/"+cur_date+"_sso_logins.csv",'rb')

            ftp = FTP()
            ftp.connect('172.16.102.129')
            ftp.login('sos','Sftp$%129')

            ftp.cwd('i:\ftproot\sos')

            ftp.storbinary(cur_date+"_sso_logins.csv",file)

            ftp.quit()
            file.close()

    except Exception as e:
        print(e)

lambda_handler(0,0)
