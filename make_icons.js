// Dependency-free PNG icon generator for Meridian.
// Draws a brass "meridian" mark (bisected ring) on near-black, with 4x supersampling.
const zlib = require('zlib'), fs = require('fs');

const CT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf){ let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CT[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function chunk(type, data){ const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const cd = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(cd), 0); return Buffer.concat([len, cd, crc]); }
function png(w, h, rgba){
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4); ihdr[8]=8; ihdr[9]=6;
  const stride = w*4, raw = Buffer.alloc((stride+1)*h);
  for (let y=0;y<h;y++){ raw[y*(stride+1)]=0; rgba.copy(raw, y*(stride+1)+1, y*stride, y*stride+stride); }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, {level:9})), chunk('IEND', Buffer.alloc(0))]);
}
function makeIcon(size){
  const buf = Buffer.alloc(size*size*4);
  const cx = size/2, cy = size/2, R = size*0.32, ringT = size*0.058, lineT = size*0.034;
  const bg = [0x0A,0x09,0x08], brass = [0xB8,0x9B,0x5E];
  const SS = [[0.25,0.25],[0.75,0.25],[0.25,0.75],[0.75,0.75]];
  for (let y=0;y<size;y++) for (let x=0;x<size;x++){
    let r=0,g=0,b=0;
    for (const [ox,oy] of SS){
      const dx=(x+ox)-cx, dy=(y+oy)-cy, d=Math.hypot(dx,dy);
      const isRing = Math.abs(d-R) <= ringT/2;
      const isLine = Math.abs(dy) <= lineT/2 && d <= R;
      const c = (isRing||isLine) ? brass : bg;
      r+=c[0]; g+=c[1]; b+=c[2];
    }
    const i=(y*size+x)*4; buf[i]=r/4|0; buf[i+1]=g/4|0; buf[i+2]=b/4|0; buf[i+3]=255;
  }
  return png(size, size, buf);
}
[180,192,512].forEach(s => { fs.writeFileSync(`${__dirname}/icon-${s}.png`, makeIcon(s)); console.log('wrote icon-'+s+'.png'); });
