import csv,collections,hashlib,json
D="/root/.claude/uploads/3a205be5-40b1-5be4-9429-478d602d5b27/12119eb9-1792333609777_KneRainDaily_export.csv"
M="/root/.claude/uploads/3a205be5-40b1-5be4-9429-478d602d5b27/43adc825-1792334380735_KneRain_export.csv"
heb={"ספטמבר":9,"אוקטובר":10,"נובמבר":11,"דצמבר":12,"ינואר":1,"פברואר":2,"מרץ":3,"אפריל":4,"מאי":5}
def ss(l):
    a=int(l.strip().split('/')[0]); return 1900+a if a>=50 else 2000+a
mon={}
for r in csv.DictReader(open(M,encoding='utf-8-sig')):
    s=ss(r['שנה'])
    if s>=2026: continue   # 26/27 placeholder, season not started in the data
    for h,m in heb.items(): mon[(s if m>=9 else s+1,m,s)]=float(r[h])
day=collections.defaultdict(float); cnt=collections.Counter()
for r in csv.DictReader(open(D)):
    y,m=int(r['date'][:4]),int(r['date'][5:7]); day[(y,m)]+=float(r['rainfall']); cnt[(y,m)]+=1
out=[]
for (y,m,s),mv in sorted(mon.items()):
    dv=round(day.get((y,m),0),1); n=cnt.get((y,m),0)
    if (y,m)<(1976,10):
        src,val,rev,note="monthly",mv,False,"before daily reports"
    elif n==0 and mv>0:
        gap=(2024,9)<=(y,m)<=(2024,12)
        src,val,rev,note="monthly",mv,not gap,("daily reports missing (autumn 2024)" if gap else "no daily reports this month")
    elif abs(dv-mv)<=1.05:
        src,val,rev,note="daily",dv,False,None if abs(dv-mv)<0.05 else "rounding"
    elif (1985,1)<=(y,m)<=(1985,4):
        src,val,rev,note="daily",dv,False,"monthly file shifted by one month from January 1985"
    elif (y,m) in ((2009,9),(2009,10)):
        src,val,rev,note="daily",dv,False,"9.7 mm on 19-20 Sep 2009 counted in October in the monthly file"
    else:
        src,val,rev,note="daily",dv,True,"to check against original records"
    out.append(dict(year=y,month=m,season=s,mm=round(val,1),daily=dv if (y,m)>=(1976,10) else None,monthly=mv,src=src,rev=rev,note=note))
json.dump(out,open(f"{__import__('sys').argv[1]}/merged.json","w"))
print(len(out),"rows; review",sum(o['rev'] for o in out))
st=collections.defaultdict(float)
for o in out: st[o['season']]+=o['mm']
print({f"{k%100:02d}/{(k+1)%100:02d}":round(v,1) for k,v in sorted(st.items())})
sig=";".join(f"{o['year']}-{o['month']:02d}={o['mm']:.1f}" for o in out)
print("md5",hashlib.md5(sig.encode()).hexdigest(), "total", round(sum(o['mm'] for o in out),1))
def q(x): return "null" if x is None else ("'"+x.replace("'","''")+"'")
def n(x): return "null" if x is None else f"{x:.1f}"
vals=",".join(f"({o['year']},{o['month']},{o['season']},{o['mm']:.1f},'{o['src']}',{str(o['rev']).lower()},{n(o['daily'])},{n(o['monthly'])},{q(o['note'])})" for o in out)
open(f"{__import__('sys').argv[1]}/monthly.sql","w").write("insert into public.rain_monthly (year, month, season_start, rainfall_mm, source, needs_review, daily_sum_mm, monthly_file_mm, note) values "+vals+";")
