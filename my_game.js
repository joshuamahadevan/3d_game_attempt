import {PointerLockControls} from "./js/PointerLockControls.js";
import * as THREE from "./js/three.module.js";


//declare variables
var scene, camera, renderer, controls;
var world,sphereBody;

function init(){
	//create a scene
	scene=new THREE.Scene();

	//background and lighting
	scene.background = new THREE.Color( 0xffffff );
	scene.fog = new THREE.Fog( 0xffffff, 0 );

	const light1 = new THREE.PointLight( 0xffffff, 0.1, 100 );
	light1.position.set( 5, 20, 10 );
	light1.castShadow=true;
	light1.shadowDarkness=0.5;
	light1.shadowCameraVisible=true;
	scene.add( light1 );

	const light2 = new THREE.PointLight( 0xffffff, 0.1, 100 );
	light2.position.set( -5, 20, 10 );
	light2.castShadow=true;
	light2.shadowDarkness=0.5;
	light2.shadowCameraVisible=true;
	scene.add( light2 );

	const light3 = new THREE.PointLight( 0xffffff, 0.1, 100 );
	light3.position.set( 0, 20,-20  );
	light3.castShadow=true;
	light3.shadowDarkness=0.5;
	light3.shadowCameraVisible=true;
	scene.add( light3 );

	const aLight= new THREE.AmbientLight( 0x908aff);
	scene.add(aLight)

	//creating a perspective camera
	camera=new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );


	//renderer initialised
	renderer=new THREE.WebGL1Renderer( {antialias:true} );
	renderer.shadowMapEnabled=true;

	//setting clear colour to background colour
	renderer.setClearColor( 0xffeeba )

	//added canvas element to html
	document.body.appendChild(renderer.domElement);

	function onWindowResize() {
		// Camera frustum aspect ratio
		camera.aspect = window.innerWidth / window.innerHeight;
		// After making changes to aspect
		camera.updateProjectionMatrix();
		// Reset size
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onWindowResize);

	onWindowResize()

	//set camera position
	camera.position.set(20,5,20); 
	camera.lookAt(new THREE.Vector3(0,5,0));



	//added controls to camera
	controls = new PointerLockControls( camera, renderer.domElement );
	scene.add( controls.getObject() );

}

function initCannon(){
	world=new CANNON.World();
	world.gravity.set(0,-20,0);

	const groundShape=new CANNON.Plane();
	const material=new CANNON.Material();
	var groundBody=new CANNON.Body({mass:0, material:material});
	groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2)
	groundBody.addShape(groundShape);
	world.add(groundBody);

	const sphereShape=new CANNON.Sphere(2);
	sphereBody=new CANNON.Body({mass: 3, material:material});
	sphereBody.position.x=camera.position.x;
	sphereBody.position.y=camera.position.y;
	sphereBody.position.z=camera.position.z;
	sphereBody.addShape(sphereShape);
	world.add(sphereBody)


}
init()
initCannon()
//add a plane to the scene
const PlaneGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
PlaneGeometry.rotateX( - Math.PI / 2 );
const PlaneMaterial = new THREE.MeshStandardMaterial( { color: 0x304050});
const floor=new THREE.Mesh(PlaneGeometry,PlaneMaterial);
floor.receiveShadow=true;
scene.add(floor)
//added a weird shape to the scene
const icosahedronGeometry = new THREE.IcosahedronGeometry(5, 0)
const icosahedronMaterial = new THREE.MeshNormalMaterial( {color: 0xffff00} );
const icosahedron = new THREE.Mesh( icosahedronGeometry, icosahedronMaterial );
icosahedron.position.set(0,5,0)
icosahedron.castShadow=true;
scene.add( icosahedron );

const position = icosahedron.geometry.attributes.position.array
const icosahedronPoints= []
for (let i = 0; i < position.length; i += 3) {
    icosahedronPoints.push(
        new CANNON.Vec3(position[i], position[i + 1], position[i + 2])
    )
}
const icosahedronFaces = []
for (let i = 0; i < position.length / 3; i += 3) {
    icosahedronFaces.push([i, i + 1, i + 2])
}
const icosahedronShape = new CANNON.ConvexPolyhedron(icosahedronPoints,icosahedronFaces	)

const icosahedronBody = new CANNON.Body({ mass: 1 })
icosahedronBody.addShape(icosahedronShape)
icosahedronBody.position.x = icosahedron.position.x
icosahedronBody.position.y = icosahedron.position.y
icosahedronBody.position.z = icosahedron.position.z
world.add(icosahedronBody)
//clock
let clock=new THREE.Clock()

