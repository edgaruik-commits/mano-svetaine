/* EGA hero: schematic 3D production line (decorative, slowly rotating) */
(function(){
var wrap=document.getElementById('plant3d');
if(!wrap||!window.THREE)return;
var renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){wrap.style.display='none';return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setClearColor(0x000000,0);
wrap.appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x1C2126,75,150);
const camera=new THREE.PerspectiveCamera(38,1,0.1,500);
camera.position.set(-10,30,52);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.target.set(26,4.5,0);controls.enableDamping=true;controls.dampingFactor=0.08;
controls.enableZoom=false;controls.enablePan=false;controls.rotateSpeed=0.5;
controls.minPolarAngle=Math.PI*0.18;controls.maxPolarAngle=Math.PI*0.45;
controls.autoRotate=false;controls.enabled=false;renderer.domElement.style.touchAction="auto";
const touch=matchMedia('(hover: none)').matches;
if(touch){controls.enabled=false;renderer.domElement.style.touchAction='pan-y';}
scene.add(new THREE.HemisphereLight(0xffffff,0x8a8f94,0.75));
const sun=new THREE.DirectionalLight(0xffffff,0.8);sun.position.set(20,40,25);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30});
sun.target.position.set(17,0,0);scene.add(sun,sun.target);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(110,60),new THREE.MeshStandardMaterial({color:0x22292f,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.position.set(25,0,0);ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(110,110,0x3a444c,0x2b3339);grid.position.set(25,0.01,0);scene.add(grid);

const C={steel:0x9aa3aa,blue:0x2f6fa8,yellow:0xe0a321,green:0x4f8a4b,grey:0x6b747b,dark:0x3b4247,orange:0xd9731a,red:0xb5402f,belt:0x2b2b2b,white:0xdfe3e6};
const M={};const mat=c=>M[c]||(M[c]=new THREE.MeshStandardMaterial({color:c,roughness:0.55,metalness:0.35}));
function add(geo,c,x,y,z){const m=new THREE.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
const box=(w,h,d,x,y,z,c)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z);
const cyl=(rt,rb,h,x,y,z,c,s=24)=>add(new THREE.CylinderGeometry(rt,rb,h,s),c,x,y,z);
function link(a,b,r,c){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);
  const m=add(new THREE.CylinderGeometry(r,r,d.length(),16),c,0,0,0);m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  if(r>=0.14)for(const P of[A,B]){const j=add(new THREE.SphereGeometry(r*1.02,16,12),c,P.x,P.y,P.z)} // alkūnės jungtyse
  return m}
function legs(x,z,half,top){for(const sx of[-1,1])for(const sz of[-1,1])link([x+sx*half,0,z+sz*half],[x+sx*half,top,z+sz*half],0.07,C.dark)}

/* 1 Priėmimo bunkeris 5 m3 */
const BX=2.3,_b0=scene.children.length; // bunkeris pastumtas arčiau norijos
legs(0,0,1.22,3.0);box(2.7,0.12,2.7,0,2.98,0,C.dark);
for(const s of[-1.22,1.22]){link([-1.22,1.4,s],[1.22,1.4,s],0.04,C.dark);link([s,1.4,-1.22],[s,1.4,1.22],0.04,C.dark)}
box(2.6,0.9,2.6,0,3.45,0,C.yellow);
const hop=cyl(0.35,1.84,1.4,0,2.3,0,C.yellow,4);hop.rotation.y=Math.PI/4;hop.rotation.x=Math.PI;
box(2.8,0.08,2.8,0,3.92,0,C.dark);

/* Kvadratinė drosėlinė sklendė po bunkeriu, su reduktoriumi ir vairu */
{const y=1.2,s=0.8,t=0.14;
 box(s,t,0.16,0,y,-s/2+0.08,C.blue);box(s,t,0.16,0,y,s/2-0.08,C.blue);
 box(0.16,t,s,-s/2+0.08,y,0,C.blue);box(0.16,t,s,s/2-0.08,y,0,C.blue);
 for(const sx of[-1,1])for(const sz of[-1,1])cyl(0.03,0.03,0.18,sx*0.32,y,sz*0.32,C.dark,8);
 const disc=box(0.5,0.03,0.5,0,y,0,C.steel);disc.rotation.x=0.5;
 link([0,y,s/2],[0,y,0.75],0.05,C.blue);
 box(0.3,0.25,0.25,0,y,0.85,C.dark);
 const hw=add(new THREE.TorusGeometry(0.28,0.03,8,28),C.dark,0.22,y+0.05,0.85);hw.rotation.y=Math.PI/2;
 for(let k=0;k<3;k++){const a=k*Math.PI*2/3;link([0.22,y+0.05,0.85],[0.22,y+0.05+Math.sin(a)*0.27,0.85+Math.cos(a)*0.27],0.02,C.dark)}
 link([0.14,y+0.05,0.85],[0.22,y+0.05,0.85],0.03,C.dark)}
for(let i=_b0;i<scene.children.length;i++)scene.children[i].position.x+=BX;

/* 2 Sraigtinis transporteris */
link([BX,1.5,0],[BX,0.7,0],0.2,C.grey);
link([BX,0.6,0],[4.6,0.6,0],0.24,C.blue);
cyl(0.3,0.3,0.5,BX-0.4,0.6,0,C.dark).rotation.z=Math.PI/2;

/* 3 Kaušinis elevatorius 12 m */
function elevator(x,z,h,c){box(0.9,1.2,0.7,x,0.6,z,c);box(0.6,h-0.5,0.4,x,(h-0.5)/2+0.6,z,c);box(1.1,1.0,0.8,x+0.1,h+0.4,z,c);
  for(let y=2;y<h;y+=2.5)box(0.9,0.06,0.7,x,y,z,C.dark)}
elevator(5,0,12,C.blue);
link([5.6,12.4,0],[8,11.6,0],0.16,C.grey);

/* 4 Žaliavos silosas 20 m3 */
/* Stiklo pluošto silosas: aukštas cilindras, status kūgis apačioje, žemas kūginis stogas su kakleliu, kojos su X ryšiais */
const GRP=0xa3b99c;
function silo(x,z){const R=1.2,yb=3.0,hc=2.2,hcy=5.4,top=yb+hc+hcy,lt=yb+hc,lm=lt/2;
  cyl(R,0.18,hc,x,yb+hc/2,z,GRP,40);cyl(R,R,hcy,x,yb+hc+hcy/2,z,GRP,40);cyl(0.28,R,0.55,x,top+0.27,z,GRP,40);
  cyl(0.22,0.26,0.45,x,top+0.75,z,GRP,16);cyl(0.14,0.14,0.25,x+0.6,top+0.25,z+0.2,GRP,12);
  const mh=cyl(0.2,0.2,0.06,x,yb+hc+0.5,z+R,C.white,20);mh.rotation.x=Math.PI/2;
  cyl(0.12,0.12,0.25,x,yb-0.1,z,C.dark,12);
  const L=[0,1,2,3].map(k=>{const a=Math.PI/4+k*Math.PI/2;return[x+Math.cos(a)*(R+0.05),z+Math.sin(a)*(R+0.05)]});
  L.forEach(([lx,lz])=>{link([lx,0,lz],[lx,yb+hc,lz],0.07,C.steel);box(0.35,0.04,0.35,lx,0.02,lz,C.steel)});
  for(let k=0;k<4;k++){const[a1,b1]=L[k],[a2,b2]=L[(k+1)%4];
    link([a1,0.2,b1],[a2,lm,b2],0.03,C.steel);link([a2,0.2,b2],[a1,lm,b1],0.03,C.steel);
    link([a1,lm,b1],[a2,lt-0.1,b2],0.03,C.steel);link([a2,lm,b2],[a1,lt-0.1,b1],0.03,C.steel);
    link([a1,lm,b1],[a2,lm,b2],0.035,C.steel)}}
silo(8,0);
/* Purintuvas (vibracinis iškrovimo aktyvatorius) po žaliavos silosu */
{const x=8,y=2.75;
 cyl(0.62,0.62,0.12,x,y+0.38,0,C.blue,32);       // jungties flanšas
 cyl(0.12,0.12,0.18,x,y+0.25,0,C.dark,16);        // lanksti rankovė
 cyl(0.6,0.2,0.45,x,y,0,C.blue,32);               // vibruojantis dubuo
 cyl(0.16,0.16,0.2,x,y-0.3,0,C.dark,16);          // išėjimas
 for(const sz of[-1,1]){const m=cyl(0.13,0.13,0.4,x,y+0.02,sz*0.72,C.orange,16);m.rotation.x=Math.PI/2;
  box(0.2,0.2,0.08,x,y+0.02,sz*0.55,C.dark)}       // 2 vibrovarikliai
}

/* 5 Juostinis dozuojantis konvejeris */
box(5.75,0.18,0.7,10.1,4.7,0,C.belt).rotation.z=0.748;
link([8,2.75,0],[12.2,6.65,0],0.05,C.dark);
legs(9.4,0,0.3,4.0);legs(11.2,0,0.3,5.6);

/* Dozavimo bunkeriukas džiovyklės įėjime su vibromotoru */
{const x=12.3,y=5.95;
 const hb=cyl(0.62,0.18,0.8,x,y,0,C.yellow,4);hb.rotation.y=Math.PI/4;
 box(0.92,0.06,0.92,x,y+0.42,0,C.dark);
 cyl(0.12,0.12,0.2,x,y-0.48,0,C.dark,12);
 box(0.3,0.3,0.06,x,y,0.3,C.dark);
 const vm=cyl(0.11,0.11,0.32,x,y,0.45,C.orange,16);vm.rotation.x=Math.PI/2;}

/* 6 Būgninė džiovyklė su dujiniu degikliu */
const CON=0xb8b3a8; // betonas
box(1.1,1.8,1.6,12.2,4.6,0,C.red);              // degiklio/padavimo galva
legs(12.2,0,0.45,3.7);
link([11.4,4.6,0],[10.6,4.6,0],0.32,C.red);       // degiklis
link([10.6,4.6,0],[10.6,0.4,-1.2],0.06,C.yellow); // dujų linija
const drum=add(new THREE.CylinderGeometry(0.95,0.95,10,32,1,true),C.steel,0,0,0);
drum.material=new THREE.MeshStandardMaterial({color:C.steel,roughness:0.5,metalness:0.6,side:THREE.DoubleSide});
drum.position.set(17.8,4.4,0);drum.rotation.z=Math.PI/2-0.014; // nuolydis 0,8°
for(const x of[14.8,20.8]){const yy=4.4-(x-17.8)*0.014;const r=add(new THREE.TorusGeometry(1.0,0.09,10,40),C.dark,x,yy,0);r.rotation.y=Math.PI/2;
  box(1.4,3.0,2.2,x,1.5,0,CON);                    // betoninė kolona 3 m
  box(1.6,0.12,2.4,x,3.06,0,C.dark);               // plokštė
  for(const sz of[-0.55,0.55]){const rl=cyl(0.22,0.22,0.3,x,yy-0.98,sz,C.grey,16);rl.rotation.z=Math.PI/2;box(0.5,yy-0.98-3.1,0.3,x,(yy-0.98+3.1)/2,sz,C.dark)}} // atraminiai ritinėliai

/* 7 Iškrovimo galva + išmetamas oras */
box(1.2,2.6,2.0,23.4,4.6,0,C.red);
legs(23.4,0,0.5,3.3);
link([23.4,3.3,0],[24.1,3.1,0],0.2,C.steel);     // latakas į aušintuvą
link([23.4,5.9,0],[23.4,7.2,0],0.35,C.steel);
link([23.4,7.2,0],[23.4,7.2,-3.5],0.35,C.steel);

/* 8 Ciklonas */
cyl(0.85,0.85,1.8,23.4,4.9,-4.3,C.steel,28);cyl(0.85,0.18,2.0,23.4,3.0,-4.3,C.steel,28);
legs(23.4,-4.3,0.62,4.05);box(1.5,0.1,1.5,23.4,3.95,-4.3,C.dark);
for(const[a,b]of[[[-0.62,-0.62],[0.62,-0.62]],[[-0.62,0.62],[0.62,0.62]],[[-0.62,-0.62],[-0.62,0.62]],[[0.62,-0.62],[0.62,0.62]]])link([23.4+a[0],1.6,-4.3+a[1]],[23.4+b[0],1.6,-4.3+b[1]],0.04,C.dark);
const crv=cyl(0.2,0.2,0.32,23.4,1.75,-4.3,C.orange,16);crv.rotation.x=Math.PI/2;box(0.22,0.22,0.22,23.4,1.75,-3.95,C.dark); // rotax
link([23.4,1.55,-4.3],[23.4,1.15,-4.3],0.08,C.grey);
box(0.9,1.0,0.9,23.4,0.55,-4.3,C.white); // didmaišis
link([23.4,7.2,-3.5],[23.4,5.4,-3.5],0.35,C.steel); // įėjimas į cikloną
link([23.4,5.8,-4.3],[23.4,8.5,-4.3],0.3,C.steel);link([23.4,8.5,-4.3],[23.4,8.5,-8.6],0.3,C.steel);link([23.4,8.5,-8.6],[23.4,7.6,-8.6],0.3,C.steel);

/* 9 Rankovinis filtras + ventiliatorius + kaminas */
legs(23.4,-9,1.1,4.35);cyl(1.66,0.2,1.9,23.4,3.35,-9,C.green,4).rotation.y=Math.PI/4; // siaurėjantis bunkeris
{const r=cyl(0.24,0.24,0.38,23.4,2.15,-9,C.orange,20);r.rotation.x=Math.PI/2;box(0.26,0.26,0.26,23.4,2.15,-8.68,C.dark);
 box(0.36,0.06,0.36,23.4,2.38,-9,C.dark);box(0.36,0.06,0.36,23.4,1.92,-9,C.dark); // rotax
 link([23.4,1.9,-9],[23.4,1.1,-9],0.08,C.grey);box(0.9,1.0,0.9,23.4,0.55,-9,C.white)} // didžmaišis
box(2.4,3.2,2.4,23.4,5.9,-9,C.green);box(2.5,0.2,2.5,23.4,7.6,-9,C.dark);
link([23.4,7.0,-10.2],[23.4,7.0,-11.4],0.3,C.steel);
cyl(1.1,1.1,0.75,23.4,1.3,-11.8,C.blue,32).rotation.z=Math.PI/2; // pagrindinis ventiliatorius
box(0.9,0.7,0.7,22.4,0.5,-11.8,C.dark);box(1.2,0.15,1.4,22.6,0.08,-11.8,C.dark);
link([23.4,7.0,-11.4],[23.4,1.9,-11.8],0.3,C.steel);
cyl(0.38,0.42,16,26,8,-11.8,C.grey);link([23.9,1.6,-11.8],[25.6,1.6,-11.8],0.3,C.steel);

/* 10 Vibracinis aušintuvas */
const TILT=6*Math.PI/180; // 6° nuolydis link sijotuvo
const cooler=box(5,0.55,1.3,26.1,2.65,0,C.blue);cooler.rotation.z=-TILT;
for(const x of[24.2,28]){const yb=2.65-0.275-(x-26.1)*Math.tan(TILT);
  for(const z of[-0.5,0.5]){link([x,0,z],[x,yb-0.5,z],0.08,C.dark);cyl(0.12,0.12,0.5,x,yb-0.25,z,C.orange,10)}} // atramos + spyruoklės
for(const z of[-0.5,0.5])link([24.2,1.0,z],[28,1.0,z],0.04,C.dark);
box(4.6,0.5,1.0,26.1,3.2,0,C.steel).rotation.z=-TILT;link([26.1,3.45,0],[26.1,3.6,-1.5],0.18,C.steel); // oro nuotraukimas
box(0.8,0.5,0.5,24.5,2.82,0.9,C.dark); // vibromotorai
link([28.6,2.25,0],[29.15,1.75,0],0.16,C.steel); // latakas į sijotuvą

/* 11 Sijotuvas – 3 frakcijos */
const scr=box(2.8,0.9,1.6,30.4,1.1,0,C.green);scr.rotation.z=-0.12;
for(const x of[29.4,31.4])for(const z of[-0.6,0.6])cyl(0.1,0.1,0.6,x,0.35,z,C.orange,10);
const fr=[{x:29.6,z:-4,c:C.yellow},{x:30.4,z:0,c:C.orange},{x:31.2,z:4,c:C.red}];
fr.forEach(f=>{link([f.x,0.6,0],[f.x,0.35,f.z*0.3],0.13,C.grey);link([f.x,0.35,f.z*0.3],[34.75,0.5,f.z],0.18,C.grey)});

/* 12–14 Elevatoriai ir silosai frakcijoms */
fr.forEach(f=>{elevator(35,f.z,13.4,C.blue);link([35.6,13.8,f.z],[38,11.6,f.z],0.16,C.grey);silo(38,f.z);
  const rv=cyl(0.24,0.24,0.38,38,2.6,f.z,C.orange,20);rv.rotation.x=Math.PI/2; // rotax po silosu
  box(0.26,0.26,0.26,38,2.6,f.z+0.32,C.dark);box(0.36,0.06,0.36,38,2.84,f.z,C.dark);box(0.36,0.06,0.36,38,2.36,f.z,C.dark)});

/* Malimo linija iš 3 frakcijos siloso */
// sraigtinis dozatorius
link([38,2.3,4],[41.4,1.9,4],0.2,C.blue);
cyl(0.22,0.22,0.4,37.7,2.85,4,C.dark).rotation.z=Math.PI/2;
legs(40,4,0.2,2.2);
// būgninis (rutulinis) malūnas
const mill=add(new THREE.CylinderGeometry(0.8,0.8,3.2,32),C.steel,43.5,1.45,4);mill.rotation.z=Math.PI/2;
cyl(0.3,0.8,0.4,41.7,1.45,4,C.steel).rotation.z=-Math.PI/2;
cyl(0.3,0.8,0.4,45.3,1.45,4,C.steel).rotation.z=Math.PI/2;
for(const x of[41.4,45.6])box(0.6,1.1,1.0,x,0.55,4,C.grey);
add(new THREE.TorusGeometry(0.88,0.1,8,40),C.orange,44.7,1.45,4).rotation.y=Math.PI/2;
box(2.6,0.15,1.0,45.3,0.08,5.6,C.dark);                 // pamatas
box(0.8,0.7,0.8,44.7,0.5,5.6,C.grey);                     // reduktorius
const mm=cyl(0.3,0.3,0.9,45.65,0.5,5.6,C.blue,20);mm.rotation.z=Math.PI/2; // variklis
const mp=cyl(0.2,0.2,0.3,44.7,0.65,4.95,C.dark,16);mp.rotation.x=Math.PI/2; // krumpliaratis prie vainiko
link([44.7,0.6,5.2],[44.7,0.62,5.05],0.08,C.dark);
box(0.5,0.6,0.6,46.1,1.1,4,C.dark); // iškrovimo galva
// dinaminis oro separatorius virš malūno (rotorius + kreipiamosios mentės)
{const X=43.5,Z=4;
 for(const sx of[-1,1])for(const sz of[-1,1])link([X+sx*1.3,0,Z+sz*1.3],[X+sx*1.3,3.6,Z+sz*1.3],0.08,C.dark);
 box(2.9,0.12,2.9,X,3.6,Z,C.dark);                                   // platforma
 cyl(1.05,0.25,1.0,X,4.2,Z,C.steel,32);                             // apatinis kūgis (stambi dė)
 const shell=add(new THREE.CylinderGeometry(1.15,1.15,1.7,40,1,true),C.steel,X,5.55,Z);
 shell.material=new THREE.MeshStandardMaterial({color:C.steel,roughness:0.5,metalness:0.4,side:THREE.DoubleSide}); // nepermatomas korpusas
 for(let k=0;k<28;k++){const a=k/28*Math.PI*2;const v=box(0.03,1.5,0.22,X+Math.cos(a)*0.95,5.55,Z+Math.sin(a)*0.95,0xa6d321);v.rotation.y=-a+0.6} // kreipiamosios mentės
 window.rotor=new THREE.Group();rotor.position.set(X,5.55,Z);scene.add(rotor);
 for(let k=0;k<16;k++){const a=k/16*Math.PI*2;const b=new THREE.Mesh(new THREE.BoxGeometry(0.04,1.3,0.12),mat(0x3fa7d6));b.position.set(Math.cos(a)*0.6,0,Math.sin(a)*0.6);b.rotation.y=-a;rotor.add(b)}
 const rc=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.06,32),mat(0x3fa7d6));rc.position.y=0.66;rotor.add(rc);
 const rb=new THREE.Mesh(new THREE.ConeGeometry(0.62,0.5,32),mat(0x3fa7d6));rb.position.y=-0.9;rb.rotation.x=Math.PI;rotor.add(rb);
 cyl(1.2,1.2,0.12,X,6.45,Z,C.steel,40);                             // dangtis
 link([X,6.5,Z],[X,7.0,Z],0.09,C.steel);                            // veleno guolis
 box(1.6,0.5,1.0,X,7.2,Z,C.steel);                                  // diržinės pavaros korpusas
 cyl(0.35,0.35,1.0,X-0.4,7.95,Z,0xdfe3e6,24);cyl(0.38,0.38,0.12,X-0.4,8.5,Z,0xdfe3e6,24); // vertikalus variklis
 box(1.3,0.8,0.9,X+1.6,5.9,Z,C.steel);                              // spiralinis išėjimas smulkiai džiai
 link([X,3.7,Z],[41.6,1.9,Z],0.16,C.steel);                         // stambi dė atgal į malūną
 link([46.1,1.3,Z],[46.1,4.6,Z],0.22,C.steel);link([46.1,4.6,Z],[X+1.1,4.6,Z],0.22,C.steel); // malūnas -> separatorius
 link([X+2.25,5.9,Z],[47.1,5.6,Z],0.26,C.steel);                   // smulki dė -> filtras
}
// produkto rankovinis filtras
legs(48.2,4,0.95,3.5);
const ph=cyl(1.35,0.2,1.0,48.2,3.0,4,C.green,4);ph.rotation.y=Math.PI/4;
box(2.2,3.0,2.2,48.2,5.0,4,C.green);box(2.3,0.2,2.3,48.2,6.6,4,C.dark);
// rotacinė sklendė (rotax)
const rv=cyl(0.28,0.28,0.45,48.2,2.25,4,C.orange,20);rv.rotation.x=Math.PI/2;box(0.3,0.3,0.3,48.2,2.25,4.45,C.dark);
link([48.2,2.0,4],[48.2,1.35,4],0.1,C.grey);
// didžmaišio pildymo stotelė
for(const sx of[-1,1])for(const sz of[-1,1])link([48.2+sx*0.65,0,4+sz*0.65],[48.2+sx*0.65,1.9,4+sz*0.65],0.05,C.steel);
box(1.4,0.08,1.4,48.2,1.9,4,C.steel);
box(0.95,1.05,0.95,48.2,0.55,4,C.white);
// ventiliatorius ir kaminas
link([48.2,6.7,4],[50.2,6.7,4],0.25,C.steel);link([50.2,6.7,4],[50.2,1.2,4],0.25,C.steel);
cyl(0.6,0.6,0.5,50.2,0.9,4,C.blue).rotation.x=Math.PI/2;
link([50.7,0.9,4],[51.6,0.9,4],0.25,C.steel);cyl(0.3,0.34,11,51.6,5.5,4,C.grey);

