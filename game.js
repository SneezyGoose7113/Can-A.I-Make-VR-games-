import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bb4ba);
scene.fog = new THREE.Fog(0x9bb4ba, 42, 120);
const rig = new THREE.Group(); scene.add(rig);
const camera = new THREE.PerspectiveCamera(76, innerWidth/innerHeight, .05, 180);
camera.position.set(0,1.68,0); rig.add(camera);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
renderer.xr.enabled=true; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05; document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

scene.add(new THREE.HemisphereLight(0xe5f7ff,0x46544b,1.9));
const sun=new THREE.DirectionalLight(0xffedcf,2.3);sun.position.set(-25,35,18);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;scene.add(sun);
const mat=(c,r=.75,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const mats={ground:mat(0x71846a),sand:mat(0x9a8d70),concrete:mat(0x56646a),dark:mat(0x182832,.35,.7),metal:mat(0x435b68,.3,.8),rubber:mat(0x111a20),cyan:mat(0x53e6df,.25,.35),glow:new THREE.MeshBasicMaterial({color:0x6ffff1}),orange:mat(0xd28c45,.55,.2)};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),mats.ground);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const obstacles=[];
function addBox(x,y,z,w,h,d,material=mats.concrete,collide=true){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
 if(collide)obstacles.push({min:new THREE.Vector3(x-w/2,y-h/2,z-d/2),max:new THREE.Vector3(x+w/2,y+h/2,z+d/2),mesh});
 return mesh;
}
// Training range: berm walls, reinforced barriers, cargo stacks and concrete lanes.
addBox(0,1,-39,82,2,1.5);addBox(0,1,39,82,2,1.5);addBox(-41,1,0,1.5,2,78);addBox(41,1,0,1.5,2,78);
addBox(-13,.75,-8,7,1.5,2.2);addBox(10,.65,-15,4,1.3,3);addBox(19,.85,2,2.5,1.7,6);
addBox(-20,.6,14,6,.0+1.2,2.5);addBox(2,.7,18,5,1.4,2.5);addBox(26,.65,-23,5,1.3,2.5);
for(let i=0;i<5;i++){addBox(-28+i*14,.5,-31,5,1,1.5,mats.sand);addBox(-28+i*14,.5,30,5,1,1.5,mats.sand);}
for(let i=0;i<18;i++){
 const x=(Math.random()-.5)*72,z=(Math.random()-.5)*68;if(Math.abs(x)<5&&z>0)continue;
 const radius=.35+Math.random()*.8;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(radius,1),mats.sand);
 rock.position.set(x,radius*.55,z);rock.rotation.set(Math.random(),Math.random(),Math.random());rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);
 obstacles.push({min:new THREE.Vector3(x-radius*.8,0,z-radius*.8),max:new THREE.Vector3(x+radius*.8,radius*1.1,z+radius*.8)});
}
// Range lighting and landmarks.
for(let i=0;i<9;i++){const x=-32+i*8;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.11,3.6,10),mats.dark);pole.position.set(x,1.8,-34);pole.castShadow=true;scene.add(pole);const lamp=new THREE.Mesh(new THREE.BoxGeometry(.45,.12,.25),mats.cyan);lamp.position.set(x,3.65,-34);scene.add(lamp);}

