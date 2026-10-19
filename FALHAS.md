# FALHAS

| data | o que quebrou | menor correção | tipo |
|---|---|---|---|
| 2026-10-19 | mostratec.inema.club não abria no celular: Pages com domínio próprio ficou sem pedir certificado (https_certificate null) | tirar e recolocar o cname pela API (`gh api -X PUT .../pages -f cname=`) e depois `https_enforced=true`; conferir o CNAME do repo (o GitHub apaga e recria) | infra |