/* ===== Papildoma įranga ===== */
{
// 1 Džiovyklės pavara: krumpliaratis, reduktorius, variklis ant rėmo
legs(18.3,1.6,0.5,2.9);box(1.3,0.1,1.3,18.3,2.95,1.6,C.dark);
const pin=cyl(0.25,0.25,0.35,17.8,3.45,1.05,C.dark,16);pin.rotation.z=Math.PI/2;
box(0.7,0.6,0.6,17.9,3.3,1.6,C.grey);box(0.8,0.5,0.5,18.75,3.25,1.6,C.blue);
// 3+4 Aušintuvo ir sijotuvo aspiracija į rankovinį filtrą 13
// atskiri rankoviniai filtrai aušintuvui ir sijotuvui
function smallFilter(x,z){legs(x,z,0.62,2.65);
  const h=cyl(1.0,0.16,1.0,x,2.15,z,C.green,4);h.rotation.y=Math.PI/4;
  box(1.4,2.2,1.4,x,3.75,z,C.green);box(1.5,0.12,1.5,x,4.9,z,C.dark);
  const f=cyl(0.45,0.45,0.4,x,5.2,z,C.blue,24);f.rotation.x=Math.PI/2;box(0.4,0.35,0.35,x+0.5,5.15,z,C.dark); // ventiliatorius
  cyl(0.18,0.2,3.2,x,7.0,z,C.grey,16);                                      // kaminas
  const r=cyl(0.18,0.18,0.3,x,1.5,z,C.orange,16);r.rotation.x=Math.PI/2;      // rotax
  link([x,1.35,z],[x,0.95,z],0.06,C.grey);box(0.7,0.8,0.7,x,0.45,z,C.white)}  // didžmaišis
smallFilter(27.6,-3.8);smallFilter(31.4,-3.8);
link([26.1,3.6,-1.5],[26.1,4.2,-2.4],0.18,C.steel);link([26.1,4.2,-2.4],[27.6,4.2,-2.4],0.18,C.steel);link([27.6,4.2,-2.4],[27.6,4.2,-3.1],0.18,C.steel);
box(1.2,0.3,0.8,30.4,1.6,0,C.steel); // sijotuvo gaubtas
link([30.4,1.75,0],[30.4,4.0,0],0.14,C.steel);link([30.4,4.0,0],[30.4,4.0,-2.4],0.14,C.steel);link([30.4,4.0,-2.4],[31.4,4.0,-2.4],0.14,C.steel);link([31.4,4.0,-2.4],[31.4,4.0,-3.1],0.14,C.steel);
// 5 Juostinės svarstyklės
const sc=box(0.9,0.22,1.0,9.47,3.95,0,C.yellow);sc.rotation.z=0.748;
link([9.47,0,0.9],[9.47,1.2,0.9],0.04,C.dark);box(0.35,0.3,0.15,9.47,1.35,0.9,C.dark);
// 6 Valdymo / operatoriaus konteineris
box(6,2.6,2.4,16,1.3,8,0xd6dade);box(6.1,0.12,2.5,16,2.66,8,C.dark);
for(const x of[14,16,18])box(1.1,0.8,0.05,x,1.6,6.78,0x2b4a63);
box(0.9,2.0,0.05,13.6,1.0,6.78,C.grey);box(0.6,1.8,0.4,18.5,0.9,9.0,C.grey);
// 7 Dujų stotelė
box(1.4,1.1,0.8,10.6,0.55,-2.2,C.yellow);link([10.6,0.4,-1.2],[10.6,0.5,-1.8],0.06,C.yellow);
for(let i=0;i<3;i++)cyl(0.08,0.08,0.3,10.1+i*0.5,1.25,-2.2,C.red,10);
// 8 Laiptai ir aikstelės
function ladderZ(x,z,y1){for(const sx of[-0.22,0.22])link([x+sx,0,z],[x+sx,y1,z],0.03,C.steel);
  for(let y=0.3;y<y1;y+=0.3)link([x-0.22,y,z],[x+0.22,y,z],0.015,C.steel);
  for(let y=2.5;y<y1;y+=0.9){const h=add(new THREE.TorusGeometry(0.4,0.02,6,16,Math.PI),C.steel,x,y,z);h.rotation.x=Math.PI/2}}
function ladderX(x,z,y1){for(const sz of[-0.22,0.22])link([x,0,z+sz],[x,y1,z+sz],0.03,C.steel);
  for(let y=0.3;y<y1;y+=0.3)link([x,y,z-0.22],[x,y,z+0.22],0.015,C.steel);
  for(let y=2.5;y<y1;y+=0.9){const h=add(new THREE.TorusGeometry(0.4,0.02,6,16,Math.PI),C.steel,x,y,z);h.rotation.x=Math.PI/2;h.rotation.z=-Math.PI/2}}
function rail(a,b){link([a[0],a[1]+1,a[2]],[b[0],b[1]+1,b[2]],0.025,C.yellow);link([a[0],a[1]+0.5,a[2]],[b[0],b[1]+0.5,b[2]],0.02,C.yellow);
  const d=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.round(d/1.5));for(let i=0;i<=n;i++){const t=i/n;link([a[0]+(b[0]-a[0])*t,a[1],a[2]+(b[2]-a[2])*t],[a[0]+(b[0]-a[0])*t,a[1]+1,a[2]+(b[2]-a[2])*t],0.02,C.yellow)}}
