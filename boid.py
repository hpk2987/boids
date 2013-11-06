from numpy import *
import time
import threading
import random

def neighbouringCenterOfMass(boid,universe):
	c = array([0,0,0])
	for otherBoid in universe.boids:
		if otherBoid!=boid:
			c += otherBoid.position	
	c = c / len(universe.boids)
	return (c - boid.position)/100 # 1% (factor de influencia)

def avoidCollisions(boid,universe):
	c = array([0,0,0])
	for otherBoid in universe.boids:
		if otherBoid!=boid:
			if linalg.norm(boid.position - otherBoid.position) < 100: # 100 Factor de distancia minima
				c = otherBoid.position	
	

class BoidsUniverse:
	def __init__(self,width=1000,height=1000,depth=1000):
		self.rules = []
		self.boids = []
		self.width = width
		self.height = height
		self.depth = depth
	
	def isRule(self,rule):
		self.addRule(rule)
		
	def addRule(self,rule):
		self.rules.append(rule)

	def destroyBoid(self,boid):
		self.boids.remove(boid)

	def createBoid(self,position):
		boid = Boid(self.rules,position)
		self.boids.append(boid)
		return boid

	def createBoids(self, amount=20):
		for i in range(amount):			
			randomPosition = array(
				[random.randint(0,self.width),
				random.randint(0,self.height),
				random.randint(0,self.depth)])
				
			self.createBoid(randomPosition)
			
	def update(self):		
		for boid in self.boids:
			deltaVelocity = array([0,0,0])
			for rule in self.rules:
				deltaVelocity += boid.rule(self)
			
			boid.velocity += deltaVelocity
			boid.update()
		

class Boid:
	def __init__(self,rules,position,velocity = array([0,0,0])):
		self.position = position;
		self.rules = rules
		self.velocity = velocity

	def update(self):
		self.position += self.velocity 

class BoidsEngine:
	def __init__(self,refreshPeriod=1,universe=BoidsUniverse()):
		self.refreshPeriod = refreshPeriod
		self.running = False
		self.universe = universe
		if len(universe.boids)==0:
			universe.createBoids()
		
	def start(self):
		if not self.running:
			self.engineThread = threading.Thread(target=self.engineLoop)
			self.running=True
			self.engineThread.start()
	
	def stop(self):
		if self.running:			
			self.running=False
			while self.engineThread.isAlive():
				None
		
	def engineLoop(self):
		while self.running:
			time.sleep(self.refreshPeriod)
