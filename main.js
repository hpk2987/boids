
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
					1500);
					
	
    /*camera = new THREE.OrthographicCamera( 
					0, 
					1000,
					0, 
					1000, -60, 800 );*/
					
    //camera.position.set(0, 0, -2);
    
    camera.up = new THREE.Vector3( 0, 0, 1 );
    camera.position.set(0,0,0);
    camera.lookAt(new THREE.Vector3(500,500,0));
    
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
		//side:THREE.DoubleSide
		wireframe:true
	} );

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
			obstacle.position.z+obstacle.size/2);
		
		obstacle.mesh = obstacleMesh;
		scene.add(obstacle.mesh);
	}
    
    //Create Boids Meshes
    for ( var i=0 ; i<boidsEngine.universe.boids.length; i++){
		//var boidGeometry = new THREE.Geometry();
		
		var boidGeometry = new THREE.CylinderGeometry(
					0,
					4,
					15);
		
		/*boidGeometry.vertices.push(new THREE.Vector3(-0.5,  1.0, 0.0));
		boidGeometry.vertices.push(new THREE.Vector3(-0.5,  -1.0, 0.0));
		boidGeometry.vertices.push(new THREE.Vector3( 0.5,  0.0, 0.0));		
		boidGeometry.faces.push(new THREE.Face3(0, 1, 2));*/
		
		// Create a white basic material and activate the 'doubleSided' attribute.
		var boidMaterial = new THREE.MeshPhongMaterial({
			color:0xFFFF00,
			wrapAround:  true
		});

		var boid = boidsEngine.universe.boids[i];

		// Create a mesh and insert the geometry and the material.
		var boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);
		boidMesh.position.set(
			boid.position.x,
			boid.position.y,
			boid.position.z);
		boid.mesh = boidMesh;
		
		scene.add(boidMesh);
		
		var velocityGeometry = new THREE.Geometry();
		velocityGeometry.vertices.push(new THREE.Vector3(0,0, 0));
		velocityGeometry.vertices.push(new THREE.Vector3(0,1,0));		
		
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
		
		// boid sight
		/*var circleMaterial = new THREE.MeshBasicMaterial({
			color:0xFFFFFF,
			wireframe: true,
			side:THREE.DoubleSide
		});
		
		var circleMesh = new THREE.Mesh(new THREE.CircleGeometry(boid.viewDistance), circleMaterial);
		circleMesh.position.set(
			boid.position.x,
			boid.position.y,
			boid.position.z);
		
		boid.sightMesh = circleMesh;
		scene.add(circleMesh);*/
	}
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
			//console.log(boid.num+" x =[ "+boid.position.x+" , "+boid.position.y+" , "+boid.position.z+ " ] ");
			boid.mesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);
			
			/*boid.sightMesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);*/
			
			var velNorm = boid.velocity.norm();
			
			var angleZ = Math.acos(boid.velocity.y/velNorm);
			
			if(boid.velocity.x < 0){
				angleZ = -angleZ;
			}
			
			var angleX = Math.acos(
							Math.sqrt(
								Math.pow(boid.velocity.x,2)+
								Math.pow(boid.velocity.y,2))/velNorm);
			
			/*if(boid.velocity.z < 0){
				angleX = -angleX;
			}*/
			
			boid.mesh.rotation.x =  angleX;
			boid.mesh.rotation.z = -angleZ;
			
			/*boid.mesh.rotation.y = angleZ;*/
			
			//console.log(boid.num+" v =[ "+boid.velocity.x+" , "+boid.velocity.y+" , "+boid.velocity.z+ " ] ");
			
			boid.velocityMesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);
				
			
			boid.velocityMesh.rotation.x = angleX;
			boid.velocityMesh.rotation.z = -angleZ;
			
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
