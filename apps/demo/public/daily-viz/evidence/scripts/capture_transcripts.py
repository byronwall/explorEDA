#!/usr/bin/env python3
"""Selected-field transcriptions from read-only GitHub results.
See acquisition.json and source-capture.json for exact repository blobs and scopes.
This script reproduces the captures; it does not claim to download them.
"""
from pathlib import Path
import csv,json,hashlib,io
ROOT=Path(__file__).resolve().parents[2]
raw=ROOT/'evidence/raw'
# All 48 GROUP-STAGE final scores in the retrieved cup.txt. No halftime fields.
football='''group,date,team1,team2,goals1,goals2
A,2018-06-14,Russia,Saudi Arabia,5,0
A,2018-06-15,Egypt,Uruguay,0,1
A,2018-06-19,Russia,Egypt,3,1
A,2018-06-20,Uruguay,Saudi Arabia,1,0
A,2018-06-25,Uruguay,Russia,3,0
A,2018-06-25,Saudi Arabia,Egypt,2,1
B,2018-06-15,Morocco,Iran,0,1
B,2018-06-15,Portugal,Spain,3,3
B,2018-06-20,Portugal,Morocco,1,0
B,2018-06-20,Iran,Spain,0,1
B,2018-06-25,Iran,Portugal,1,1
B,2018-06-25,Spain,Morocco,2,2
C,2018-06-16,France,Australia,2,1
C,2018-06-16,Peru,Denmark,0,1
C,2018-06-21,Denmark,Australia,1,1
C,2018-06-21,France,Peru,1,0
C,2018-06-26,Denmark,France,0,0
C,2018-06-26,Australia,Peru,0,2
D,2018-06-16,Argentina,Iceland,1,1
D,2018-06-16,Croatia,Nigeria,2,0
D,2018-06-21,Argentina,Croatia,0,3
D,2018-06-22,Nigeria,Iceland,2,0
D,2018-06-26,Nigeria,Argentina,1,2
D,2018-06-26,Iceland,Croatia,1,2
E,2018-06-17,Costa Rica,Serbia,0,1
E,2018-06-17,Brazil,Switzerland,1,1
E,2018-06-22,Brazil,Costa Rica,2,0
E,2018-06-22,Serbia,Switzerland,1,2
E,2018-06-27,Serbia,Brazil,0,2
E,2018-06-27,Switzerland,Costa Rica,2,2
F,2018-06-17,Germany,Mexico,0,1
F,2018-06-18,Sweden,South Korea,1,0
F,2018-06-23,South Korea,Mexico,1,2
F,2018-06-23,Germany,Sweden,2,1
F,2018-06-27,South Korea,Germany,2,0
F,2018-06-27,Mexico,Sweden,0,3
G,2018-06-18,Belgium,Panama,3,0
G,2018-06-18,Tunisia,England,1,2
G,2018-06-23,Belgium,Tunisia,5,2
G,2018-06-24,England,Panama,6,1
G,2018-06-28,England,Belgium,0,1
G,2018-06-28,Panama,Tunisia,1,2
H,2018-06-19,Colombia,Japan,1,2
H,2018-06-19,Poland,Senegal,1,2
H,2018-06-24,Japan,Senegal,2,2
H,2018-06-24,Poland,Colombia,0,3
H,2018-06-28,Japan,Poland,0,1
H,2018-06-28,Senegal,Colombia,0,1
'''
(raw/'worldcup-group-matches.csv').write_text(football)
# First 60 artist records in Tate's alphabetical CSV; selected columns only.
# Birth/death years remain AS RECORDED IN OCTOBER 2014, not current biographies.
tate='''id|name|birth_year|death_year
10093|Abakanowicz, Magdalena|1930|
0|Abbey, Edwin Austin|1852|1911
2756|Abbott, Berenice|1898|1991
1|Abbott, Lemuel Francis|1760|1803
622|Abrahams, Ivor|1935|
2606|Absalon|1964|1993
9550|Abts, Tomma|1967|
623|Acconci, Vito|1940|
624|Ackling, Roger|1947|2014
625|Ackroyd, Norman|1938|
2411|Adam, Robert|1728|1792
626|Adams, Harry William|1868|1947
627|Adams, Norman|1927|2005
628|Adams, Robert|1917|1984
629|Adeney, Bernard|1878|1966
630|Adler, Jankel|1895|1949
2608|Adshead, Mary|1904|1995
631|Adzak, Roy|1927|1987
632|Afro|1912|1976
633|Agar, Eileen|1899|1991
2|Agasse, Jacques Laurent|1767|1849
3098|Ahtila, Eija-Liisa|1959|
8208|Ai, Weiwei|1957|
634|Aitchison, Craigie|1926|2009
635|Ajmone, Giuseppe|1923|2005
14744|Aksel, Erdag|1953|
7794|Al-Ani, Jananne|1966|
3067|Albers, Anni|1899|1994
636|Albers, Josef|1888|1976
637|Albright, Ivan|1897|1983
638|Aldridge, John|1905|1983
639|Alechinsky, Pierre|1927|
640|Alexander, Edwin|1870|1926
2470|Alexander, William|1767|1816
11315|Alimpiev, Victor|1973|
2472|Alken Family|1756|1894
3|Alken, Henry Thomas|1785|1851
2471|Alken, Samuel, Senior|1756|1815
2473|Allan, David|1744|1796
641|Allan, Julian Phelps|1892|1996
4|Allan, Sir William|1782|1850
2304|Allen, George Warner|1916|1988
5|Allen, Joseph William|1803|1852
12153|Allen, Phillip|1967|
12520|Allen, Richard|1933|1999
642|Alley, Anthea|1927|1993
643|Allington, Edward|1951|
644|Allinson, Adrian|1890|1959
2273|Allom, Thomas|1804|1872
6259|Allora, Jennifer|1974|
6|Alma-Tadema, Sir Lawrence|1836|1912
12989|Almeida, Helena|1934|
2657|Almond, Darren|1971|
7620|Althamer, Pawel|1967|
645|Altoon, John|1925|1969
4427|Alÿs, Francis|1959|
7|Amiconi, Giacomo|1682|1752
646|Amiet, Cuno|1868|1961
7533|Amorales, Carlos|1970|
647|Amuchastegui, Axel|1921|2002
'''
rows=list(csv.reader(io.StringIO(tate),delimiter='|'))
assert len(rows)==61
with (raw/'tate-artists-prefix.csv').open('w',newline='') as f:csv.writer(f,lineterminator='\n').writerows(rows)
