"""Package the already-built extension deterministically. Never uploads anything."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text())['version']
manifest=json.loads((root/'dist/manifest.json').read_text())
assert manifest['version']==version
assert '<all_urls>' not in manifest.get('host_permissions',[])
assert not (root/'dist/harness.js').exists()
out=root/'release';out.mkdir(exist_ok=True)
files=sorted(p for p in (root/'dist').rglob('*') if p.is_file())
archive=out/f'ghostmask-{version}.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:
  info=zipfile.ZipInfo(p.relative_to(root/'dist').as_posix(),date_time=(2026,1,1,0,0,0))
  info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16
  z.writestr(info,p.read_bytes())
record={'version':version,'archive':archive.name,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(files),'bytes':archive.stat().st_size,'scope':'Local developer-loaded review release. See V2_RELEASE_REPORT.md.'}
(out/f'ghostmask-{version}.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