// Detailed fictional PX-01 pulse emitter. Desktop model sits in view; VR model is parented to the right grip.
function buildEmitter(){
 const g=new THREE.Group();
 const body= new THREE.Mesh(new THREE.BoxGeometry(.17,.18,.48),mats.dark);body.castShadow=true;g.add(body);
 const upper=new THREE.Mesh(new THREE.BoxGeometry(.145,.075,.37),mats.metal);upper.position.set(0,.115,-.025);g.add(upper);
 const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.052,.067,.25,16),mats.metal);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.02,-.34);g.add(barrel);
 const muzzle=new THREE.Mesh(new THREE.TorusGeometry(.053,.012,8,20),mats.cyan);muzzle.position.set(0,.02,-.47);g.add(muzzle);
 const grip=new THREE.Mesh(new THREE.BoxGeometry(.12,.27,.15),mats.rubber);grip.position.set(0,-.2,.08);grip.rotation.x=-.12;g.add(grip);
 const triggerGuard=new THREE.Mesh(new THREE.TorusGeometry(.075,.012,6,18,Math.PI),mats.metal);triggerGuard.position.set(0,-.105,-.07);triggerGuard.rotation.x=Math.PI/2;g.add(triggerGuard);
 const trigger=new THREE.Mesh(new THREE.BoxGeometry(.025,.09,.025),mats.orange);trigger.position.set(0,-.13,-.09);g.add(trigger);
 // Top sight and paired rails.
 const sightBase=new THREE.Mesh(new THREE.BoxGeometry(.08,.055,.13),mats.dark);sightBase.position.set(0,.18,-.08);g.add(sightBase);
 const sightDot=new THREE.Mesh(new THREE.SphereGeometry(.018,10,8),mats.glow);sightDot.position.set(0,.22,-.08);g.add(sightDot);
 for(const side of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.025,.035,.31),mats.metal);rail.position.set(side*.095,.075,-.045);g.add(rail);for(let k=0;k<5;k++){const notch=new THREE.Mesh(new THREE.BoxGeometry(.03,.045,.025),mats.dark);notch.position.set(side*.1,.09,-.18+k*.065);g.add(notch);}}
 // Cell cradle and visible energy cartridge.
 const cradle=new THREE.Mesh(new THREE.BoxGeometry(.12,.19,.2),mats.rubber);cradle.position.set(0,-.11,-.1);g.add(cradle);
 const cell=new THREE.Group();const cbody=new THREE.Mesh(new THREE.BoxGeometry(.085,.145,.14),mats.dark);cell.add(cbody);
 const ccore=new THREE.Mesh(new THREE.BoxGeometry(.052,.11,.105),new THREE.MeshStandardMaterial({color:0x48d8ce,emissive:0x137e78,emissiveIntensity:1.1,metalness:.35,roughness:.25}));ccore.position.z=-.01;cell.add(ccore);
 for(let i=0;i<3;i++){const band=new THREE.Mesh(new THREE.BoxGeometry(.095,.018,.15),mats.metal);band.position.y=-.05+i*.05;cell.add(band);}
 cell.position.set(0,-.12,-.105);g.add(cell);
 const sidePanel=new THREE.Mesh(new THREE.BoxGeometry(.012,.09,.19),mats.metal);sidePanel.position.set(.092,-.005,.03);g.add(sidePanel);
 const indicator=new THREE.Mesh(new THREE.BoxGeometry(.018,.018,.06),mats.cyan);indicator.position.set(.101,.015,.025);g.add(indicator);
 g.userData={cell,muzzle,indicator};return g;
}
const desktopGun=buildEmitter();desktopGun.scale.setScalar(.62);desktopGun.position.set(.31,-.27,-.62);camera.add(desktopGun);
const controller0=renderer.xr.getController(0),controller1=renderer.xr.getController(1);
const grip0=renderer.xr.getControllerGrip(0),grip1=renderer.xr.getControllerGrip(1);
scene.add(controller0,controller1,grip0,grip1);
const controllerModels=new XRControllerModelFactory();
grip0.add(controllerModels.createControllerModel(grip0));grip1.add(controllerModels.createControllerModel(grip1));
// Visible stylized glove meshes attached to controller grips, so controller presence is clear even if model assets fail.
function addGlove(parent){
 const glove=new THREE.Group(),skin=mat(0x263b46,.7,.15),trim=mat(0x64e7e0,.3,.3);
 const palm=new THREE.Mesh(new THREE.BoxGeometry(.105,.12,.055),skin);palm.position.set(0,-.025,-.025);glove.add(palm);
 for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.CapsuleGeometry(.012,.055,3,6),skin);f.position.set((i-1.5)*.025,.055,-.025);f.rotation.x=-.18;glove.add(f);}
 const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.014,.05,3,6),skin);thumb.position.set(.065,-.025,-.015);thumb.rotation.z=-.9;glove.add(thumb);
 const cuff=new THREE.Mesh(new THREE.TorusGeometry(.052,.009,6,16),trim);cuff.position.y=-.095;glove.add(cuff);parent.add(glove);return glove;
}
addGlove(grip0);addGlove(grip1);
const vrGun=buildEmitter();vrGun.scale.setScalar(.43);vrGun.position.set(0,-.025,-.19);vrGun.rotation.x=-.04;grip1.add(vrGun);
// Desktop hand/forearm, deliberately subtle and positioned behind the emitter.
const desktopHand=new THREE.Group();const handMat=mat(0x293e48,.75,.1);
const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.065,.28,4,8),handMat);forearm.rotation.x=-.2;forearm.position.set(.22,-.36,-.43);desktopHand.add(forearm);
const palm=new THREE.Mesh(new THREE.BoxGeometry(.13,.09,.12),handMat);palm.position.set(.3,-.24,-.55);desktopHand.add(palm);camera.add(desktopHand);

