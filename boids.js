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
	this.viewDistance = 100;
	this.num=num;
};

BOIDS.Boid.prototype.update = function(){
	this.position = this.position.add(this.velocity);
};

BOIDS.Obstacle = function(position,size,height){
	this.size = size;
	this.height=height;
	this.position = position;
}

BOIDS.Obstacle.prototype.isInside = function(point){
	if(point.z > this.height){
		return false;
	}
	var w = new BOIDS.Vec3(point.x,point.y,this.position.z);
	return (w.sub(this.position).norm() < this.size);
}

BOIDS.Obstacle.prototype.getDeflect = function(point){
	var w = new BOIDS.Vec3(point.x,point.y,this.position.z);
	return w.sub(this.position);
}

BOIDS.BoidsUniverse = function(){
	this.rules = [
		new BOIDS.RuleFlockCenterOfMass(),
		new BOIDS.RuleSeparateFlock(),
		new BOIDS.RuleMatchFlockVelocity(),
		new BOIDS.RuleKeepInBounds(),
		new BOIDS.RuleReachObjective(),
		new BOIDS.RuleAvoidCollision(),
		new BOIDS.RuleSpeedLimit()];
	this.boids = [];
	this.obstacles = [];
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

BOIDS.BoidsUniverse.prototype.createObstacles = function(amount){
	this.obstacles.push(new BOIDS.Obstacle(new BOIDS.Vec3(500,500,0),60,120));
};

BOIDS.BoidsUniverse.prototype.createBoids = function(amount){
	var randomPosition;
	var randomVelocity;
	for (var i=0 ; i<amount ; i++){
		randomPosition = new BOIDS.Vec3(
			Math.random()*this.width,
			Math.random()*this.height,
			Math.random()*this.depth);
		randomVelocity = new BOIDS.Vec3(
			Math.random()*3,
			Math.random()*3,
			Math.random()*3);
		this.createBoid(randomPosition,randomVelocity);
	}			
};

BOIDS.BoidsUniverse.prototype.update = function(){
	var deltaVelocity;
	for(var i=0; i<this.boids.length ;i++){
		this.boids[i].update();
	}
	
	for(var i=0; i<this.boids.length ;i++){
		deltaVelocity = new BOIDS.Vec3(0,0,0);
		for(var w=0; w<this.rules.length ;w++){
			deltaVelocity = deltaVelocity.add(this.rules[w].apply(this.boids[i],this,deltaVelocity));
		}
		this.boids[i].velocity = this.boids[i].velocity.add(deltaVelocity);		
	}
};

BOIDS.BoidsEngine = function(){
	this.universe = new BOIDS.BoidsUniverse();
	this.universe.createBoids(5);
	//this.universe.createObstacles(1);
};
		
BOIDS.BoidsEngine.prototype.engineLoop = function(){
	this.universe.update();
};

BOIDS.RuleFlockCenterOfMass = function(){
	this.influence = 0.004;
};
	
BOIDS.RuleFlockCenterOfMass.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	var count = 0;
	for(var i=0; i<universe.boids.length ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid && boid.position.sub(otherBoid.position).norm()<boid.viewDistance ) {
			c = c.add(otherBoid.position);
			count++;
		}
	}
	if (count!=0){
		c = c.mult(1 / count);
		return (c.sub(boid.position)).mult(this.influence);
	}else{
		return new BOIDS.Vec3(0,0,0);
	}
};

BOIDS.RuleSeparateFlock = function() {
	this.influence = 0.09;
	this.distance = 20.0;
};	
BOIDS.RuleSeparateFlock.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	for(var i=0; i<universe.boids.length ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid) {
			if (boid.position.sub(otherBoid.position).norm() < this.distance){
				c = c.add(boid.position.sub(otherBoid.position));
			}
		}
	}

	return c.mult(this.influence);
};
		
BOIDS.RuleMatchFlockVelocity = function(){
	this.influence = 0.04;
};	

BOIDS.RuleMatchFlockVelocity.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	var count = 0;
	for(var i=0; i<universe.boids.length ;i++){
		var otherBoid = universe.boids[i];
		if (otherBoid!=boid && boid.position.sub(otherBoid.position).norm()<boid.viewDistance) {
			c = c.add(otherBoid.velocity);
			count++;
		}
	}
	
	if (count!=0){
		c = c.mult( 1 / count);	
		return (c.sub(boid.velocity)).mult(this.influence);
	}else{
		return new BOIDS.Vec3(0,0,0);
	}
};

BOIDS.RuleKeepInBounds = function(){
	this.attraction=0.1;
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
	this.limit = 1.3;
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
	this.influence = 0.08;
	//this.objectiveSpeed = new BOIDS.Vec3(0.1,0.1,0);
	this.objective = new BOIDS.Vec3(900,900,0);
} 

BOIDS.RuleReachObjective.prototype.apply = function(boid,universe,acumm){
	if(boid.position.sub(this.objective).norm()<10){
		this.objective = new BOIDS.Vec3(
					this.objective.x==0?900:0,
					this.objective.y==0?900:0,
					this.objective.z==0?0:0);
	}
	
	var c = this.objective.sub(boid.position);
	c = c.mult(1/c.norm()).mult(this.influence);
	return c;
	/*return this.objectiveSpeed.mult(this.influence);*/
};

BOIDS.RuleAvoidCollision = function() {
	this.feelerPrediction = 15;
};
	
BOIDS.RuleAvoidCollision.prototype.apply = function(boid,universe,acumm){
	var c = new BOIDS.Vec3(0,0,0);
	for(var i=0; i<universe.obstacles.length ;i++){
		var obstacle = universe.obstacles[i];
		var feeler = boid.position.add(boid.velocity.mult(this.feelerPrediction));
		if (obstacle.isInside(feeler)){
			var w = obstacle.getDeflect(feeler);
			c = c.add(w.mult(20));
		}
	}

	return c;
};
