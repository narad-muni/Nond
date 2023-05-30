from utils import *

def lambda_handler(event,context):
    
    '''Historical '''
    # engine.execute('truncate table report.mf_raw_txns_3m')
    # engine.execute(''' 
        # insert into report.mf_raw_txns_3m
        # (
        #     select * from report.mf_raw_txns_test
        #     where trxn_date > current_date - interval '3 months'
        # )
    # ''')
    # engine.execute('''
        # insert into report.investment_by_category 
        # (
        #     select mdv.asset_type ,mdv.subcategory ,count(*) from report.mf_raw_txns_3m mrtm
        #     join
        #     mf_master_data.mf_detailed_view mdv 
        #     on mrtm.scheme_code = mdv.cams_code
        #     where mdv.asset_type is not null and mdv.subcategory is not null 
        #     group by mdv.asset_type , mdv.subcategory
        # )
    # ''')

    '''incremental'''

    engine.execute(''' delete from report.mf_raw_txns_3m
        where trxn_date < current_date - interval '3 months'
    ''')
    engine.execute('''
        insert into mf_raw_txns_3m
        (
            select * from report.mf_unprocessed_txns
        )
    ''')
    engine.execute('''
        truncate table report.investment_by_category
    ''')
    engine.execute('''
        insert into report.investment_by_category 
        (
            select mdv.asset_type ,mdv.subcategory ,count(*) from report.mf_raw_txns_3m mrtm
            join
            mf_master_data.mf_detailed_view mdv 
            on mrtm.scheme_code = mdv.cams_code
            where mdv.asset_type is not null and mdv.subcategory is not null 
            group by mdv.asset_type , mdv.subcategory
        )
    ''')