// A compact world-space VR status panel. It is parented to the headset camera,
// so it remains readable in immersive mode and its buttons can be selected with the right controller.
const vrPanelCanvas=document.createElement('canvas');vrPanelCanvas.width=512;vrPanelCanvas.height=512;
const vrPanelCtx=vrPanelCanvas.getContext('2d');
const vrPanelTexture=new THREE.CanvasTexture(vrPanelCanvas);vrPanelTexture.colorSpace=THREE.SRGBColorSpace;
const vrPanel=new THREE.Mesh(new THREE.PlaneGeometry(.48,.48),new THREE.MeshBasicMaterial({map:vrPanelTexture,transparent:true,depthTest:false,side:THREE.DoubleSide}));
vrPanel.position.set(-.43,.03,-.88);vrPanel.renderOrder=20;camera.add(vrPanel);
function drawVRPanel(){
 const c=vrPanelCtx;c.clearRect(0,0,512,512);
 c.fillStyle='rgba(4,13,23,.88)';c.fillRect(5,5,502,502);
 c.strokeStyle='#64e7e0';c.lineWidth=3;c.strokeRect(5,5,502,502);
 c.fillStyle='#64e7e0';c.font='bold 27px monospace';c.fillText('PROJECT ZERO // PX-01',25,48);
 c.fillStyle='#e9f4f7';c.font='22px monospace';c.fillText((primed?'PRIMED':'SAFE')+'  '+charge+'/'+capacity,25,91);
 c.fillStyle='#91a5b6';c.font='17px monospace';c.fillText('SPARE CELLS: '+spareCells+'   TARGETS: '+hits+'/5',25,122);
 const buttons=[['PRIME / SAFE',25,155,220,82],['INSERT CELL',267,155,220,82],['INSPECT',25,255,220,82],['BASE MODULE',267,255,220,82],['PRISM MODULE',25,355,220,82],['WIDE-BAND',267,355,220,82]];
 for(const [label,x,y,w,h] of buttons){c.fillStyle='rgba(100,231,224,.13)';c.fillRect(x,y,w,h);c.strokeStyle='#64e7e0';c.lineWidth=2;c.strokeRect(x,y,w,h);c.fillStyle='#e9f4f7';c.font='bold 17px monospace';c.fillText(label,x+14,y+47);}
 c.fillStyle='#91a5b6';c.font='14px monospace';c.fillText('AIM CONTROLLER AT A BUTTON + TRIGGER',25,480);
 vrPanelTexture.needsUpdate=true;
}
function activateVRPanel(){
 const ray=controllerRay(controller1);const hitsUI=ray.intersectObject(vrPanel,false);
 if(!hitsUI.length)return false;
 const uv=hitsUI[0].uv;if(!uv)return false;
 const x=uv.x*512,y=(1-uv.y)*512;
 if(y>=155&&y<=237){if(x<256)prime();else reloadCell();}
 else if(y>=255&&y<=337){if(x<256)inspect();else setModule(0);}
 else if(y>=355&&y<=437){if(x<256)setModule(1);else setModule(2);}
 else return true;
 drawVRPanel();return true;
}

