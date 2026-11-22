#!/usr/bin/env python3
"""Gera sitemap.xml apenas após um domínio real ser registrado.
Execução: python scripts/gerar_sitemap.py https://dominio-registrado.com.br
"""
from pathlib import Path
from urllib.parse import urlparse
import sys
from xml.sax.saxutils import escape
if len(sys.argv) != 2:
    raise SystemExit("Uso: python scripts/gerar_sitemap.py https://DOMINIO-REAL")
url=sys.argv[1].rstrip('/')
p=urlparse(url)
if p.scheme != 'https' or not p.netloc or p.path or p.query or p.fragment or p.netloc.endswith(('.example','.test','.invalid')):
    raise SystemExit('Informe a origem HTTPS de um domínio realmente registrado, sem caminho.')
root=Path(__file__).resolve().parents[1]
pages=sorted(root.glob('*.html'))
lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for page in pages:
    loc=url+'/' + ('' if page.name == 'index.html' else page.name)
    lines.append('  <url><loc>'+escape(loc)+'</loc></url>')
lines.append('</urlset>')
(root/'sitemap.xml').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Sitemap gerado para',url,'com',len(pages),'páginas.')
