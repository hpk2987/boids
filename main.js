
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

var rotObjMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // new code for Three.js r50+:
    object.rotation.setFromRotationMatrix(object.matrix);
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
    camera.position.set(90,90,90);
    camera.lookAt(new THREE.Vector3(0,0,0));
    
    scene.add(camera);
        
    var light = new THREE.PointLight();
	light.position.set(0, 0, 60);
	scene.add(light);
    
    boidsEngine = new BOIDS.BoidsEngine();
    
    //Universe
    var universeGeometry = new THREE.CubeGeometry( 
							50,50,50);
							/*boidsEngine.universe.width,
							boidsEngine.universe.height,
							boidsEngine.universe.depth);*/
	
	var universeMaterial = new THREE.MeshPhongMaterial({
		color:0xFFFFFF,
		wrapAround:  true
		//side:THREE.DoubleSide
		//wireframe:true
	} );

	scene.add(new THREE.AxisHelper(2000));
	var universeMesh = new THREE.Mesh( universeGeometry, universeMaterial );
	universeMesh.add(new THREE.AxisHelper(2000));
	universeMesh.position.set(0,0,0);
	
	rotateAroundObjectAxis(universeMesh,new THREE.Vector3(0,0,1),Math.PI/4);
	rotateAroundObjectAxis(universeMesh,new THREE.Vector3(0,1,0),Math.PI/4);
	universeMesh.rotation.z=0;
	universeMesh.rotation.x=0;
	universeMesh.rotation.y=0;
	rotateAroundObjectAxis(universeMesh,new THREE.Vector3(0,1,0),Math.PI/4);
	
	//universeMesh.rotation.z=Math.PI/4;
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
		boidMesh.add(new THREE.AxisHelper(50));
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
			
			var phi = Math.PI/2+Math.atan(boid.velocity.x/boid.velocity.y);
			
			/*if(boid.velocity.x < 0){
				phi = -phi;
			}*/
			
			var theta = Math.PI/2-Math.acos(boid.velocity.z/velNorm);
			
			/*if(boid.velocity.z < 0){
				angleX = -angleX;
			}*/
			
			/*boid.mesh.rotation.x = theta;
			boid.mesh.rotation.z = phi;*/
			
			/*boid.mesh.rotation.y = angleZ;*/
			
			//console.log(boid.num+" v =[ "+boid.velocity.x+" , "+boid.velocity.y+" , "+boid.velocity.z+ " ] ");
			
			boid.velocityMesh.position.set(
				boid.position.x,
				boid.position.y,
				boid.position.z);
				
			
			boid.velocityMesh.rotation.x = theta;
			boid.velocityMesh.rotation.z = phi;
			
		}
		lastRenderTime=Date.now();
		renderer.render(scene, camera);
		//boidsEngine.engineLoop();
		
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