ladderZ(8,1.45,11.0);box(1.2,0.06,0.9,8,10.95,1.75,C.dark);
for(const dx of[-0.5,0.5]){link([8+dx,10.92,1.1],[8+dx,10.92,2.2],0.05,C.dark);link([8+dx,9.9,1.1],[8+dx,10.9,2.1],0.04,C.dark)} // konsolės prie silosorail([7.4,10.95,2.2],[8.6,10.95,2.2]);
ladderX(39.45,-4,11.3);box(0.9,0.08,9.8,38.8,11.25,0,C.dark);
// tako atramos: išilginiai profiliai ir stovai ant silosų stogų
for(const x of[38.4,39.15])link([x,11.17,-4.9],[x,11.17,4.9],0.06,C.dark);
for(const z of[-4,0,4]){for(const dz of[-0.5,0.5]){link([38.4,10.9,z+dz],[38.4,11.17,z+dz],0.05,C.dark);box(0.2,0.04,0.2,38.4,10.9,z+dz,C.dark)}
  for(const dz of[-0.3,0.3]){link([39.12,10.6,z+dz],[39.12,11.17,z+dz],0.05,C.dark);box(0.2,0.04,0.2,39.12,10.6,z+dz,C.dark)}
  link([38.4,10.95,z-0.5],[39.12,11.15,z-0.3],0.03,C.dark);link([38.4,10.95,z+0.5],[39.12,11.15,z+0.3],0.03,C.dark)}rail([39.25,11.25,-4.9],[39.25,11.25,4.9]);rail([38.35,11.25,-4.9],[38.35,11.25,4.9]);
