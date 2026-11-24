import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const $ = (id) => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91aeb9);
scene.fog = new THREE.Fog(0x91aeb9, 34, 105);
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 180);
camera.position.set(0, 1.7, 9);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

scene.add(new THREE.HemisphereLight(0xd9f5ff, 0x394b45, 2.0));
const sun = new THREE.DirectionalLight(0xffedce, 2.1);
sun.position.set(-18, 30, 15); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const groundMat = mat(0x657c68), rockMat=mat(0x53636a), wallMat=mat(0x68777b), accentMat=mat(0x243c48,.6,.35);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(180,180),groundMat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const obstacles=[];
function box(x,y,z,sx,sy,sz,material=wallMat){
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
 obstacles.push({min:new THREE.Vector3(x-sx/2,y-sy/2,z-sz/2),max:new THREE.Vector3(x+sx/2,y+sy/2,z+sz/2)});return m;
}
// Low perimeter berms, cover blocks and range structures.
box(0,1,-34,72,2,1.4);box(0,1,34,72,2,1.4);box(-36,1,0,1.4,2,68);box(36,1,0,1.4,2,68);
box(-11,.7,-8,5,1.4,2);box(8,.65,-14,3.5,1.3,2.5);box(15,.8,2,2,1.6,5);
box(-18,.55,12,5,.9,2);box(1,.6,17,4,1.2,2);box(22,.5,-22,4,1,2);
for(let i=0;i<24;i++){
 const x=(Math.random()-.5)*64,z=(Math.random()-.5)*60;
 if(Math.abs(x)<5&&z>2)continue;
 const r=.35+Math.random()*1.1;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),rockMat);
 rock.position.set(x,r*.55,z);rock.rotation.set(Math.random(),Math.random(),Math.random());rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);
 obstacles.push({min:new THREE.Vector3(x-r*.8,0,z-r*.8),max:new THREE.Vector3(x+r*.8,r*1.1,z+r*.8)});
}
for(let i=0;i<8;i++){
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,3.2,8),accentMat);pole.position.set(-29+i*8,1.6,-30);scene.add(pole);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.18,12,8),new THREE.MeshBasicMaterial({color:0x64e7e0}));lamp.position.set(-29+i*8,3.25,-30);scene.add(lamp);
}

const player={height:1.7,radius:.34,speed:5.2};
const keys={};let started=false,primed=false,charge=12,capacity=12,attachment=0,targetsHit=0;
const attachments=[
 {name:'BASE CONFIG',capacity:12,cooldown:260,color:0x64e7e0,description:'Balanced training configuration'},
 {name:'PRISM FOCUS',capacity:8,cooldown:390,color:0xb18cff,description:'Focused pulse with slower cadence'},
 {name:'WIDE-BAND COIL',capacity:18,cooldown:190,color:0xffc66b,description:'Expanded cell capacity and faster pulses'}
];
let lastShot=0,toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1500)}
const gun=new THREE.Group();
const gunBody=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.75),mat(0x263b48,.35,.65));gunBody.position.set(0,0,-.3);gun.add(gunBody);
const gunTop=new THREE.Mesh(new THREE.BoxGeometry(.14,.09,.48),mat(0x536d78,.35,.6));gunTop.position.set(0,.15,-.31);gun.add(gunTop);
const grip=new THREE.Mesh(new THREE.BoxGeometry(.14,.3,.18),mat(0x17242b));grip.position.set(0,-.22,-.12);grip.rotation.x=-.18;gun.add(grip);
const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.12,16),new THREE.MeshBasicMaterial({color:0x64e7e0}));muzzle.rotation.x=Math.PI/2;muzzle.position.set(0,0,-.72);gun.add(muzzle);
const cell=new THREE.Mesh(new THREE.BoxGeometry(.12,.16,.25),mat(0x64e7e0,.25,.3));cell.position.set(0,-.1,-.28);gun.add(cell);
camera.add(gun);scene.add(camera);
gun.position.set(.34,-.28,-.62);
const controller0=renderer.xr.getController(0),controller1=renderer.xr.getController(1);
scene.add(controller0,controller1);
const controllerGun=gun.clone();controllerGun.position.set(.08,-.08,-.28);controllerGun.scale.setScalar(.8);controller1.add(controllerGun);
controller1.addEventListener('selectstart',()=>fire(true));
controller0.addEventListener('selectstart',()=>{if(charge===0)recharge();else prime();});
controller1.addEventListener('squeezestart',inspectToggle);

