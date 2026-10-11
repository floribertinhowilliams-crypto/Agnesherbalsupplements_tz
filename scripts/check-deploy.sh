#!/usr/bin/env bash
# Hukagua kama Functions na kurasa muhimu zinajibu baada ya deploy.
# Matumizi: bash scripts/check-deploy.sh [https://agnesherbalsupplements.com]
BASE="${1:-https://agnesherbalsupplements.com}"
fail=0
check() { # njia, status inayotarajiwa, [method]
  local path="$1" want="$2" method="${3:-GET}"
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" -m 20 "$BASE$path")
  if [ "$got" = "$want" ]; then echo "OK    $got  $method $path"; else echo "FAIL  $got (tarajio $want)  $method $path"; fail=1; fi
}
echo "== Kurasa tuli (hazihitaji Functions) =="
check "/" 200
check "/sitemap.xml" 200
check "/products/p0-28-day-slimming-tea" 200
echo "== Functions (zikishindwa = 404) =="
check "/orodha/" 200
check "/catalog.json" 200
check "/llms-full.txt" 200
check "/sitemap-products-live.xml" 200
[ $fail = 0 ] && echo "SAWA: kila kitu kinafanya kazi." || echo "KUNA TATIZO: angalia DEPLOY.md"
exit $fail