for(const z of[-4,0,4])box(1.4,0.06,1.0,35.1,13.0,z+0.9,C.dark); // aikštelės prie norijų galvų
ladderZ(5,0.75,12.0);box(1.4,0.06,1.0,5.1,11.9,1.0,C.dark);rail([4.4,11.9,1.5],[5.8,11.9,1.5]);
// 9 Sklendės prieš norijų įėjimus
box(0.2,0.6,0.6,4.2,0.6,0,C.dark);link([4.2,0.6,0.3],[4.2,0.6,0.6],0.03,C.dark);
for(const f of fr){box(0.6,0.6,0.2,34.2,0.5,f.z,C.dark)}
// 11 Didžmaišių stotelės po 17 ir 18 silosais
for(const z of[-4,0]){link([38,2.33,z],[38,1.15,z],0.08,C.grey);box(0.9,1.0,0.9,38,0.55,z,C.white);
  for(const sx of[-1,1])for(const sz of[-1,1])link([38+sx*0.6,0,z+sz*0.6],[38+sx*0.6,1.9,z+sz*0.6],0.04,C.steel);box(1.3,0.06,1.3,38,1.9,z,C.steel)}
// 12 Stogai (permatomi) virš aušintuvo/sijotuvo ir malūno
const roofM=new THREE.MeshStandardMaterial({color:0x8fa3b0,transparent:true,opacity:0.22,side:THREE.DoubleSide,depthWrite:false});
function canopy(x0,x1,z0,z1,h){for(let x=x0;x<=x1+0.01;x+=(x1-x0)/Math.ceil((x1-x0)/5))for(const z of[z0,z1])link([x,0,z],[x,h,z],0.1,C.grey);
  const r=new THREE.Mesh(new THREE.BoxGeometry(x1-x0+0.6,0.08,z1-z0+0.6),roofM);r.position.set((x0+x1)/2,h,(z0+z1)/2);scene.add(r);
  link([x0,h,z0],[x1,h,z0],0.08,C.grey);link([x0,h,z1],[x1,h,z1],0.08,C.grey);link([x0,h,z0],[x0,h,z1],0.08,C.grey);link([x1,h,z0],[x1,h,z1],0.08,C.grey)}