const targets=[];
function makeTarget(x,y,z){
 const g=new THREE.Group();g.position.set(x,y,z);
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.48,24,16),new THREE.MeshStandardMaterial({color:0x4ce0d2,emissive:0x126d68,emissiveIntensity:1.2,roughness:.25,metalness:.3}));
 orb.castShadow=true;g.add(orb);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.045,8,32),new THREE.MeshBasicMaterial({color:0xb5fff6}));ring.rotation.x=Math.PI/2;g.add(ring);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),new THREE.MeshBasicMaterial({color:0xffffff}));eye.position.set(0,0,.43);g.add(eye);
 scene.add(g);targets.push({group:g,alive:true,baseY:y,phase:Math.random()*6,orb});
}
[[-14,2.2,-24],[-3,2.7,-29],[12,2.2,-26],[23,2.8,-12],[0,2.3,-18]].forEach(p=>makeTarget(...p));
const projectiles=[];
function fire(fromVR=false){
 if(!started)return;
 if(!primed){toast('PRIME THE EMITTER FIRST');return}
 if(charge<=0){toast('CELL EMPTY — RECHARGE');return}
 const now=performance.now();if(now-lastShot<attachments[attachment].cooldown)return;lastShot=now;charge--;updateHud();
 let origin=new THREE.Vector3(),direction=new THREE.Vector3();
 if(renderer.xr.isPresenting&&fromVR){
  controller1.getWorldPosition(origin);controller1.getWorldDirection(direction);direction.negate();
 }else{
  camera.getWorldPosition(origin);camera.getWorldDirection(direction);
 }
 const p=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:attachments[attachment].color}));
 p.position.copy(origin).addScaledVector(direction,.8);scene.add(p);projectiles.push({mesh:p,velocity:direction.multiplyScalar(34),life:2.1});
 muzzle.material.color.setHex(attachments[attachment].color);
 setTimeout(()=>muzzle.material.color.setHex(attachments[attachment].color),70);
}
function prime(){primed=!primed;toast(primed?'EMITTER PRIMED':'EMITTER SAFE');updateHud()}
function recharge(){charge=capacity;primed=false;toast('ENERGY CELL RECHARGED');updateHud()}
function setAttachment(index){attachment=index;capacity=attachments[index].capacity;charge=Math.min(charge,capacity);muzzle.material.color.setHex(attachments[index].color);toast(attachments[index].description.toUpperCase());updateHud()}
function updateHud(){
 $('cell-count').textContent=charge;$('cell-capacity').textContent=capacity;$('charge-fill').style.width=(charge/capacity*100)+'%';
 $('weapon-state').textContent=primed?'EMITTER PRIMED':'EMITTER SAFE';$('attachment-label').textContent='· '+attachments[attachment].name;
 $('target-count').textContent=targetsHit+' / '+targets.length;
 $('inspect-cell').textContent=capacity+'-unit energy cell';$('inspect-attachment').textContent=attachments[attachment].description;
}
function inspectToggle(){ $('inspect-card').classList.toggle('hidden'); }
$('close-inspect').addEventListener('click',()=> $('inspect-card').classList.add('hidden'));
function start(){if(started)return;started=true;$('start-screen').style.display='none';toast('FIELD SIMULATION ONLINE');}
$('start-button').addEventListener('click',()=>{start();if(!renderer.xr.isPresenting)renderer.domElement.requestPointerLock?.()});
document.addEventListener('pointerlockchange',()=>{});
document.addEventListener('keydown',e=>{
 keys[e.code]=true;
 if(e.repeat)return;
 if(e.code==='KeyE')prime();
 if(e.code==='KeyR')recharge();
 if(e.code==='KeyI')inspectToggle();
 if(e.code==='Digit1')setAttachment(0);
 if(e.code==='Digit2')setAttachment(1);
 if(e.code==='Digit3')setAttachment(2);
});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('mousemove',e=>{
 if(document.pointerLockElement===renderer.domElement&&!renderer.xr.isPresenting){
  camera.rotation.order='YXZ';camera.rotation.y-=e.movementX*.0022;camera.rotation.x-=e.movementY*.0022;
  camera.rotation.x=Math.max(-1.45,Math.min(1.45,camera.rotation.x));
 }
});
renderer.domElement.addEventListener('click',()=>{if(started&&document.pointerLockElement!==renderer.domElement&&!renderer.xr.isPresenting)renderer.domElement.requestPointerLock?.();else fire(false)});
function collides(pos){
 const r=player.radius;
 for(const o of obstacles){if(pos.x+r>o.min.x&&pos.x-r<o.max.x&&pos.z+r>o.min.z&&pos.z-r<o.max.z&&player.height>o.min.y&&0<o.max.y)return true;}
 return false;
}
const clock=new THREE.Clock();
function animate(){
 const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
 // Desktop keyboard movement and WebXR thumbstick movement.
 let forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
 let strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
 if(renderer.xr.isPresenting){
  const session=renderer.xr.getSession();
  for(const source of session.inputSources){if(source.handedness==='left'&&source.gamepad){const a=source.gamepad.axes;strafe+=a[2]||0;forward-=a[3]||0;}}
 }
 const len=Math.hypot(forward,strafe)||1;forward/=len;strafe/=len;
 const yaw=camera.rotation.y;
 const dx=(Math.sin(yaw)*forward+Math.cos(yaw)*strafe)*player.speed*dt;
 const dz=(-Math.cos(yaw)*forward+Math.sin(yaw)*strafe)*player.speed*dt;
 const pos=camera.position.clone();pos.x+=dx;if(!collides(pos))camera.position.x=pos.x;pos.copy(camera.position);pos.z+=dz;if(!collides(pos))camera.position.z=pos.z;
 if(!renderer.xr.isPresenting)camera.position.y=player.height;
 camera.position.x=THREE.MathUtils.clamp(camera.position.x,-34.5,34.5);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-32.5,32.5);
 targets.forEach((target,i)=>{if(target.alive){target.group.position.y=target.baseY+Math.sin(t*1.5+target.phase)*.28;target.group.rotation.y=t*.5;}});
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i];p.mesh.position.addScaledVector(p.velocity,dt);p.life-=dt;let hit=false;
  for(const target of targets){if(target.alive&&p.mesh.position.distanceTo(target.group.position)<.65){target.alive=false;scene.remove(target.group);targetsHit++;updateHud();toast(targetsHit===targets.length?'RANGE CLEAR — SIMULATION COMPLETE':'TARGET CONFIRMED');hit=true;break;}}
  if(p.life<=0||hit||Math.abs(p.mesh.position.x)>50||Math.abs(p.mesh.position.z)>50){scene.remove(p.mesh);projectiles.splice(i,1);}
 }
 if(!renderer.xr.isPresenting){gun.visible=true;gun.rotation.x=THREE.MathUtils.lerp(gun.rotation.x,keys.KeyW||keys.KeyS?-.025:0,.12);}
 else { gun.visible=false; }
 renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
updateHud();
window.addEventListener('load',()=>{$('loading').style.display='none'});
