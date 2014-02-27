/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );
	camera.up = new THREE.Vector3( 0, 0, 1 );
    
    camera.position.set(0,0,10);
    camera.lookAt(new THREE.Vector3(-1,0,10));
    
    var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );	

	var yawObject = new THREE.Object3D();
	yawObject.position.z = 10;
	yawObject.position.set(400,400,10);
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.z -= movementX * 0.002;
		pitchObject.rotation.y -= movementY * 0.002;

		pitchObject.rotation.y = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.y ) );

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.z += 3;
				canJump = false;
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.getObject = function () {

		return yawObject;

	};

	this.enabled = false;

	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;

		delta *= 100;

		velocity.x += ( - velocity.x ) * 0.08 * delta;
		velocity.y += ( - velocity.y ) * 0.08 * delta;
		
		velocity.z -= 0.25 * delta;

		if ( moveForward ) velocity.x -= 0.52 * delta;
		if ( moveBackward ) velocity.x += 0.52 * delta;

		if ( moveLeft ) velocity.y -= 0.52 * delta;
		if ( moveRight ) velocity.y += 0.52 * delta;
		
		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		if(	yawObject.position.x<0) yawObject.position.x = 0;
		if( yawObject.position.x>1000) yawObject.position.x = 1000;
		if(	yawObject.position.y<0) yawObject.position.y = 0;
		if( yawObject.position.y>1000) yawObject.position.y = 1000;


		if ( yawObject.position.z < 10 ) {

			velocity.z = 0;
			yawObject.position.z = 10;

			canJump = true;

		}

	};

};