const targets=[];let hits=0;
function makeTarget(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.43,28,20),new THREE.MeshStandardMaterial({color:0x46ded3,emissive:0x126d68,emissiveIntensity:1.25,roughness:.22,metalness:.3}));orb.castShadow=true;g.add(orb);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.66,.035,8,36),new THREE.MeshBasicMaterial({color:0xc0fff8}));g.add(ring);
 const ring2=new THREE.Mesh(new THREE.TorusGeometry(.78,.018,6,36),new THREE.MeshBasicMaterial({color:0x4edbd0}));ring2.rotation.x=Math.PI/2;g.add(ring2);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),new THREE.MeshBasicMaterial({color:0xffffff}));eye.position.set(0,0,.38);g.add(eye);
 scene.add(g);targets.push({group:g,alive:true,baseY:y,phase:Math.random()*6});
}
[[-15,2.3,-26],[-4,2.7,-31],[10,2.4,-28],[25,2.8,-14],[1,2.2,-20]].forEach(p=>makeTarget(...p));

// Physical energy cells: collect by walking close. Collected cells become spare inventory.
const pickups=[];
function makeCellPickup(x,z){
 const g=new THREE.Group();const shell=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.42,12),mats.dark);shell.castShadow=true;g.add(shell);
 const core=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.3,12),new THREE.MeshStandardMaterial({color:0x55e8db,emissive:0x137f78,emissiveIntensity:1.5}));g.add(core);
 const cap=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,6,16),mats.orange);cap.position.y=.2;g.add(cap);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.28,.012,6,24),new THREE.MeshBasicMaterial({color:0x65fff2}));halo.rotation.x=Math.PI/2;g.add(halo);
 g.position.set(x,.55,z);scene.add(g);pickups.push({group:g,alive:true,phase:Math.random()*5});
}
[[-5,5],[14,11],[-25,-15],[29,-3]].forEach(p=>makeCellPickup(...p));
let spareCells=2,charge=12,capacity=12,primed=false,attachment=0,started=false,hitCooldown=0;
const modules=[
 {name:'BASE',capacity:12,cooldown:260,color:0x64e7e0,description:'Balanced pulse module'},
 {name:'PRISM',capacity:8,cooldown:390,color:0xb18cff,description:'Focused prism module'},
 {name:'WIDE-BAND',capacity:18,cooldown:190,color:0xffc66b,description:'Expanded coil module'}
];
let lastShot=0;const projectiles=[];
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),1450);}
function updateHud(){
 if(typeof drawVRPanel==='function')drawVRPanel();
 $('cell-count').textContent=charge;$('cell-capacity').textContent=capacity;$('charge-fill').style.width=(charge/capacity*100)+'%';
 $('weapon-state').textContent=primed?'PRIMED · READY':'SAFE · '+(charge?'CELL READY':'CELL EMPTY');
 $('attachment-label').textContent='· '+modules[attachment].name;$('spare-count').textContent=spareCells;
 $('target-count').textContent=hits+' / '+targets.length;$('inspect-cell').textContent=capacity+'-unit energy cell';
 $('inspect-attachment').textContent=modules[attachment].description;$('inspect-spares').textContent=spareCells+' cells';
 $('objective').textContent=spareCells===0?'Clear the training drones':'Recover the energy cells';
 $('objective-detail').textContent=spareCells>0?'Find the glowing cartridges scattered around the range.':'Prime the emitter and tag all five floating drones.';
}
function prime(){primed=!primed;toast(primed?'EMITTER PRIMED':'EMITTER SAFE');updateHud();}
function reloadCell(){
 if(spareCells<=0){toast('NO SPARE CELLS — FIND A GLOWING PICKUP');return;}
 spareCells--;charge=capacity;primed=false;
 const e=desktopGun.userData.cell;e.visible=true;e.scale.setScalar(1.0);
 toast('ENERGY CELL INSERTED');updateHud();
}
function setModule(i){attachment=i;capacity=modules[i].capacity;charge=Math.min(charge,capacity);desktopGun.userData.indicator.material.color.setHex(modules[i].color);vrGun.userData.indicator.material.color.setHex(modules[i].color);toast(modules[i].description.toUpperCase());updateHud();}
function inspect(){ $('inspect-card').classList.toggle('hidden'); }
$('close-inspect').addEventListener('click',()=>$('inspect-card').classList.add('hidden'));
function fire(vr=false){
 if(!started)return;if(!primed){toast('PRIME THE EMITTER FIRST');return;}if(charge<=0){toast('CELL EMPTY — INSERT A SPARE');return;}
 const now=performance.now();if(now-lastShot<modules[attachment].cooldown)return;lastShot=now;charge--;updateHud();
 const origin=new THREE.Vector3(),dir=new THREE.Vector3();
 if(vr&&renderer.xr.isPresenting){grip1.getWorldPosition(origin);grip1.getWorldDirection(dir);dir.negate();}
 else{camera.getWorldPosition(origin);camera.getWorldDirection(dir);}
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),new THREE.MeshBasicMaterial({color:modules[attachment].color}));mesh.position.copy(origin).addScaledVector(dir,.48);scene.add(mesh);
 projectiles.push({mesh,velocity:dir.multiplyScalar(42),life:2.2});
}
const raycaster=new THREE.Raycaster();
function controllerRay(controller){const o=new THREE.Vector3(),d=new THREE.Vector3();controller.getWorldPosition(o);controller.getWorldDirection(d);d.negate();raycaster.set(o,d);return raycaster;}
controller1.addEventListener('selectstart',()=>{if(renderer.xr.isPresenting&&activateVRPanel())return;fire(true);});
controller0.addEventListener('selectstart',()=>{if(charge===0||!primed)prime();else reloadCell();});
controller1.addEventListener('squeezestart',inspect);

