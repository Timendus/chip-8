!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t){function n(e,t=" "){return Array.from(e).map(e=>r(e)).join(t)}function r(e){return parseInt(e,10).toString(16).padStart(2,"0")}e.exports={bin2str:n,byte2str:r,word2str:function(e){return n([(65280&e)/256,255&e])}}},function(e,t,n){const r=n(0),o=n(2),s=n(6);async function a(e){const t=e.ram[e.pc],n=e.ram[e.pc+1],a=r.bin2str([t,n],""),d=e.pc;let i="UNKNOWN INSTRUCTION";for(let r in o)if(a.match(new RegExp(r,"i"))){i=await o[r]({highByte:t,lowByte:n,state:e,nnn:256*(15&t)+n,nn:n,n:15&n,x:15&t,y:(240&n)>>4});break}e.sd&&(s.render(e),e.sd=!1);const c=`${r.word2str(d)}:\t${a}\t${i}\n`;"UNKNOWN INSTRUCTION"==i?console.error(c):e.debugging.opcodes&&console.info(c),e.pc+=2}e.exports={new:()=>({pc:512,sp:3839,i:0,v:new Uint8Array(16),ram:new Uint8Array(4096),sd:!1,delay:0,sound:0,debugging:{debugger:!1,opcodes:!1}}),tenSteps:async e=>{for(let t=0;t<10;t++)await a(e)},step:a}},function(e,t,n){const r=n(0),o=n(5);e.exports={"00E0":({state:e})=>{for(let t=3840;t<=4095;t++)e.ram[t]=0;return e.sd=!0,"cls"},"00EE":({state:e,disassemble:t})=>t?"ret":(e.sp+=2,e.pc=256*e.ram[e.sp-0]+e.ram[e.sp-1],`ret (to ${r.word2str(e.pc)})`),"0...":({state:e,nnn:t})=>(console.error("RCA 1802 Not implemented"),`rca 1802 call ${r.word2str(t)}`),"1...":({state:e,nnn:t})=>(e.pc=t-2,`jp ${r.word2str(t)}`),"2...":({state:e,nnn:t})=>(e.ram[e.sp-0]=(65280&e.pc)/256,e.ram[e.sp-1]=255&e.pc,e.sp-=2,e.pc=t-2,`call ${r.word2str(t)}`),"3...":({state:e,x:t,nn:n})=>(e.v[t]===n&&(e.pc+=2),`se v${t}, ${r.byte2str(n)}`),"4...":({state:e,x:t,nn:n})=>(e.v[t]!==n&&(e.pc+=2),`sne v${t}, ${r.byte2str(n)}`),"5..0":({state:e,x:t,y:n})=>(e.v[t]===e.v[n]&&(e.pc+=2),`se v${t}, v${n}`),"6...":({state:e,x:t,nn:n})=>(e.v[t]=n,`ld v${t}, ${r.byte2str(n)}`),"7...":({state:e,x:t,nn:n})=>(e.v[t]+=n,`add v${t}, ${r.byte2str(n)}`),"8..0":({state:e,x:t,y:n})=>(e.v[t]=e.v[n],`ld v${t}, v${n}`),"8..1":({state:e,x:t,y:n})=>(e.v[t]|=e.v[n],`or v${t}, v${n}`),"8..2":({state:e,x:t,y:n})=>(e.v[t]&=e.v[n],`and v${t}, v${n}`),"8..3":({state:e,x:t,y:n})=>(e.v[t]^=e.v[n],`xor v${t}, v${n}`),"8..4":({state:e,x:t,y:n})=>(e.v[15]=e.v[t]+e.v[n]>255?1:0,e.v[t]+=e.v[n],`add v${t}, v${n}`),"8..5":({state:e,x:t,y:n})=>(e.v[15]=e.v[n]>e.v[t]?0:1,e.v[t]-=e.v[n],`sub v${t}, v${n}`),"8..6":({state:e,x:t})=>(e.v[15]=1&e.v[t]?1:0,e.v[t]=e.v[t]>>1,`shr v${t}`),"8..7":({state:e,x:t,y:n})=>(e.v[15]=e.v[t]>e.v[n]?0:1,e.v[t]=e.v[n]-e.v[t],`subn v${t}, v${n}`),"8..E":({state:e,x:t})=>(e.v[15]=128&e.v[t]?1:0,e.v[t]=e.v[t]<<1,`shl v${t}`),"9..0":({state:e,x:t,y:n})=>(e.v[t]!==e.v[n]&&(e.pc+=2),`sne v${t}, v${n}`),"A...":({state:e,nnn:t})=>(e.i=t,`ld i, ${r.word2str(t)}`),"B...":({state:e,nnn:t})=>(e.pc=t+e.v[0]-2,`jp v0, ${r.word2str(t)}`),"C...":({state:e,x:t,nn:n})=>(e.v[t]=Math.floor(256*Math.random())&n,`rnd v${t}, ${r.byte2str(n)}`),"D...":({state:e,x:t,y:n,n:o})=>{const s=e.v[t],a=e.v[n],d=Math.floor(8*a+s/8);let i=!1;for(let t=0;t<o;t++){const n=e.ram[e.i+t];i|=!!(e.ram[3840+d+8*t+0]&n>>s%8)||!!(e.ram[3840+d+8*t+1]&n<<8-s%8&255),e.ram[3840+d+8*t+0]^=n>>s%8,e.ram[3840+d+8*t+1]^=n<<8-s%8&255}return e.sd=!0,e.v[15]=i?1:0,`drw v${t}, v${n}, ${o} (with ${r.word2str(e.i)} in i)`},"E.9E":({state:e,x:t})=>(o.pressed(e.v[t])&&(e.pc+=2),`skp v${t}`),"E.A1":({state:e,x:t})=>(o.pressed(e.v[t])||(e.pc+=2),`sknp v${t}`),"F.07":({state:e,x:t})=>(e.v[t]=e.delay,`ld v${t}, dt`),"F.0A":({state:e,x:t,disassemble:n})=>n?`getkey v${t}`:o.waitPress().then(n=>(e.v[t]=n,`getkey v${t}`)),"F.15":({state:e,x:t})=>(e.delay=e.v[t],`ld dt, v${t}`),"F.18":({state:e,x:t})=>(e.sound=e.v[t],`ld st, v${t}`),"F.1E":({state:e,x:t})=>(e.i=e.i+e.v[t]&4095,`add i, v${t}`),"F.29":({state:e,x:t})=>(e.i=5*e.v[t],`getfont v${t}`),"F.33":({state:e,x:t})=>(e.ram[e.i+0]=e.v[t]/100,e.ram[e.i+1]=e.v[t]%100/10,e.ram[e.i+2]=e.v[t]%10,`bcd (i), v${t}`),"F.55":({state:e,x:t})=>{for(let n=0;n<=t;n++)e.ram[e.i+n]=e.v[n];return`ld (i), v0-v${t}`},"F.65":({state:e,x:t})=>{for(let n=0;n<=t;n++)e.v[n]=e.ram[e.i+n];return`ld v0-v${t}, (i)`}}},function(e,t,n){n(0);const r=n(4),o=n(1),s=n(7),a=n(8),d=n(9),i=n(10);let c,l,v=!0;const u={debugger:!1,opcodes:!1};function g(e){l=e,c=o.new(),c.debugging=u,s.load(c),a.connect(c),d.connect(c),console.info(`Program read from disk:\n\n${i.disassemble(e)}\n\nLoading into RAM...`),writePointer=512;for(let t of e)c.ram[writePointer]=t,writePointer++;console.info("Starting program..."),v&&p()}function p(){v&&setTimeout(()=>{o.tenSteps(c).then(()=>{r.render(c),p()})},17)}document.getElementById("upload").addEventListener("change",e=>{if(0==e.target.files.length)return;const t=new FileReader;t.addEventListener("load",e=>g(new Uint8Array(t.result))),t.readAsArrayBuffer(e.target.files[0])}),document.getElementById("play").addEventListener("click",()=>{v=!v,v&&requestAnimationFrame(p),document.getElementById("play").innerText=v?"Pause":"Play",document.getElementById("step").disabled=v}),document.getElementById("step").addEventListener("click",()=>{o.step(c).then(()=>r.render(c))}),document.getElementById("reset").addEventListener("click",()=>{g(l)}),document.getElementById("show_dbg").addEventListener("click",()=>{u.debugger=!u.debugger,c&&(c.debugging=u),document.getElementById("show_dbg").classList.toggle("active"),u.debugger||(document.getElementById("debugger").innerText="")}),document.getElementById("show_opc").addEventListener("click",()=>{u.opcodes=!u.opcodes,c&&(c.debugging=u),document.getElementById("show_opc").classList.toggle("active")})},function(e,t,n){const r=n(0),o=document.getElementById("debugger");e.exports={render:e=>{e.debugging.debugger&&(o.innerText=`\nPC: ${r.word2str(e.pc)}      SP: ${r.word2str(e.sp)}\n\n I: ${r.word2str(e.i)}       V: ${r.bin2str(e.v)}\n\nRAM:\n${r.bin2str(e.ram)}`)}}},function(e,t){const n=new Array(16);e.exports={pressed:e=>n[e],waitPress:()=>new Promise((e,t)=>{let r=setInterval(()=>{n.every(e=>!e)&&(clearInterval(r),r=setInterval(()=>{for(let t in n)if(n[t])return clearInterval(r),e(t)},10))},10)})};const r={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,b:11,c:12,d:13,e:14,f:15,ArrowUp:2,ArrowDown:8,ArrowLeft:4,ArrowRight:6," ":5};function o(e,t){const r=e.substr(3);n[r]=t}window.addEventListener("keydown",e=>{if(null==r[e.key])return;n[r[e.key]]=!0;const t=document.getElementById("Btn"+r[e.key]);t&&t.classList.add("active"),e.preventDefault()}),window.addEventListener("keyup",e=>{if(null==r[e.key])return;n[r[e.key]]=!1;const t=document.getElementById("Btn"+r[e.key]);t&&t.classList.remove("active"),e.preventDefault()}),document.querySelectorAll(".keyboard button").forEach(e=>{e.addEventListener("mousedown",e=>o(e.target.id,!0)),e.addEventListener("touchstart",e=>o(e.target.id,!0))}),document.querySelectorAll(".keyboard button").forEach(e=>{e.addEventListener("mouseup",e=>o(e.target.id,!1)),e.addEventListener("touchstop",e=>o(e.target.id,!1))})},function(e,t){const n=document.getElementById("display"),r=n.getContext("2d");n.width=64,n.height=32,e.exports={render:e=>{const t=r.createImageData(64,32);for(let n=0;n<32;n++)for(let r=0;r<64;r++){const o=Math.floor(64*n/8+r/8),s=r%8,a=64*n*4+4*r;t.data[a+0]=e.ram[3840+o]&128>>s?85:204,t.data[a+1]=e.ram[3840+o]&128>>s?85:204,t.data[a+2]=e.ram[3840+o]&128>>s?85:204,t.data[a+3]=255}r.putImageData(t,0,0)}}},function(e,t){const n=new Uint8Array([96,144,144,144,96,32,96,32,32,112,224,16,96,128,240,224,16,96,16,224,128,144,240,16,16,240,128,224,16,224,96,128,224,144,96,240,16,32,64,64,96,144,96,144,96,96,144,112,16,96,96,144,240,144,144,224,144,224,144,224,112,128,128,128,112,224,144,144,144,224,240,128,240,128,240,240,128,240,128,128]);e.exports={load:e=>{for(let t=0;t<n.length;t++)e.ram[t]=n[t]}}},function(e,t){e.exports={connect:e=>{setInterval(()=>{e.delay>0&&e.delay--,e.sound>0&&e.sound--},17)}}},function(e,t){e.exports={connect:e=>{const t=new(window.AudioContext||window.webkitAudioContext||window.audioContext),n=t.createOscillator(),r=t.createGain();r.gain.value=0,n.frequency.value=600,n.type="triangle",n.connect(r),r.connect(t.destination),n.start(),setInterval(()=>{e.sound>0&&(r.gain.value=.1),0==e.sound&&(r.gain.value=0)},17)}}},function(e,t,n){const r=n(0),o=n(2),s=n(1);e.exports={disassemble:e=>{const t=s.new();let n="";for(let s=0;s<e.length;s+=2){const a=e[s],d=e[s+1],i=r.bin2str([a,d],"");let c="UNKNOWN INSTRUCTION";for(let e in o)if(i.match(new RegExp(e,"i"))){c=o[e]({disassemble:!0,state:t,highByte:a,lowByte:d,nnn:256*(15&a)+d,nn:d,n:15&d,x:15&a,y:(240&d)>>4});break}n+=`${r.word2str(512+s)}:\t${i}\t${c}\n`}return n}}}]);