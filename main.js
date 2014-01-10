
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
    /*camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 100);
    camera.position.set(0, 0, 0);
	camera.lookAt(scene.position);*/
    camera = new THREE.OrthographicCamera( 
					0, 
					1000,
					0, 
					1000, -50, 50 );
					
    camera.position.set(0, 0, -2);
    //camera.lookAt(scene.position);
    
    scene.add(camera);
    
    boidsEngine = new BOIDS.BoidsEngine();
    
    //Create Obstacles Meshes
    for ( var i=0 ; i<boidsEngine.universe.obstacles.length; i++){
		var circleMaterial = new THREE.MeshBasicMaterial({
			color:0xFFFFFF,
			side:THREE.DoubleSide
		});
		
		var obstacle = boidsEngine.universe.obstacles[i];
		var circleMesh = new THREE.Mesh(new THREE.CircleGeometry(obstacle.size), circleMaterial);
		circleMesh.position.set(
			obstacle.position.x,
			obstacle.position.y,
			obstacle.position.z);
		
		obstacle.mesh = circleMesh;
		scene.add(obstacle.mesh);
	}
    
    //Create Boids Meshes
    for ( var i=0 ; i<boidsEngine.universe.boids.length; i++){
		var boidGeometry = new THREE.Geometry();
		
		boidGeometry.vertices.push(new THREE.Vector3(-1.0,  1.0, 0.0));
		boidGeometry.vertices.push(new THREE.Vector3(-1.0,  -1.0, 0.0));
		boidGeometry.vertices.push(new THREE.Vector3( 0.0,  0.0, 0.0));		
		boidGeometry.faces.push(new THREE.Face3(0, 1, 2));
		
		// Create a white basic material and activate the 'doubleSided' attribute.
		var boidMaterial = new THREE.MeshBasicMaterial({
			color:0xFFFFFF,
			side:THREE.DoubleSide
		});

		var boid = boidsEngine.universe.boids[i];

		// Create a mesh and insert the geometry and the material.
		var boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);
		boidMesh.position.set(
			boid.position.x,
			boid.position.y,
			boid.position.z);
		boidMesh.scale.set(8,8,1);
		boid.mesh = boidMesh;
		
		scene.add(boidMesh);
		
		var velocityGeometry = new THREE.Geometry();
		velocityGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		velocityGeometry.vertices.push(new THREE.Vector3(1,0,0));
		velocityGeometry.vertices.push(new THREE.Vector3(0.85,0.1,0));
		velocityGeometry.vertices.push(new THREE.Vector3(0.85,-0.1,0));
		velocityGeometry.vertices.push(new THREE.Vector3(1,0,0));
		
		var velocityMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff
		});
		
		var velocityMesh = new THREE.Line(velocityGeometry, velocityMaterial);
		velocityMesh.position.set(
			boid.position.x,
			boid.position.y,
			boid.position.z);
		velocityMesh.scale.set(30,30,1);
		boid.velocityMesh = velocityMesh;		
		scene.add(velocityMesh);
	}
}


function renderScene(){
    var delta=(Date.now()-lastRenderTime)/1000;
    if (delta>0){
        for ( var i=0 ; i<boidsEngine.universe.boids.length; i++){
			var boid = boidsEngine.universe.boids[i];
			console.log(boid.num+" x =[ "+boid.position.x+" , "+boid.position.y+" , "+boid.position.z+ " ] ");
			boid.mesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);
			
			var angle = Math.acos(boid.velocity.x/boid.velocity.norm());
			
			if(boid.velocity.y < 0){
				angle = -angle;
			}
			
			boid.mesh.rotation.z = angle;
			
			console.log(boid.num+" v =[ "+boid.velocity.x+" , "+boid.velocity.y+" , "+boid.velocity.z+ " ] ");
			
			boid.velocityMesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);
				
			
			boid.velocityMesh.rotation.z = angle;
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
