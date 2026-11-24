import{test}from'node:test';import assert from'node:assert/strict';import{validatePngDataUrl,recognizeLocal}from'../src/ocr.ts';
test('OCR refuses remote images, malformed PNG headers and pre-cancelled work',async()=>{
 for(const input of ['https://example.test/raw.png','data:image/png;base64,AAAA','data:image/jpeg;base64,AAAA'])assert.throws(()=>validatePngDataUrl(input));
 const bytes=Buffer.alloc(32);Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);bytes.write('IHDR',12);bytes.writeUInt32BE(1,16);bytes.writeUInt32BE(1,20);
 const image='data:image/png;base64,'+bytes.toString('base64');assert.deepEqual(validatePngDataUrl(image),{width:1,height:1});
 const abort=new AbortController();abort.abort();await assert.rejects(recognizeLocal(image,abort.signal),/TASK_PAUSED/);
 bytes.writeUInt32BE(20000,16);bytes.writeUInt32BE(20000,20);assert.throws(()=>validatePngDataUrl('data:image/png;base64,'+bytes.toString('base64')));
});
