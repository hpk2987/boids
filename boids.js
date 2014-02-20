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

BOIDS.Vec3.prototype.normalize = function(){
	var norm = this.norm();
	if(norm==0){
		return new BOIDS.Vec3(0,0,0);
	}
	return new BOIDS.Vec3(this.x/norm,this.y/norm,this.z/norm);
	
}

BOIDS.Vec3.prototype.dot = function(vec){
	return (this.x*vec.x)+(this.y*vec.y)+(this.z*vec.z);
}

BOIDS.Vec3.prototype.cross = function(vec){
	return new BOIDS.Vec3(
			(this.y*vec.z)-(this.z*vec.y),
			(this.z*vec.x)-(this.x*vec.z),
			(this.x*vec.y)-(this.y*vec.x));
}

BOIDS.Vec3.prototype.polar = function(){
	var norm = this.norm();
			
	var phi = this.y!=0 ? (Math.atan(this.x/this.y)) : 0;

	if(this.y < 0){
		phi = Math.PI+phi;
	}
	
	var theta = Math.PI/2-(norm!=0 ? Math.acos(this.z/norm) : Math.PI/2);			
	
	return { phi:phi , theta:theta };
}

BOIDS.Boid = function(
		num,
		position,
		velocity,
		surroundings,
		rules){
	this.position = position;
	this.velocity = velocity;
	this.viewDistance = 100;
	this.num=num;
	this.rules = rules;
	this.surroundings = surroundings;
	this.speedLimit = 1.3;
};

BOIDS.Boid.prototype.update = function(){
	this.position = this.position.add(this.velocity);
};

BOIDS.Boid.prototype.updateVelocity = function(){
	var deltaVelocity = new BOIDS.Vec3(0,0,0);
	for(var w=0; w<this.rules.length ;w++){
		deltaVelocity = deltaVelocity.add(this.rules[w].apply(this));
	}
	this.velocity = this.velocity.add(deltaVelocity);
	
	var speed = this.velocity.norm();
	if (speed > this.speedLimit){
		this.velocity = this.velocity.mult(this.speedLimit/speed);
	}
}

BOIDS.Boid.prototype.canSee = function(boid){
	return (this.position.sub(boid.position).norm()<this.viewDistance);
}

BOIDS.Obstacle = function(position,size,height){
	this.size = size;
	this.height=height;
	this.position = position;
}

BOIDS.Obstacle.prototype.isInside = function(feeler){
	var w = new BOIDS.Vec3(
		feeler.position.x,
		feeler.position.y,
		this.position.z);
		
	return (this.position.sub(w).norm()<(feeler.radius+this.size));
}

BOIDS.Obstacle.prototype.getDeflect = function(feeler){
	var w = new BOIDS.Vec3(
		this.position.x,
		this.position.y,
		feeler.position.z);
	
	return feeler.position.sub(w);
}

BOIDS.BoidsUniverse = function(){
	this.boids = [];
	this.obstacles = [];
	this.width = 1000;
	this.height = 1000;
	this.depth = 1000;
	this.boidCreationCounter=0;	
};
	
BOIDS.BoidsUniverse.prototype.createBoid = function(position,velocity){
	var that = this;
	
	var boid = new BOIDS.Boid(
		this.boidCreationCounter,
		position,
		velocity,
		{
			withObstacles:function(funct){
				that.obstacles.forEach(function(entry){funct(entry)});
			},
			withBoids:function(funct){
				that.boids.forEach(function(entry){
					if(entry!=boid){
						funct(entry);
					}
				});
			}
		}
		,
		[new BOIDS.RuleFlockCenterOfMass(),
		new BOIDS.RuleSeparateFlock(),
		new BOIDS.RuleMatchFlockVelocity(),
		new BOIDS.RuleKeepInBounds(this),
		new BOIDS.RuleFollowPath(),
		new BOIDS.RuleAvoidCollision()]);
		
	this.boidCreationCounter+=1;
	this.boids.push(boid);
	return boid;
};

BOIDS.BoidsUniverse.prototype.createObstacles = function(amount){
	this.obstacles.push(new BOIDS.Obstacle(new BOIDS.Vec3(500,500,0),60,420));
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
	this.boids.forEach(function(boid){boid.update()});
	this.boids.forEach(function(boid){boid.updateVelocity()});
};