// Desktop controls.
const keys={};document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;
 if(e.code==='KeyE')prime();if(e.code==='KeyR')reloadCell();if(e.code==='KeyI')inspect();
 if(e.code==='Digit1')setModule(0);if(e.code==='Digit2')setModule(1);if(e.code==='Digit3')setModule(2);
});document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement&&!renderer.xr.isPresenting){camera.rotation.order='YXZ';camera.rotation.y-=e.movementX*.0021;camera.rotation.x=Math.max(-1.42,Math.min(1.42,camera.rotation.x-e.movementY*.0021));}});
renderer.domElement.addEventListener('click',()=>{if(!started)return;if(!renderer.xr.isPresenting&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.();else fire(false);});
function start(){if(started)return;started=true;$('start-screen').style.display='none';toast('FIELD SIMULATION ONLINE');}
$('start-button').addEventListener('click',()=>{start();if(!renderer.xr.isPresenting)renderer.domElement.requestPointerLock?.();});

// Collision uses a horizontal player cylinder approximated by a circle against expanded AABBs.
const playerRadius=.34,walkSpeed=4.8;
function blocked(x,z){
 for(const o of obstacles){const minX=o.min.x-playerRadius,maxX=o.max.x+playerRadius,minZ=o.min.z-playerRadius,maxZ=o.max.z+playerRadius;
  if(x>minX&&x<maxX&&z>minZ&&z<maxZ&&o.max.y>.15)return true;
 }return false;
}
function movePlayer(dx,dz){
 let nx=rig.position.x+dx,nz=rig.position.z;
 if(!blocked(nx,nz))rig.position.x=nx;
 nx=rig.position.x;nz=rig.position.z+dz;if(!blocked(nx,nz))rig.position.z=nz;
 rig.position.x=THREE.MathUtils.clamp(rig.position.x,-39.8,39.8);rig.position.z=THREE.MathUtils.clamp(rig.position.z,-37.8,37.8);
}
const clock=new THREE.Clock();
function animate(){
 const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
 let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
 let s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
 if(renderer.xr.isPresenting){
  const session=renderer.xr.getSession();
  for(const source of session.inputSources){if(source.handedness==='left'&&source.gamepad){const a=source.gamepad.axes;let ax=0,ay=0;
    if(a.length>=4){ax=a[2];ay=a[3];}else{ax=a[0]||0;ay=a[1]||0;}
    if(Math.abs(ax)<.16)ax=0;if(Math.abs(ay)<.16)ay=0;s+=ax;f-=ay;
  }}
 }
 const len=Math.hypot(f,s);if(len>1){f/=len;s/=len;}
 // Head-relative direction; move the rig, not the headset camera, for stable XR tracking.
 const headDir=new THREE.Vector3(0,0,-1);headDir.applyQuaternion(camera.quaternion);headDir.y=0;headDir.normalize();
 const right=new THREE.Vector3().crossVectors(headDir,new THREE.Vector3(0,1,0)).normalize().negate();
 const moveX=(headDir.x*f+right.x*s)*walkSpeed*dt,moveZ=(headDir.z*f+right.z*s)*walkSpeed*dt;
 if(started)movePlayer(moveX,moveZ);
 // Desktop camera stays at eye height; XR headset supplies its own tracked local height.
 if(!renderer.xr.isPresenting)camera.position.set(0,1.68,0);
 // Hide held weapon when a wall is directly between the player's view and the weapon muzzle.
 vrPanel.visible=renderer.xr.isPresenting;
 if(!renderer.xr.isPresenting){
  const muzzleWorld=new THREE.Vector3();desktopGun.userData.muzzle.getWorldPosition(muzzleWorld);
  const camPos=new THREE.Vector3();camera.getWorldPosition(camPos);const ray=new THREE.Raycaster(camPos,muzzleWorld.clone().sub(camPos).normalize(),0,muzzleWorld.distanceTo(camPos));
  const hitsWall=ray.intersectObjects(obstacles.map(o=>o.mesh).filter(Boolean),false).length>0;
  desktopGun.visible=!hitsWall;desktopHand.visible=!hitsWall;
 }
 targets.forEach(o=>{if(o.alive){o.group.position.y=o.baseY+Math.sin(t*1.45+o.phase)*.23;o.group.rotation.y=t*.48;}});
 pickups.forEach(p=>{if(!p.alive)return;p.group.position.y=.55+Math.sin(t*2+p.phase)*.09;p.group.rotation.y=t*.8;
  if(Math.hypot(p.group.position.x-rig.position.x,p.group.position.z-rig.position.z)<1.05){p.alive=false;scene.remove(p.group);spareCells++;toast('ENERGY CELL RECOVERED');updateHud();}
 });
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i];p.mesh.position.addScaledVector(p.velocity,dt);p.life-=dt;let hit=false;
  for(const target of targets){if(target.alive&&p.mesh.position.distanceTo(target.group.position)<.57){target.alive=false;scene.remove(target.group);hits++;updateHud();toast(hits===targets.length?'RANGE CLEAR — SIMULATION COMPLETE':'TARGET CONFIRMED');hit=true;break;}}
  if(p.life<=0||hit||Math.abs(p.mesh.position.x)>65||Math.abs(p.mesh.position.z)>65){scene.remove(p.mesh);projectiles.splice(i,1);}
 }
 renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
updateHud();
window.addEventListener('load',()=>{$('loading').style.display='none';});
