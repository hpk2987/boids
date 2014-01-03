var BOIDS = { REVISION : '1' }

BOIDS.Vec3 = function(){
	this.x=0.0
	this.y=0.0
}

BOIDS.Vec3

BOIDS.Boid = function(){
	this.position=0;
}

BOIDS.Boid.prototype.getPosition = function(){
	return this.position;
} 