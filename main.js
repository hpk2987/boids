
window.onload = function(){
	webGLStart();
}

var clock = new THREE.Clock();
var scene;
var camera;
var renderer;
var boidsEngine;

function resizeViewportToScreen(renderer,camera){
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH,HEIGHT );
    
    if(camera){
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	}
}

function initializeScene(){
    // Renderer
    renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0x000000, 1);

	var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    
    renderer.setSize(canvasWidth,canvasHeight);
    
    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function() {
		resizeViewportToScreen(renderer,camera);
    });


    document.getElementById("canvas").appendChild(renderer.domElement);

	//Scene
    scene = new THREE.Scene();

    //Camara    
    camera = new THREE.PerspectiveCamera(
					45,
					canvasWidth / canvasHeight, 
					0.1, 
					2000);
    
    camera.up = new THREE.Vector3( 0, 0, 1 );
    camera.position.set(200,200,50);
    camera.lookAt(new THREE.Vector3(500,500,100));
    
    scene.add(camera);
        
    var light = new THREE.PointLight();
	light.position.set(500, 500, 500);
	scene.add(light);
    
    boidsEngine = new BOIDS.BoidsEngine();
    
    //Universe skydome
	/*var geometry = new THREE.SphereGeometry(2000, 60, 40);
	var uniforms = {
	  texture: { type: 't', value: loadTexture('/textures/skydome.jpg') }
	};

	var material = new THREE.ShaderMaterial( {
	  uniforms:       uniforms,
	  vertexShader:   document.getElementById('sky-vertex').textContent,
	  fragmentShader: document.getElementById('sky-fragment').textContent
	});

	skyBox = new THREE.Mesh(geometry, material);
	skyBox.scale.set(-1, 1, 1);
	skyBox.eulerOrder = 'XZY';
	skyBox.renderDepth = 1000.0;
	scene.add(skyBox);*/

    
    //Create Obstacles Meshes
    for ( var i=0 ; i<boidsEngine.universe.obstacles.length; i++){
		var obstacleMaterial = new THREE.MeshPhongMaterial({
			color:0xFFFFFF,
			wrapAround:  true
		});
		
		var obstacle = boidsEngine.universe.obstacles[i];
		var obstacleMesh = new THREE.Mesh(		
			new THREE.CylinderGeometry(
					obstacle.size,
					obstacle.size,
					obstacle.height),
					obstacleMaterial);
		obstacleMesh.add(new THREE.AxisHelper(2000));
		obstacleMesh.rotation.x = Math.PI/2;
		obstacleMesh.position.set(
			obstacle.position.x,
			obstacle.position.y,
			obstacle.position.z+obstacle.height/2);
		
		obstacle.mesh = obstacleMesh;
		scene.add(obstacle.mesh);
	}

	var loader = new THREE.JSONLoader();
	loader.load( 
		"models/Bird.js",
	 	function(geometry,materials){
			var material = new THREE.MeshFaceMaterial( materials );
			// enable skinning
			for (var i = 0; i < materials.length; i++) {
				materials[i].skinning = true;
			}
			
			// add animation data to the animation handler
			THREE.AnimationHandler.add(geometry.animations[0]);
				
			
		    //Create Boids Meshes
		    for ( var i=0 ; i<boidsEngine.universe.boids.length; i++){
				var boidMesh = new THREE.SkinnedMesh( geometry, material );
				boidMesh.scale.set(20,20,20);
				
				
				var boid = boidsEngine.universe.boids[i];
				boid.mesh = boidMesh;
				scene.add(boidMesh);

				// create animation
				animation = new THREE.Animation(
					boidMesh,
					'ArmatureAction',
					THREE.AnimationHandler.CATMULLROM
				);

				animation.play(true,Math.random()*1.2);

				boid.animation = animation;
			}
	 	});
}


var LookAroundControls = function(camera,element){
	this.camera = camera;
	
	var strafeStep = 10.0;	
	this.strafe = function(dir,camera){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		
		var strafeVec = lookDirection
			.crossVectors(lookDirection,camera.up);
		strafeVec.multiplyScalar(strafeStep/strafeVec.length()*dir);
		
		camera.position.set(
				camera.position.x+(strafeVec.x),
				camera.position.y+(strafeVec.y),
				camera.position.z+(strafeVec.z));
	}
	
	var moveStep = 10.0;
	this.move = function(dir,camera){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		lookDirection.z = 0;
		lookDirection.multiplyScalar(moveStep/lookDirection.length()*dir);
		
		camera.position.set(
				camera.position.x+(lookDirection.x),
				camera.position.y+(lookDirection.y),
				camera.position.z+(lookDirection.z));
	}
}

function initializeControls(){
	
	this.moveForward=false;
	this.moveBackward=false;
	this.moveLeft=false;
	this.moveRight=false;
	this.strafeSpeed = 0;
	this.straightSpeed = 0;
	
	this.onKeyDown = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};
	
	var strafe = function(dir,step){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		
		var strafeVec = lookDirection
			.crossVectors(lookDirection,camera.up);
		strafeVec.multiplyScalar(step/strafeVec.length()*dir);
		
		camera.position.set(
				camera.position.x+(strafeVec.x),
				camera.position.y+(strafeVec.y),
				camera.position.z+(strafeVec.z));
	}
	
	var move = function(dir,step){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		lookDirection.z = 0;
		lookDirection.multiplyScalar(step/lookDirection.length()*dir);
		
		camera.position.set(
				camera.position.x+(lookDirection.x),
				camera.position.y+(lookDirection.y),
				camera.position.z+(lookDirection.z));
	}
	
	var accel=1.0;
	var maxSpeed=14.0;
	this.update = function( delta ) {
		if(this.moveForward){
			this.straightSpeed += accel;
			if(this.straightSpeed>accel){
				this.straightSpeed = maxSpeed;
			}
			move(1,this.straightSpeed
		}
		
		if(this.moveBackward){
			this.straightSpeed += accel;
			if(this.straightSpeed>accel){
				this.straightSpeed = maxSpeed;
			}
			
		}
		
		if(this.moveLeft){
			
		}
		
		if(this.moveRight){
			
		}
	}
}

function renderScene(){
    requestAnimationFrame(renderScene);
    
    var delta = clock.getDelta();
    THREE.AnimationHandler.update( delta+0.01 );
    
	/*var refBoid = boidsEngine.universe.boids[0];
	var camPos = refBoid.position.sub(refBoid.velocity.mult(30));
	camera.position.set(
		camPos.x,
		camPos.y,
		camPos.z);
	var look = refBoid.position;
	camera.lookAt(new THREE.Vector3(look.x,look.y,look.z));*/
	
	for ( var i=0 ; i<boidsEngine.universe.boids.length; i++){
		var boid = boidsEngine.universe.boids[i];

		if(boid.mesh){
			
			boid.mesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);
			
			var polar = boid.velocity.polar();
		
			boid.mesh.rotation.x = 0;
			boid.mesh.rotation.y = 0;
			boid.mesh.rotation.z = 0;
			boid.mesh.rotateOnAxis(new THREE.Vector3(0,0,1),-polar.phi);
			boid.mesh.rotateOnAxis(new THREE.Vector3(1,0,0),polar.theta);
			
			//boid.animation.update(delta*Math.random);
		}
	}
	renderer.render(scene, camera);
	boidsEngine.engineLoop();
}

function webGLStart() {
    initializeScene();
    initializeControls();
    renderScene();
}
