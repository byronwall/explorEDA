#!/usr/bin/env python3
"""Deterministic preparation from the bundled, licensed historical snapshots.
Run from any directory: python evidence/scripts/prepare.py
Dependencies: pandas==2.2.3, numpy==2.3.5. No network, random data, or imputation.
The input hashes in acquisition.json/source-capture.json are checked before use.
"""
from __future__ import annotations
import hashlib, json, calendar
from pathlib import Path
import numpy as np
import pandas as pd
ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'evidence/raw'
TABLES: dict[str,dict] = {}

def dump(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, allow_nan=False)+'\n', encoding='utf-8')

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read(name): return pd.read_csv(RAW/f'{name}.csv', encoding='utf-8-sig')

def add(family: str, name: str, df: pd.DataFrame, grain: str, transform: str,
        units: dict[str,str] | None=None, dates: tuple[str,...]=()):
    df=df.copy().reset_index(drop=True)
    if 'id' not in df: df.insert(0,'id',[f'{family}-{name}-{i+1:05d}' for i in range(len(df))])
    else: df['id']=df['id'].map(str)
    assert df['id'].notna().all() and df['id'].is_unique,(family,name,'duplicate id')
    df.replace([np.inf,-np.inf],np.nan,inplace=True)
    path=ROOT/f'projects/{family}/data/{name}.csv'; path.parent.mkdir(parents=True,exist_ok=True)
    df.to_csv(path,index=False,lineterminator='\n',float_format='%.12g',na_rep='')
    fields=[]
    for c in df:
        t='date' if c in dates else 'number' if pd.api.types.is_numeric_dtype(df[c]) else 'string'
        unit=(units or {}).get(c, 'identifier' if c=='id' else 'calendar label' if c in dates else 'category' if t=='string' else 'dimensionless / source units; see dataset notes')
        fields.append({'name':c,'source_field':f'{name}.{c}','type':t,'unit':unit,
                       'missing_count':int(df[c].isna().sum()),'valid_count':int(df[c].notna().sum()),
                       'description':c.replace('_',' ')+'; '+unit})
    rec={'source_id':name,'path':path.relative_to(ROOT).as_posix(),'row_count':len(df),
         'grain':grain,'key':'id','fields':fields,'transformations':transform,'sha256':sha(path),
         'missing_value_rule':'Empty CSV cells are null. Valid zero and negative values retained. No interpolation.'}
    TABLES.setdefault(family,{})[name]=rec
    print(f'PREPARED {family}/{name}: {len(df)} rows')
    return df