// 10 Lygio davikliai silosuose
// visi ant cilindro sienos: 100 % (~10,3 m), 50 % (~7,5 m), 20 % (~5,7 m) – pagal tūrį
for(const[x,z]of[[8,0],[38,-4],[38,0],[38,4]]){
  for(const y of[10.3,7.53,5.7]){const s=cyl(0.07,0.07,0.28,x-1.3,y,z,C.orange,10);s.rotation.z=Math.PI/2;box(0.12,0.16,0.16,x-1.47,y,z,C.dark)}}
}

/* Medžiagos srauto rodyklės (animuotos dalelės) */
const path=[[2.3,3.6,0],[2.3,0.6,0],[4.6,0.6,0],[5,0.6,0],[5,12.6,0],[8,11.6,0],[8,10.5,0],[8,2.9,0],[12.2,6.75,0],[12.3,5.9,0],[12.6,5.0,0],[22.8,4.3,0],[23.4,3.4,0],[24.1,3.15,0],[28.6,2.4,0],[29.15,1.8,0],[30.4,1.1,0]];
const curve=new THREE.CatmullRomCurve3(path.map(p=>new THREE.Vector3(...p)),false,'catmullrom',0.01);
const dots=[];for(let i=0;i<40;i++){const d=add(new THREE.SphereGeometry(0.12,8,8),C.orange,0,0,0);d.castShadow=false;d.u=i/40;dots.push(d)}
const air=new THREE.CatmullRomCurve3([[23.4,3.9,0],[23.4,7.2,0],[23.4,7.2,-3.5],[23.4,5.4,-3.6],[23.4,5.8,-4.3],[23.4,8.5,-4.3],[23.4,8.5,-8.2],[23.4,7,-10.2],[23.4,7,-11.4],[23.4,1.9,-11.8],[26,1.6,-11.8],[26,16,-11.8]].map(p=>new THREE.Vector3(...p)),false,'catmullrom',0.01);
const mcurve=new THREE.CatmullRomCurve3([[38,2.3,4],[41.4,1.9,4],[45.6,1.4,4],[46.1,1.3,4],[46.1,4.6,4],[44.6,4.6,4],[43.5,5.4,4],[44.9,5.9,4],[47.1,5.6,4],[48.2,4.0,4],[48.2,2.2,4],[48.2,1.1,4]].map(p=>new THREE.Vector3(...p)),false,'catmullrom',0.01);
for(let i=0;i<18;i++){const d=add(new THREE.SphereGeometry(0.11,8,8),C.white,0,0,0);d.castShadow=false;d.u=i/18;d.c=mcurve;dots.push(d)}
const puffs=[];for(let i=0;i<24;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,8),new THREE.MeshBasicMaterial({color:0xaab4bb,transparent:true,opacity:0.7}));p.u=i/24;scene.add(p);puffs.push(p)}

