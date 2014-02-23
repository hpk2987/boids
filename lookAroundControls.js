LookAroundControls = function(camera,domElement){
	
	this.moveForward	= false;
	this.moveBackward	= false;
	this.moveLeft		= false;
	this.moveRight		= false;
	this.domElement 	= domElement;
	
	this.drag = {
		dragging:false,
		xStart:0,
		yStart:0,
		yCurr:0,
		xCurr:0,
		xDelta:function(){ return this.xCurr-this.xStart; },
		yDelta:function(){ return this.yCurr-this.yStart; }
	}
		
	
	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}
		event.preventDefault();
		event.stopPropagation();
		this.drag.dragging = true;
		this.drag.xStart = event.pageX;
		this.drag.yStart = event.pageY;
	};

	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		this.drag.dragging = false;
	};
	
	this.onMouseMove = function ( event ) {
		this.drag.xCurr = event.pageX;
		this.drag.yCurr = event.pageY;
	};
	
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
	
	var strafe = function(step){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		
		var strafeVec = lookDirection
			.crossVectors(lookDirection,camera.up);
		strafeVec.multiplyScalar(step/strafeVec.length());
		
		camera.position.set(
				camera.position.x+(strafeVec.x),
				camera.position.y+(strafeVec.y),
				camera.position.z+(strafeVec.z));
	}
	
	var move = function(step){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		lookDirection.z = 0;
		lookDirection.multiplyScalar(step/lookDirection.length());
		
		camera.position.set(
				camera.position.x+(lookDirection.x),
				camera.position.y+(lookDirection.y),
				camera.position.z+(lookDirection.z));
	}
	
	var rotationMatrixY = new THREE.Matrix4();
	var rotationMatrixZ = new THREE.Matrix4();
	var rotate = function(xDelta,yDelta){
		var lookDirection = new THREE.Vector3(0,0,-1);
		lookDirection.applyQuaternion( camera.quaternion );		
		lookDirection.z = 0;
		lookDirection.multiplyScalar(1/lookDirection.length());
		
		rotationMatrixY.makeRotationAxis(new THREE.Vector3(0,0,1),xDelta*Math.PI/6);
		rotationMatrixZ.makeRotationAxis(new THREE.Vector3(0,1,0),yDelta*Math.PI/6);
		lookDirection.applyMatrix4(rotationMatrixZ.multiply(rotationMatrixY));
		
		camera.lookAt(
			new THREE.Vector3(
				lookDirection.x,
				lookDirection.y,
				lookDirection.z));
	}
	
	var speed=5.0;
	this.update = function( delta ) {
		if(this.moveForward){
			move(speed);
		}else if(this.moveBackward){
			move(-speed);
		}
		
		if(this.moveLeft){
			strafe(-speed);
		}else if(this.moveRight){
			strafe(speed);
		}
		
		if(this.drag.dragging){
			rotate(this.drag.xDelta(),this.drag.yDelta());
		}
	}
	
	var bind = function( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};
	
	this.domElement.addEventListener("keydown",bind(this,this.onKeyDown),false);
	this.domElement.addEventListener("keyup",bind(this,this.onKeyUp),false);
	this.domElement.addEventListener("mousedown",bind(this,this.onMouseDown),false);
	this.domElement.addEventListener("mouseup",bind(this,this.onMouseUp),false);
	this.domElement.addEventListener("mousemove",bind(this,this.onMouseMove),false);
	
}
