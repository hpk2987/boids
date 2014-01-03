var BOIDS = { REVISION : '1' }

BOIDS.Vec3 = function(x,y,z){
	this.x=x
	this.y=y
	this.z=z
}

BOIDS.Vec3.prototype.add = function(vec){
	return new Vec3(this.x+vec.x,this.y+vec.y,this.z+vec.z);
}

BOIDS.Vec3.prototype.sub = function(vec){
	return new Vec3(this.x-vec.x,this.y-vec.y,this.z-vec.z);
}

BOIDS.Vec3.prototype.mult = function(scalar){
	return new Vec3(this.x*scalar,this.y*scalar,this.z*scalar);
}

BOIDS.Vec3.prototype.norm = function(){
	return new Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)+Math.pow(this.z,2));
}

BOIDS.Boid = function(num,position){
	this.position=0;
	this.velocity = new Vec3(0,0,0);
	this.num=num;
}

BOIDS.Boid.prototype.update = function(){
	this.position = this.position.add(self.velocity);
}

BOIDS.BoidsUniverse = function(){
	this.rules = [RuleFlockCenterOfMass(),RuleAvoidCollisions(),RuleMatchFlockVelocity(),RuleKeepInBounds(),RuleSpeedLimit()];
	this.boids = [];
	this.width = 1000;
	this.height = 1000;
	this.depth = 1000;
	this.boidCreationCounter=0;
	if (startingBoids > 0){
		self.createBoids(10);
	}
}
	
BOIDS.BoidsUniverse.prototype.createBoid = function(position){
	boid = new Boid(this.boidCreationCounter,position);
	self.boidCreationCounter+=1;
	self.boids.push(boid);
	return boid;
}

BOIDS.BoidsUniverse.prototype.createBoids = function(amount=20){
	var randomPosition;
	for (var i=0 ; i<amount ; i++){
		randomPosition = new Vec3(
			Math.random*this.width/10,
			Math.random*this.height/10,
			0);
	}		
	this.createBoid(randomPosition);
}

BOIDS.BoidsUniverse.prototype.update = function(){
	var deltaVelocity;
	for(var i=0; i<this.boids.lenght ;i++){
		deltaVelocity = new Vec3(0,0,0);
		for(var w=0; w<this.rules.lenght ;w++){
			deltaVelocity = deltaVelocity.add(this.rules[w].apply(this.boids[i],this,deltaVelocity);
		}
		this.boids[s].velocity = this.boids[s].velocity.add(deltaVelocity);
		this.boids[s].update();
	}
}

BOIDS.BoidsEngine = function(){
	this.universe = new BoidsUniverse();
	this.universe.createBoids();
}
		
BOIDS.BoidsEngine.prototype = engineLoop(){
	this.universe.update();
}

BOIDS.RuleFlockCenterOfMass = function(){
	this.influence = 0.01;
}
	
BOIDS.RuleFlockCenterOfMass.prototype.apply = function(boid,universe,acumm){
	var c = new Vec3(0,0,0);
	for(var i=0; i<universe.boids.lenght ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid) {
			c = c.add(otherBoid.position);
		}
	}
	c = c.mult(1 / (universe.boids.length)-1));
	return (c.sub(boid.position)).mult(this.influence);
}

BOIDS.RuleAvoidCollisions = function() {
	this.minDistance = 10;
}
	
BOIDS.RuleAvoidCollisions.prototype.apply = function(boid,universe,acumm){
	var c = new Vec3(0,0,0);
	for(var i=0; i<universe.boids.lenght ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid) {
			if (boid.position.sub(otherBoid.position)).norm() < this.minDistance:
				c = c.add(boid.position.sub(otherBoid.position));
		}
	}

	return c;
}
		
class RuleMatchFlockVelocity:
	def __init__(this,influence=0.01):
		this.influence = influence
	
	def apply(this,boid,universe,acumm):
		c = array([0,0,0])
		for otherBoid in universe.boids:
			if otherBoid!=boid:
				c += otherBoid.velocity
		c = c / (len(universe.boids)-1)
		
		return (c - boid.velocity)*this.influence

class RuleKeepInBounds:
	def __init__(this,attraction=20):
		this.attraction=attraction
	
	def apply(this,boid,universe,acumm):
		c = array([0,0,0])
		ref = array([universe.width,universe.height,universe.depth])
		for i in range(3):
			if(boid.position[i]>ref[i]):
				c[i] -= this.attraction
			elif (boid.position[i]<0):
				c[i] = this.attraction
		
		return c

class RuleSpeedLimit:
	def __init__(this,limit=10):
		this.limit = limit
	
	def apply(this,boid,universe,acumm):
		c = boid.velocity + acumm
		speed = linalg.norm(c)
		if (speed > this.limit):
			c = (c)*((this.limit/speed)-1)
			
		return c