const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(still)controls.autoRotate=false;
const T0=new THREE.Vector3(26,4.5,0),P0=new THREE.Vector3(-10,30,52);
const DIR=P0.clone().sub(T0).normalize(),D0=P0.distanceTo(T0);
function resize(){
  const w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h);camera.aspect=w/h;
  const wide=w>900;
  let dist=D0;
  if(!wide){const half=Math.tan(camera.fov*Math.PI/360);dist=Math.max(D0,48/(2*half*camera.aspect));}
  camera.position.copy(T0).addScaledVector(DIR,dist);controls.target.copy(T0);
  scene.fog.near=dist+7;scene.fog.far=dist+85;
  if(wide)camera.setViewOffset(w,h,-w*0.15,h*0.03,w,h);
  else{const g=document.querySelector('.hero-gap');
    const gc=g?g.offsetTop+g.offsetHeight/2:h/2;
    camera.setViewOffset(w,h,0,-(gc-h/2),w,h);}
  camera.far=dist+200;
  camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();
let running=false;
function frame(){
  if(!still){drum.rotation.x+=0.01;mill.rotation.x+=0.02;rotor.rotation.y+=0.08;
    dots.forEach(d=>{d.u=(d.u+0.0012)%1;d.position.copy((d.c||curve).getPointAt(d.u))});
    puffs.forEach(p=>{p.u=(p.u+0.002)%1;p.position.copy(air.getPointAt(p.u))});}
  controls.update();renderer.render(scene,camera);
}
if(still){dots.forEach(d=>d.position.copy((d.c||curve).getPointAt(d.u)));puffs.forEach(p=>p.position.copy(air.getPointAt(p.u)));}
function run(on){if(on===running)return;running=on;renderer.setAnimationLoop(on?frame:null);}
if('IntersectionObserver' in window)new IntersectionObserver(e=>run(e[0].isIntersecting)).observe(wrap);else run(true);
document.addEventListener('visibilitychange',()=>run(!document.hidden));
wrap.classList.add('ready');
})();
