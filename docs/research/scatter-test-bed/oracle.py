"""Independent numerical reference; not required to run the React lab.
Run with Python + NumPy + SciPy. Writes reference-oracle-rerun.json by default.
"""
from pathlib import Path
import argparse, json
import numpy as np
import scipy
from scipy.stats import f, chi2
parser = argparse.ArgumentParser(); parser.add_argument('--output', default='reference-oracle-rerun.json'); args = parser.parse_args()
# Eligibility decided explicitly, not copied from the TS helper: boolean, null,
# blank and infinity rows are not in these five pairs; numeric strings are.
pairs=np.array([[1.,2.],[2.,1.],[4.,5.],[7.,4.],[8.,9.]])
S=np.cov(pairs,rowvar=False,ddof=1)
result={'numpy':np.__version__,'scipy':scipy.__version__,'eligible_pairs':pairs.tolist(),'n':len(pairs),'excluded_pairs':3,'mean':pairs.mean(axis=0).tolist(),'covariance':S.tolist(),'standard_deviation':np.sqrt(np.diag(S)).tolist(),'pearson':float(np.corrcoef(pairs,rowvar=False)[0,1]),'principal_variances':np.linalg.eigvalsh(S)[::-1].tolist(),'chi_square_2_95':float(chi2.ppf(.95,2)),'f_quantiles':[]}
for n in [3,4,5,10,30,100,1000]:
 for coverage in [.5,.9,.95,.99]:
  value=float(f.ppf(coverage,2,n-2)); result['f_quantiles'].append({'n':n,'coverage':coverage,'F_2_nminus2':value,'mean_quadratic_threshold':2*(n-1)/(n-2)*value/n})
Path(args.output).write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