def period_fields(df, date='date'):
    dt=pd.to_datetime(df[date],utc=True)
    df['year']=dt.dt.year;df['month']=dt.dt.month
    df['month_label']=dt.dt.month.map(lambda x:f'{x:02d} {calendar.month_abbr[x]}')
    df['decade']=((dt.dt.year//10)*10).map(lambda x:f'{x}s')
    return df

def prepare():
    acquisitions=json.loads((ROOT/'evidence/acquisition.json').read_text())
    captures=json.loads((ROOT/'evidence/source-capture.json').read_text())
    for rec in acquisitions+captures:
        path=ROOT/rec.get('raw_path',rec.get('output_raw',''))
        assert path.is_file() and sha(path)==rec['sha256'],f'Input hash mismatch: {path}'
    assert sha(RAW/'ercot-demand.csv')=='d2f5cf4db04e65e409eaf56227f08543763e34d4442012c2df5fcb9c34680c73'

    # Preserve the supplied repository vintage, not a new API response.
    d=read('ercot-demand').rename(columns={'time':'date'}); period_fields(d)
    d['hour']=pd.to_datetime(d.date,utc=True).dt.hour; d['hour_label']=d.hour.map(lambda x:f'{x:02d}:00 UTC')
    d['error']=d.actual-d.forecast;d['abs_error']=d.error.abs()
    d['pct_error']=100*d.error/d.forecast.where(d.forecast>0);d['abs_pct_error']=d.pct_error.abs()
    d['direction']=np.select([d.error>0,d.error<0],['Above forecast','Below forecast'],default='Equal')
    U={c:'MWh for the supplied hour' for c in ['actual','forecast','error','abs_error']};U.update(pct_error='% of positive forecast',abs_pct_error='% of positive forecast',hour='UTC clock hour',year='year',month='month number')
    add('ercot','r',d,'one supplied hour','Preserve all supplied rows; signed error = actual - forecast; percentages divide by positive forecast; calendar fields derived in UTC.',U,('date',))
    a=d.assign(day=d.date.str[:10]).groupby('day',sort=True).agg(actual=('actual','mean'),forecast=('forecast','mean'),error=('error','mean'),abs_error=('abs_error','mean'),hours=('date','size')).reset_index().rename(columns={'day':'date'})
    add('ercot','daily',a,'one supplied UTC date','Arithmetic means across available hours; hours retained; partial boundary days not completed.',{**U,'hours':'supplied hours'},('date',))
    h=d.groupby(['month_label','hour','hour_label'],sort=True).agg(error=('error','mean'),abs_error=('abs_error','mean'),hours=('date','size')).reset_index()
    add('ercot','clock',h,'one month and UTC clock hour','Mean errors, with observed hour denominator.',{**U,'hours':'supplied hours'})

    d=read('co2');d.date=pd.to_datetime(d.date.astype(str),format='%Y%m%d').dt.strftime('%Y-%m-%d');period_fields(d)
    d['coverage']=np.where(d.co2.notna(),'Measured','Missing');d['observed']=d.co2.notna().astype(int)
    d['annual_center']=d.groupby('year').co2.transform('mean');d['residual']=d.co2-d.annual_center
    add('co2','r',d,'one supplied weekly date','No gap filling; residual subtracts that year\'s available-week mean, not a fitted trend.',{'co2':'parts per million by volume (ppmv)','annual_center':'ppmv','residual':'ppmv relative to annual available-week mean','observed':'1 measured; 0 missing','year':'year','month':'month number'},('date',))
    a=d.groupby('year',sort=True).agg(mean=('co2','mean'),low=('co2','min'),high=('co2','max'),valid=('co2','count'),slots=('co2','size')).reset_index();a['coverage_pct']=100*a.valid/a.slots
    add('co2','annual',a,'one supplied year','Available-week annual means/extrema and valid/supplied coverage; first and last years may be partial.',{'mean':'ppmv','low':'ppmv','high':'ppmv','valid':'measured weeks','slots':'supplied weekly slots','coverage_pct':'% supplied slots measured','year':'year'})
    gaps=[]; mask=d.co2.isna().to_numpy();i=0
    while i<len(d):
        if not mask[i]: i+=1;continue
        j=i
        while j<len(d) and mask[j]: j+=1
        gaps.append(dict(date=d.date.iloc[i],end_date=d.date.iloc[j-1],length=j-i,year=int(d.year.iloc[i]),before=d.co2.iloc[i-1] if i else np.nan,after=d.co2.iloc[j] if j<len(d) else np.nan))
        i=j
    add('co2','gaps',pd.DataFrame(gaps),'one consecutive missing run','Consecutive means adjacent rows in the supplied weekly calendar; before/after values are observations, not interpolated replacements.',{'length':'consecutive missing weekly slots','before':'ppmv','after':'ppmv','year':'year'},('date','end_date'))

    d=read('elnino'); d=d.melt(id_vars='YEAR',var_name='month_name',value_name='sst').rename(columns={'YEAR':'year'})
    d['month']=d.month_name.map({calendar.month_abbr[i].upper():i for i in range(1,13)})
    d=d.sort_values(['year','month']).reset_index(drop=True);d['date']=[f'{int(y)}-{int(m):02d}-01' for y,m in zip(d.year,d.month)];period_fields(d)
    base=d[d.year.between(1981,2010)].groupby('month').sst.mean();d['climatology']=d.month.map(base);d['anomaly']=d.sst-d.climatology
    d['era']=np.where(d.year<1981,'1950–1980','1981–2010')
    U={'sst':'degrees Celsius, Niño 1+2 region','climatology':'degrees Celsius; 1981–2010 calendar-month mean','anomaly':'degrees Celsius relative to 1981–2010 month mean','year':'year','month':'month number'}
    add('elnino','r',d,'one Niño 1+2 calendar month','Wide months unpivoted; anomaly = temperature - 1981–2010 mean for the same month. No standardization by variance.',U,('date',))
    a=d.groupby('year').agg(mean=('sst','mean'),low=('sst','min'),high=('sst','max'),range=('sst',lambda x:x.max()-x.min()),months=('sst','count'),anomaly=('anomaly','mean')).reset_index()
    add('elnino','annual',a,'one year','Unweighted monthly means and observed minimum/maximum; range is not uncertainty.',{'mean':'degrees Celsius','low':'degrees Celsius','high':'degrees Celsius','range':'degrees Celsius','anomaly':'degrees Celsius','months':'observed months','year':'year'})
    e=pd.concat([d[d.year.between(y,y+1)].assign(episode=f'{y}–{y+1}',episode_month=lambda f:(f.year-y)*12+f.month) for y in [1982,1997]],ignore_index=True)
    add('elnino','episodes',e,'one calendar month in either selected two-year window','Illustrative predeclared 1982–1983 and 1997–1998 windows; same baseline and 1–24 aligned months; not event classification.',{**U,'episode_month':'month index from January of the first year'},('date',))

    d=read('sunspots').rename(columns={'YEAR':'year','SUNACTIVITY':'activity'});d['era']=((d.year//50)*50).map(lambda y:f'{int(y)}–{int(y)+49}')
    d['smooth11']=d.activity.rolling(11,center=True,min_periods=11).mean();d['departure']=d.activity-d.smooth11
    add('sunspots','r',d,'one year','Centered 11-year arithmetic mean requires all 11 observations; five edge years at either end have no smooth value. Historical supplied revision retained.',{'year':'year','activity':'historical annual sunspot number','smooth11':'11-year mean sunspot number','departure':'sunspot-number difference'})

    d=read('nile');d['era']=np.where(d.year<1898,'1871–1897','1898–1970');d['rank']=d.volume.rank(method='average',pct=True)*100
    lo,hi=d.volume.quantile([.1,.9]);d['tail']=np.select([d.volume<lo,d.volume>hi],['Lower tail','Upper tail'],default='Middle 80% cutoffs')
    d['centered']=d.volume-d.volume.mean()
    add('nile','r',d,'one annual flow observation at Aswan','Era cutoff 1898 is descriptive, not causal; rank is average-rank percentile; tails use linear 10th/90th percentiles and strict inequalities.',{'year':'year','volume':'10^8 cubic metres per year','centered':'10^8 cubic metres relative to full mean','rank':'percentile rank'})

    d=read('macrodata');d['date']=[f'{int(y)}-{int(q)*3-2:02d}-01' for y,q in zip(d.year,d.quarter)];d['decade']=((d.year//10)*10).map(lambda x:f'{int(x)}s')
    d['gdp_growth']=100*((d.realgdp/d.realgdp.shift(1))**4-1);d['consumption_share']=100*d.realcons/d.realgdp;d['gdp_change']=d.realgdp.diff();d['unemp_change']=d.unemp.diff()
    U={c:'billions of chained 2005 US dollars (source vintage)' for c in ['realgdp','realcons','realinv','realgovt','realdpi','gdp_change']}
    U.update(gdp_growth='annualized quarter-on-quarter %',consumption_share='% ratio of chained-dollar series; not additive budget share',unemp='unemployment rate, %',unemp_change='percentage points',infl='source annualized inflation, %',realint='source real interest rate, %',tbilrate='Treasury bill rate, %',cpi='CPI index',m1='billions of nominal US dollars',pop='millions of people',year='year',quarter='quarter number')
    add('macro','r',d,'one US calendar quarter','Derived annualized GDP growth uses the preceding supplied quarter; first growth is null. Source initial infl/realint zero preserved, not inferred measured inflation.',U,('date',))

    d=read('grunfeld').sort_values(['firm','year']).reset_index(drop=True)
    d['invest_index']=d.invest/d.groupby('firm').invest.transform('first')*100;d['value_index']=d.value/d.groupby('firm').value.transform('first')*100
    for c in ['invest','value','capital']: d[c+'_change']=d.groupby('firm')[c].diff()
    U={c:'source 1947-dollar units; no multiplier assumed' for c in ['invest','value','capital','invest_change','value_change','capital_change']};U.update(year='year',invest_index='first supplied firm year = 100',value_index='first supplied firm year = 100')
    add('grunfeld','r',d,'one firm-year','Sort within firm; differences never cross firm boundaries; indices divide by each firm\'s first supplied positive value.',U)
    a=d.groupby('firm').agg(years=('year','size'),invest_mean=('invest','mean'),value_mean=('value','mean'),invest_total=('invest','sum')).reset_index()
    add('grunfeld','firms',a,'one firm summary','Means and observation counts across supplied years; total investment is historical sum, not firm value.',{'years':'observed firm-years','invest_mean':U['invest'],'value_mean':U['value'],'invest_total':U['invest']})

    d=read('stackloss').rename(columns=str.lower);d['sequence']=np.arange(1,len(d)+1);d['loss_pct']=d.stackloss/10
    slope,intercept=np.polyfit(d.airflow,d.stackloss,1);d['fitted']=intercept+slope*d.airflow;d['residual']=d.stackloss-d.fitted
    d['loo_slope']=[float(np.polyfit(d.airflow.drop(i),d.stackloss.drop(i),1)[0]) for i in d.index];d['slope_shift']=d.loo_slope-slope
    d['air_band']=np.where(d.airflow>=d.airflow.median(),'At/above median airflow','Below median airflow')
    add('stackloss','r',d,'one recorded plant operating day','Loss percent = source stackloss / 10. Ordinary least-squares single-predictor fits include an intercept. Leave-one-out slopes omit exactly that row. Observation sequence is not a verified date.',{'sequence':'source row sequence','stackloss':'10 × percent ammonia lost','loss_pct':'% ammonia lost','airflow':'source airflow units','watertemp':'degrees Celsius','acidconc':'source-coded acid concentration','fitted':'10 × percent ammonia lost','residual':'10 × percentage-point loss residual','loo_slope':'stackloss units per airflow unit','slope_shift':'slope units'},())

    d=read('engel');d['food_share']=100*d.foodexp/d.income;d['income_band']=pd.qcut(d.income,4,labels=['Q1 lowest income','Q2','Q3','Q4 highest income']).astype(str)
    U={'income':'Belgian francs per year, 1857','foodexp':'Belgian francs per year, 1857','food_share':'% household income spent on food'}
    add('engel','r',d,'one surveyed working-class household','Food share = 100 × food expenditure / income; equal-count income quartiles use pandas linear quantiles.',U)
    a=d.groupby('income_band',sort=True).agg(households=('income','size'),income_sum=('income','sum'),food_sum=('foodexp','sum'),mean_share=('food_share','mean'),median_share=('food_share','median')).reset_index();a['weighted_share']=100*a.food_sum/a.income_sum;a['order']=np.arange(1,len(a)+1)
    add('engel','bands',a,'one income quartile','Mean share gives households equal weight; weighted share is 100 × sum(food) / sum(income); retain denominator totals.',{'households':'households','income_sum':U['income'],'food_sum':U['foodexp'],'mean_share':'% unweighted household mean','median_share':'% household median','weighted_share':'% income-weighted ratio','order':'income quartile order'})

    d=read('strikes');d['sequence']=np.arange(1,len(d)+1);d['production_band']=np.where(d.iprod>=0,'Nonnegative production deviation','Negative production deviation');d['log_duration']=np.log10(d.duration)
    add('strikes','r',d,'one selected manufacturing strike','All positive durations retained; log10 duration is a scale transformation; production bands use zero, not fitted cutoffs.',{'duration':'days','iprod':'source industrial-production deviation units','log_duration':'log10(days)','sequence':'source row sequence'})

    d=read('danish_data');d['year']=d.period.str[:4].astype(int);d['quarter']=d.period.str[-1].astype(int);d['date']=[f'{y}-{q*3-2:02d}-01' for y,q in zip(d.year,d.quarter)]
    d['money_index']=100*np.exp(d.lrm-d.lrm.iloc[0]);d['income_index']=100*np.exp(d.lry-d.lry.iloc[0]);d['dmoney']=d.lrm.diff();d['dincome']=d.lry.diff();d['spread']=d.ibo-d.ide
    d['era']=np.where(d.year<1981,'1974–1980','1981–1987')
    add('danish','r',d,'one Danish calendar quarter','Source logged real money/income rebased using exp(log value - first log value) × 100; first log changes null; spread = bond rate - deposit rate, in source rate units.',{'lrm':'log real money, source definition','lry':'log real income, source definition','lpy':'log price level','ibo':'source bond-rate units (fraction)','ide':'source deposit-rate units (fraction)','spread':'difference in source rate fractions','money_index':'first quarter = 100','income_index':'first quarter = 100','dmoney':'quarterly log change','dincome':'quarterly log change','year':'year','quarter':'quarter number'},('date',))

    d=read('fertility'); codes=['BRA','CHN','IND','NGA','USA','ZAF','JPN','MEX','EGY','FRA','KOR','IDN'];d=d[d['Country Code'].isin(codes)]
    assert set(d['Country Code'])==set(codes)
    d=d.melt(id_vars=['Country Name','Country Code'],value_vars=[str(y) for y in range(1960,2014)],var_name='year',value_name='fertility').rename(columns={'Country Name':'country','Country Code':'code'})
    d.year=d.year.astype(int);d=d.sort_values(['code','year']).reset_index(drop=True);d['decade']=(d.year//10*10).map(lambda x:f'{x}s');d['year_label']=d.year.map(lambda y:f'Y{y}');d['coverage']=np.where(d.fertility.notna(),'Published value','Missing value');d['observed']=d.fertility.notna().astype(int)
    add('fertility','r',d,'one selected country-year','Predeclared illustrative set of 12 country codes; all returned year cells 1960–2013 retained including nulls. No world-population inference.',{'fertility':'period total fertility rate, births per woman','year':'year','observed':'1 published; 0 missing'})
    a=d.pivot(index=['code','country'],columns='year',values='fertility').reset_index();a=a[['code','country',1960,2011]].rename(columns={1960:'start',2011:'end'});a['change']=a.end-a.start;a['complete']=np.where(a[['start','end']].notna().all(axis=1),'Both endpoints','Missing endpoint');a['annual_change']=a.change/51
    add('fertility','endpoints',a,'one selected country','1960 and 2011 cells joined by code; change only when both published; annual change divides by 51 elapsed years.',{'start':'births per woman in 1960','end':'births per woman in 2011','change':'births per woman, 2011 minus 1960','annual_change':'births per woman per elapsed year'})
    a2=a[a.complete=='Both endpoints'].melt(id_vars=['code','country'],value_vars=['start','end'],var_name='endpoint',value_name='fertility');a2['year']=a2.endpoint.map({'start':1960,'end':2011})
    add('fertility','paired',a2,'one matched country-endpoint','Same complete country cohort at each endpoint; unweighted countries.',{'fertility':'births per woman','year':'year'})
    rows=[]
    for (code,country),sub in d.groupby(['code','country']):
        for y in range(1960,2010,10):
            s=sub[sub.year.between(y,y+9)].sort_values('year');v=s.fertility
            rows.append(dict(code=code,country=country,decade=f'{y}s',year=y,start=v.iloc[0],end=v.iloc[-1],change=v.iloc[-1]-v.iloc[0],annual_change=(v.iloc[-1]-v.iloc[0])/9,valid=int(v.count())))
    add('fertility','decades',pd.DataFrame(rows),'one country and complete named decade','Compare first and last year of each 10-observation decade, dividing by nine elapsed years; 2010s excluded.',{'start':'births per woman','end':'births per woman','change':'births per woman','annual_change':'births per woman per elapsed year','valid':'published years','year':'first year of decade'})

    cols=['sepal_length','sepal_width','petal_length','petal_width','class_code'];d=pd.read_csv(RAW/'iris.csv',skiprows=1,header=None,names=cols);assert len(d)==150
    d['species']=d.class_code.map({0:'setosa',1:'versicolor',2:'virginica'});d['petal_ratio']=d.petal_length/d.petal_width
    add('iris','r',d.drop(columns='class_code'),'one sampled iris flower','Preserve scikit-learn corrected source variant; decode class labels; petal ratio = length / width.',{**{c:'centimetres' for c in cols[:-1]},'petal_ratio':'length / width, dimensionless'})

    cols=['alcohol','malic_acid','ash','ash_alkalinity','magnesium','total_phenols','flavanoids','nonflavanoid_phenols','proanthocyanins','color_intensity','hue','od_ratio','proline','class_code']
    d=pd.read_csv(RAW/'wine.csv',skiprows=1,header=None,names=cols);assert len(d)==178;d['cultivar']=d.class_code.map({0:'Cultivar 1',1:'Cultivar 2',2:'Cultivar 3'})
    add('wine','r',d.drop(columns='class_code'),'one Italian wine chemical analysis','Decode source class to cultivar labels; this is UCI Wine recognition, not Wine Quality. No quality ratings inferred.',{c:'source assay units; publisher does not specify units' for c in cols[:-1]})
    long=d.melt(id_vars='cultivar',value_vars=cols[:-1],var_name='measure',value_name='value');long['unit']='Source assay units; differ by measure'
    add('wine','profiles',long,'one wine-measure observation','Unpivot all 13 assays without standardization; repeat-specific value domains necessary because units differ.',{'value':'source units, different for each measure'})

    d=read('longley').rename(columns={'YEAR':'year','TOTEMP':'employment','GNPDEFL':'deflator','GNP':'gnp','UNEMP':'unemployed','ARMED':'armed','POP':'population'}).drop(columns='Obs')
    d['employment_change']=d.employment.diff();d['gnp_change']=d.gnp.diff();d['population_change']=d.population.diff();d['era']=np.where(d.year<=1954,'1947–1954','1955–1962')
    for c in ['employment','gnp','population']:d[c+'_index']=100*d[c]/d[c].iloc[0]
    add('longley','r',d,'one historical US annual observation','Retain historical regression benchmark values; successive differences have first value null; first observation indices = 100. This small benchmark is not a modern labor-market model.',{'year':'year','employment':'source employment units','unemployed':'source unemployment-count units','armed':'source armed-forces-count units','population':'source population units','gnp':'source nominal GNP units','deflator':'source GNP deflator index','employment_change':'source employment units per year','gnp_change':'source GNP units per year','population_change':'source population units per year','employment_index':'1947 = 100','gnp_index':'1947 = 100','population_index':'1947 = 100'})

    idx=d.melt(id_vars='year',value_vars=['employment_index','gnp_index','population_index'],var_name='series',value_name='value')
    add('longley','indexed',idx,'one annual indexed series value','Unpivot three separately rebased indices; all use first supplied year = 100; units are comparable indices, not original amounts.',{'year':'year','value':'1947 = 100'})

    d=read('worldcup-group-matches');d['total_goals']=d.goals1+d.goals2;d['margin']=(d.goals1-d.goals2).abs();d['result']=np.where(d.goals1==d.goals2,'Draw','Decisive')
    matches=add('football','r',d,'one 2018 World Cup group-stage match','All final scores from the 48 supplied group matches; halftime/scorers/venues omitted; calendar dates not kickoff instants.',{'goals1':'goals by first listed team','goals2':'goals by second listed team','total_goals':'goals per match','margin':'absolute final goal difference'},('date',))
    apps=[]
    for row in matches.to_dict('records'):
        for side in [1,2]:
            gf,ga=row[f'goals{side}'],row[f'goals{3-side}'];apps.append(dict(match_id=row['id'],team=row[f'team{side}'],opponent=row[f'team{3-side}'],group=row['group'],date=row['date'],goals_for=gf,goals_against=ga,points=3 if gf>ga else 1 if gf==ga else 0,result='Win' if gf>ga else 'Draw' if gf==ga else 'Loss'))
    a=pd.DataFrame(apps);assert len(a)==96
    add('football','appearances',a,'one team appearance in a group match','Exactly two appearances per match; goals duplicated across opponent roles, not for match totals; 3/1/0 point rule.',{'goals_for':'goals per team appearance','goals_against':'goals conceded per team appearance','points':'group points, win 3 / draw 1 / loss 0'},('date',))
    t=a.groupby(['team','group']).agg(matches=('match_id','size'),goals_for=('goals_for','sum'),goals_against=('goals_against','sum'),points=('points','sum')).reset_index();t['goal_difference']=t.goals_for-t.goals_against
    assert len(t)==32 and (t.matches==3).all()
    add('football','teams',t,'one team in the completed group stage','Sum three appearances per team; no knockout results, tie-break advancement or total tournament claims.',{'matches':'group matches','goals_for':'group-stage goals','goals_against':'group-stage goals conceded','points':'group-stage points','goal_difference':'group-stage goals for minus against'})

    d=read('tate-artists-prefix').rename(columns={'id':'catalogue_id'});d['date_span']=d.death_year-d.birth_year;d['entity']=np.where(d.name.eq('Alken Family'),'Named family entity','Other named record');d['death_status']=np.where(d.death_year.notna(),'Death year recorded','Death year blank in archive');d['birth_century']=(d.birth_year//100*100).map(lambda x:f'{int(x)}s')
    add('tate','r',d,'one artist-catalogue record in the first 60 alphabetic records','Select four supplied fields; span = death year - birth year only when both recorded; identify explicit Alken Family name without inferring other entities. No current-life status inferred from old missing death dates.',{'catalogue_id':'original Tate catalogue identifier','birth_year':'year in October 2014 archive','death_year':'year in October 2014 archive','date_span':'years between two catalogue dates; not necessarily a lifespan'})

    # Sources are explicitly typed. Explicit identity queries share each source ID for portable demo loading.
    for family, tables in TABLES.items():
        lines=[f'project @{family}','']
        for sid,rec in tables.items():
            lines.append(f'source @{sid} key=id path=data/{sid}.csv {{')
            for f in rec['fields']:
                lines.append(f'  field {f["name"]} {json.dumps(f["name"].replace("_"," "),ensure_ascii=False)} {f["type"]}')
            lines.extend(['}',''])
        for sid in tables:
            lines += [f'query @{sid} {json.dumps(sid.replace("_"," "))} glyph=◆ {{',f'  source {sid}','}','']
        if family=='football':
            lines += ['relate @team-link appearances.team -> teams.team','relate @match-link appearances.match_id -> r.id','query @linked "Team appearances with explicit lookups" glyph=◆ {','  source appearances','  lookup squad via=team-link','  lookup match via=match-link','}','']
        if family=='grunfeld':
            lines += ['relate @firm-link r.firm -> firms.firm','query @linked "Firm-years with firm summaries" glyph=◆ {','  source r','  lookup company via=firm-link','}','']
        (ROOT/f'projects/{family}/exploreda.eda').write_text('\n'.join(lines),encoding='utf-8')
        dump(ROOT/f'evidence/fields/{family}.json',tables)
    dump(ROOT/'evidence/prepared-tables.json',TABLES)
    print('DONE',len(TABLES),'families',sum(len(t) for t in TABLES.values()),'tables')

if __name__=='__main__': prepare()
