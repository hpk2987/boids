
window.onload = function(){
	webGLStart();
}

var lastRenderTime = Date.now();
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
    camera.position.set(500,0,700);
    camera.lookAt(new THREE.Vector3(500,500,100));
    
    scene.add(camera);
        
    var light = new THREE.PointLight();
	light.position.set(500, 500, 500);
	scene.add(light);
    
    boidsEngine = new BOIDS.BoidsEngine();
    
    //Universe
    var universeGeometry = new THREE.CubeGeometry( 
							boidsEngine.universe.width,
							boidsEngine.universe.height,
							boidsEngine.universe.depth);
	
	var universeMaterial = new THREE.MeshBasicMaterial({
		color:0xFFFFFF,
		//wrapAround:  true
		//side:THREE.DoubleSide
		wireframe:true
	} );

	scene.add(new THREE.AxisHelper(2000));
	var universeMesh = new THREE.Mesh( universeGeometry, universeMaterial );
	universeMesh.position.set(500,500,500);
    boidsEngine.universe.mesh = universeMesh;
    scene.add(universeMesh);
    
    
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
		"models/Bird2.js",
	 	function(geometry,materials){
		    //Create Boids Meshes
		    for ( var i=0 ; i<boidsEngine.universe.boids.length; i++){
				var material = new THREE.MeshFaceMaterial( materials );
				
	            var boidMesh = new THREE.Mesh( geometry, material );
				boidMesh.scale.set(20,20,20);
				
				var boid = boidsEngine.universe.boids[i];
				boid.mesh = boidMesh;
				scene.add(boidMesh);
			}
	 	});
}


function renderScene(){
    var delta=(Date.now()-lastRenderTime)/1000;
    if (delta>0){
		/*var refBoid = boidsEngine.universe.boids[0];
		camera.position.set(
			refBoid.position.x,
			refBoid.position.y,
			refBoid.position.z);
		var look = refBoid.position.add(refBoid.velocity);
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
			}
			
		}
		lastRenderTime=Date.now();
		renderer.render(scene, camera);
		boidsEngine.engineLoop();
		
	}
    requestAnimationFrame(renderScene);
}

function justDoit(){
	boidsEngine.engineLoop();
}

function webGLStart() {
    initializeScene();    
    renderScene();
}
