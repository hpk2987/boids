var BOIDS = { REVISION : '1' };

BOIDS.Vec3 = function(x,y,z){
	this.x=x;
	this.y=y;
	this.z=z;
};

BOIDS.Vec3.prototype.add = function(vec){
	return new BOIDS.Vec3(
		this.x+vec.x,
		this.y+vec.y,
		this.z+vec.z);
};

BOIDS.Vec3.prototype.sub = function(vec){
	return new BOIDS.Vec3(this.x-vec.x,this.y-vec.y,this.z-vec.z);
};

BOIDS.Vec3.prototype.mult = function(scalar){
	return new BOIDS.Vec3(this.x*scalar,this.y*scalar,this.z*scalar);
};

BOIDS.Vec3.prototype.norm = function(){
	return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)+Math.pow(this.z,2));
};

BOIDS.Vec3.prototype.getIdx = function(idx){
	if( idx=== 0){
		return this.x;
	}else if( idx== 1){
		return this.y;
	}else if( idx== 2){
		return this.z;
	}
};

BOIDS.Boid = function(num,position,velocity){
	this.position = position;
	this.velocity = velocity;
	this.viewDistance = 3;
	this.num=num;
};

BOIDS.Boid.prototype.update = function(){
	this.position = this.position.add(this.velocity);
};

BOIDS.BoidsUniverse = function(){
	this.rules = [
		new BOIDS.RuleFlockCenterOfMass(),
		new BOIDS.RuleAvoidCollisions(),
		new BOIDS.RuleMatchFlockVelocity(),
		new BOIDS.RuleKeepInBounds(),
		new BOIDS.RuleReachObjective(),
		new BOIDS.RuleSpeedLimit()];
	this.boids = [];
	this.width = 1000;
	this.height = 1000;
	this.depth = 1000;
	this.boidCreationCounter=0;	
};
	
BOIDS.BoidsUniverse.prototype.createBoid = function(position,velocity){
	var boid = new BOIDS.Boid(this.boidCreationCounter,position,velocity);
	this.boidCreationCounter+=1;
	this.boids.push(boid);
	return boid;
};

BOIDS.BoidsUniverse.prototype.createBoids = function(amount){
	var randomPosition;
	var randomVelocity;
	for (var i=0 ; i<amount ; i++){
		randomPosition = new BOIDS.Vec3(
			Math.random()*this.width/10,
			Math.random()*this.height/10,
			0);
		randomVelocity = new BOIDS.Vec3(
			Math.random()*3,
			Math.random()*3,
			0);
		this.createBoid(randomPosition,randomVelocity);
	}			
};

BOIDS.BoidsUniverse.prototype.update = function(){
	var deltaVelocity;
	for(var i=0; i<this.boids.length ;i++){
		deltaVelocity = new BOIDS.Vec3(0,0,0);
		for(var w=0; w<this.rules.length ;w++){
			deltaVelocity = deltaVelocity.add(this.rules[w].apply(this.boids[i],this,deltaVelocity));
		}
		this.boids[i].velocity = this.boids[i].velocity.add(deltaVelocity);
		this.boids[i].update();
	}
};

BOIDS.BoidsEngine = function(){
	this.universe = new BOIDS.BoidsUniverse();
	this.universe.createBoids(10);
};
		
BOIDS.BoidsEngine.prototype.engineLoop = function(){
	this.universe.update();
};

BOIDS.RuleFlockCenterOfMass = function(){
	this.influence = 0.01;
};
	
BOIDS.RuleFlockCenterOfMass.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	var count = 1;
	for(var i=0; i<universe.boids.length ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid && boid.position.sub(otherBoid.position).norm()<boid.viewDistance ) {
			c = c.add(otherBoid.position);
			count++;
		}
	}
	c = c.mult(1 / count);
	return (c.sub(boid.position)).mult(this.influence);
};

BOIDS.RuleAvoidCollisions = function() {
	this.minDistance = 10;
};
	
BOIDS.RuleAvoidCollisions.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	for(var i=0; i<universe.boids.length ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid) {
			if (boid.position.sub(otherBoid.position).norm() < this.minDistance){
				c = c.add(boid.position.sub(otherBoid.position));
			}
		}
	}

	return c;
};
		
BOIDS.RuleMatchFlockVelocity = function(){
	this.influence = 0.01;
};	

BOIDS.RuleMatchFlockVelocity.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	var count = 1;
	for(var i=0; i<universe.boids.length ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid && boid.position.sub(otherBoid.position).norm()<boid.viewDistance) {
			c = c.add(otherBoid.velocity);
			count++;
		}
	}
	c = c.mult( 1 / count);
	
	return (c.sub(boid.velocity)).mult(this.influence);
};

BOIDS.RuleKeepInBounds = function(){
	this.attraction=10;
};

BOIDS.RuleKeepInBounds.prototype.apply = function(boid,universe,acumm) {
	var c = [0,0,0];
	var ref = [universe.width,universe.height,universe.depth];
	for (var i=0 ; i<3 ; i++){
		if(boid.position.getIdx(i)>ref[i]){
			c[i] -= this.attraction;
		}else if(boid.position.getIdx(i)<0){
			c[i] = this.attraction;
		}
	}
	return new BOIDS.Vec3(c[0],c[1],c[2]);
};

BOIDS.RuleSpeedLimit = function(){
	this.limit = 0.2;
};

BOIDS.RuleSpeedLimit.prototype.apply = function(boid,universe,acumm){
	var c = boid.velocity.add(acumm);
	speed = c.norm();
	if (speed > this.limit){
		c = (c).mult((this.limit/speed)-1);
	}
		
	return c;
};

BOIDS.RuleReachObjective = function(){
	this.influence = 0.1;
	this.objective = new BOIDS.Vec3(900,900,0);
} 

BOIDS.RuleReachObjective.prototype.apply = function(boid,universe,acumm){
	var c = this.objective.sub(boid.position);
	c = c.mult(1/c.norm()).mult(this.influence);
	return c;
};
