var clock = new THREE.Clock();
var scene;
var camera;
var renderer;
var boidsEngine;
var controls;
var stats;

window.onload = function(){
	initStats();
	initializeScene();
	pointerLockInit();	
    renderScene();
}

function initStats(){
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );
}

function pointerLockInit(){
	var blocker = document.getElementById( 'blocker' );

	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {
		var element = document.body;
		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				controls.enabled = true;
				blocker.style.display = 'none';
			} else {
				controls.enabled = false;
				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';
			}
		}

		var pointerlockerror = function ( event ) {
			instructions.style.display = '';
		}

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.addEventListener( 'click', function ( event ) {
			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			
			if ( /Firefox/i.test( navigator.userAgent ) ) {
				var fullscreenchange = function ( event ) {
					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
						
						element.requestPointerLock();
					}
				}

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
				element.requestFullscreen();

			} else {
				element.requestPointerLock();
			}
		}, false );
	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
}

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


    document.body.appendChild( renderer.domElement );

	//Scene
    scene = new THREE.Scene();
	
    //Camara    
    camera = new THREE.PerspectiveCamera(
					45,
					canvasWidth / canvasHeight, 
					0.1, 
					5000);
    
    controls = new THREE.PointerLockControls(camera);
        
    scene.add( controls.getObject() );
		
    var light = new THREE.DirectionalLight( 0xE8DB90, 0.5 );
	light.position.set(-500, 500, 20);
	
	scene.add(new THREE.AxisHelper(2000));
	
	scene.add(light);
    
    boidsEngine = new BOIDS.BoidsEngine();
    
    //Universe skydome
	var geometry = new THREE.SphereGeometry(3000, 60, 40,0,Math.PI*2,0,Math.PI);
	var uniforms = {
	  texture: { type: 't', value: THREE.ImageUtils.loadTexture('/textures/skydome.jpg') }
	};

	var material = new THREE.ShaderMaterial( {
	  uniforms:       uniforms,
	  vertexShader:   document.getElementById('sky-vertex').textContent,
	  fragmentShader: document.getElementById('sky-fragment').textContent
	});

	skyBox = new THREE.Mesh(geometry, material);
	skyBox.scale.set(-1, 1, 1);
	skyBox.rotation.x = Math.PI/2;
	skyBox.renderDepth = 1000.0;
	scene.add(skyBox);

	// Ground
	var groundTexture = THREE.ImageUtils.loadTexture('/textures/grass_128x128.png');
	
	// assuming you want the texture to repeat in both directions:
	groundTexture.wrapS = THREE.RepeatWrapping; 
	groundTexture.wrapT = THREE.RepeatWrapping;

	// how many times to repeat in each direction; the default is (1,1),
	//   which is probably why your example wasn't working
	groundTexture.repeat.set( 100, 100 ); 

	groundMesh = new THREE.Mesh( 
		new THREE.PlaneGeometry(1000, 1000, 70, 70), 
		new THREE.MeshBasicMaterial({map: groundTexture}));
		
	groundMesh.position.set(500,500,0);
	scene.add(groundMesh);
    
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

function renderScene(){
    requestAnimationFrame(renderScene);
    
    var delta = clock.getDelta();
    THREE.AnimationHandler.update( delta+0.01 );
    
	controls.update(delta);
	
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
	stats.update();
}