BOIDS.BoidsEngine = function(){
	this.universe = new BOIDS.BoidsUniverse();
	this.universe.createBoids(30);
	this.universe.createObstacles(1);
};
		
BOIDS.BoidsEngine.prototype.engineLoop = function(){
	this.universe.update();
};

BOIDS.RuleFlockCenterOfMass = function(){
	this.influence = 0.0008;
};
	
BOIDS.RuleFlockCenterOfMass.prototype.apply = function(boid){
	var c = new BOIDS.Vec3(0,0,0);
	var count = 0;
	boid.surroundings.withBoids(function(otherBoid){
		if (boid.canSee(otherBoid)) {
			c = c.add(otherBoid.position);
			count++;
		}
	});
	if (count!=0){
		c = c.mult(1 / count);
		return (c.sub(boid.position)).mult(this.influence);
	}else{
		return new BOIDS.Vec3(0,0,0);
	}
};

BOIDS.RuleSeparateFlock = function() {
	this.influence = 0.003;
	this.distance = 20.0;
};	
BOIDS.RuleSeparateFlock.prototype.apply = function(boid){
	var that = this;
	var c = new BOIDS.Vec3(0,0,0);
	boid.surroundings.withBoids(function(otherBoid){
		if (boid.position.sub(otherBoid.position).norm() < that.distance){
			c = c.add(boid.position.sub(otherBoid.position));
		}
	});

	return c.mult(this.influence);
};
		
BOIDS.RuleMatchFlockVelocity = function(){
	this.influence = 0.03;
};	

BOIDS.RuleMatchFlockVelocity.prototype.apply = function(boid){
	var c = new BOIDS.Vec3(0,0,0);
	var count = 0;
	boid.surroundings.withBoids(function(otherBoid){
		if (boid.canSee(otherBoid)) {
			c = c.add(otherBoid.velocity);
			count++;
		}
	});
	
	if (count!=0){
		c = c.mult( 1 / count);	
		return (c.sub(boid.velocity)).mult(this.influence);
	}else{
		return new BOIDS.Vec3(0,0,0);
	}
};

BOIDS.RuleKeepInBounds = function(bounds){
	this.attraction=0.1;
	this.bounds = bounds;
};

BOIDS.RuleKeepInBounds.prototype.apply = function(boid) {
	var c = [0,0,0];
	var ref = [
		this.bounds.width,
		this.bounds.height,
		this.bounds.depth];
		
	for (var i=0 ; i<3 ; i++){
		if(boid.position.getIdx(i)>ref[i]){
			c[i] -= this.attraction;
		}else if(boid.position.getIdx(i)<0){
			c[i] = this.attraction;
		}
	}
	return new BOIDS.Vec3(c[0],c[1],c[2]);
};


BOIDS.RuleFollowPath = function(){
	this.influence = 0.08;
	this.pathIndex=0;
	this.path = [
		new BOIDS.Vec3(900,900,100),
		new BOIDS.Vec3(0,900,200),
		new BOIDS.Vec3(9000,0,300),
		new BOIDS.Vec3(0,0,100)];
} 

BOIDS.RuleFollowPath.prototype.apply = function(boid){
	var objective = this.path[this.pathIndex];
	if(boid.position.sub(objective).norm()<10){
		this.pathIndex = this.pathIndex<this.path.length-1?this.pathIndex+1:0;	
	}
	
	var c = objective.sub(boid.position);
	c = c.normalize().mult(this.influence);
	return c;	
};

BOIDS.RuleAvoidCollision = function() {
	this.feelerPrediction = 55;
	this.feelerRadius = 30;
	this.influence = 0.003;
};
	
BOIDS.RuleAvoidCollision.prototype.apply = function(boid){
	var c = new BOIDS.Vec3(0,0,0);
	var that = this;
	boid.surroundings.withObstacles(function(obstacle){
		var feeler = {
			position:boid.position.add(boid.velocity.mult(that.feelerPrediction)),
			radius:that.feelerRadius
		}
		if (obstacle.isInside(feeler)){
			var w = obstacle.getDeflect(feeler);
			c = c.add(w.mult(that.influence));
		}
	});	

	return c;
};