document.addEventListener("click", ()=>{
	controls.lock()
})

//controls
var moveLeft=false, moveRight=false,moveFront=false,moveBack=false;

addEventListener("keydown", (e)=>{
	if(e.key=="Control") console.log(moveFront, moveBack, moveRight, moveLeft)
	if(e.key==" ") sphereBody.velocity.y=30;	
    if(e.key=="a" || e.key=="ArrowLeft" || e.key=="A"){
        moveLeft=true;
    }else if(e.key=="w" || e.key=="ArrowUp" ||e.key=="W"){
        moveFront=true;
    }else if(e.key=="s" || e.key=="ArrowDown" || e.key=="S"){
        moveBack=true;
    }else if(e.key=="d" || e.key=="ArrowRight" || e.key=="D"){
        moveRight=true;
    }
})

addEventListener("keyup", (e)=>{

    if(e.key=="a" || e.key=="ArrowLeft" || e.key=="A"){
        moveLeft=false;
    }else if(e.key=="w" || e.key=="ArrowUp" ||e.key=="W"){
        moveFront=false;
    }else if(e.key=="s" || e.key=="ArrowDown" || e.key=="S"){
        moveBack=false;
    }else if(e.key=="d" || e.key=="ArrowRight" || e.key=="D"){
        moveRight=false;
    }
})

function movePlayer(){
	let move=new CANNON.Vec3(0,0,0);
	if(moveBack || moveFront || moveLeft || moveRight){
		let speed=5;

		if(moveFront) move.z-=speed;
		if(moveBack) move.z+=speed;
		if(moveRight) move.x+=speed;
		if(moveLeft) move.x-=speed;
	
		//change move to the world frame
		new CANNON.Quaternion (camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w).vmult(move,move)
		
	}

	sphereBody.velocity.x=sphereBody.velocity.x*.8+move.x;
	
	sphereBody.velocity.z=sphereBody.velocity.z*.8+move.z;

	
	camera.position.x=sphereBody.position.x;
	camera.position.y=sphereBody.position.y;
	camera.position.z=sphereBody.position.z;
	

	icosahedron.position.x = icosahedronBody.position.x
	icosahedron.position.y = icosahedronBody.position.y
	icosahedron.position.z = icosahedronBody.position.z

	if(projectiles){
		projectiles.forEach( (projectile) =>{
			projectile.ThreeJS.position.x = projectile.CannonJS.position.x
			projectile.ThreeJS.position.y = projectile.CannonJS.position.y
			projectile.ThreeJS.position.z = projectile.CannonJS.position.z
		})
	}




	icosahedron.quaternion.set(
        icosahedronBody.quaternion.x,
        icosahedronBody.quaternion.y,
        icosahedronBody.quaternion.z,
        icosahedronBody.quaternion.w
    )

}


function renderScene(){
	world.step(1/60)

	

	requestAnimationFrame(renderScene)
	movePlayer()
	renderer.render(scene,camera)
}
renderScene()

var projectiles=[];
addEventListener("click", ()=>{

	const radius=0.5
	//three.js
	const ThreeGeometry=new THREE.SphereGeometry(radius);
	const ThreeMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	const ThreeSphere = new THREE.Mesh( ThreeGeometry, ThreeMaterial );
	scene.add( ThreeSphere );
	//cannon.js
	const CannonShape=new CANNON.Sphere(radius);
	const CannonMaterial=new CANNON.Material();
	const  CannonBody=new CANNON.Body({mass: 0.3, material:CannonMaterial});

	//positioning projectile out of camera sphere
	let move=new CANNON.Vec3(0,0,-3);
	new CANNON.Quaternion (camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w).vmult(move,move)


	CannonBody.position.x=camera.position.x+move.x;
	CannonBody.position.y=camera.position.y+move.y;
	CannonBody.position.z=camera.position.z+move.z;

	let vel=new CANNON.Vec3(0,0,-50);
	new CANNON.Quaternion (camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w).vmult(vel,vel)


	CannonBody.velocity.x=vel.x;
	CannonBody.velocity.y=vel.y;
	CannonBody.velocity.z=vel.z;

	sphereBody.velocity.x-=0.1*vel.x
	sphereBody.velocity.y-=0.1*vel.y
	sphereBody.velocity.z-=0.1*vel.z


	CannonBody.addShape(CannonShape);
	world.add(CannonBody)


	const projectile={
		ThreeJS: ThreeSphere,
		CannonJS: CannonBody
	}

	projectiles.push(projectile)
})