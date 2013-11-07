from numpy import *
import time
import threading
import random
import logging

logger = logging.getLogger('boids')

class RuleFlockCenterOfMass:
	def __init__(self,influence=0.01):
		self.influence = influence
	
	def apply(self,boid,universe,acumm):
		c = array([0,0,0])
		for otherBoid in universe.boids:
			if otherBoid!=boid:
				c += otherBoid.position	
		c = c / (len(universe.boids)-1)
		return (c - boid.position)*self.influence

class RuleAvoidCollisions:
	def __init__(self,minDistance=100):
		self.minDistance = minDistance
	
	def apply(self,boid,universe,acumm):
		c = array([0,0,0])
		for otherBoid in universe.boids:
			if otherBoid!=boid:
				if linalg.norm(boid.position - otherBoid.position) < self.minDistance: # 100 Factor de distancia minima
					c += boid.position - otherBoid.position

		return c
		
class RuleMatchFlockVelocity:
	def __init__(self,influence=0.01):
		self.influence = influence
	
	def apply(self,boid,universe,acumm):
		c = array([0,0,0])
		for otherBoid in universe.boids:
			if otherBoid!=boid:
				c += otherBoid.velocity
		c = c / (len(universe.boids)-1)
		
		return (c - boid.velocity)*self.influence

class RuleKeepInBounds:
	def __init__(self,attraction=10):
		self.attraction=attraction
	
	def apply(self,boid,universe,acumm):
		c = array([0,0,0])
		ref = array([universe.width,universe.height,universe.depth])
		for i in range(3):
			if(boid.position[i]>ref[i]):
				c[i] -= self.attraction
			elif (boid.position[i]<0):
				c[i] = self.attraction
		
		return c

class RuleSpeedLimit:
	def __init__(self,limit=10):
		self.limit = limit
	
	def apply(self,boid,universe,acumm):
		c = boid.velocity + acumm
		speed = linalg.norm(c)
		if (speed > self.limit):
			c = (c)*((self.limit/speed)-1)
			
		return c

class BoidsUniverse:
	def __init__(self,startingBoids=10,width=1000,height=1000,depth=1000):
		self.rules = [RuleFlockCenterOfMass(),RuleAvoidCollisions(),RuleMatchFlockVelocity(),RuleKeepInBounds(),RuleSpeedLimit()]
		self.boids = []
		self.width = width
		self.height = height
		self.depth = depth
		self.boidCreationCounter=0
		if startingBoids > 0:
			self.createBoids(startingBoids)
	
	def isRule(self,rule):
		self.addRule(rule)
		
	def addRule(self,rule):
		self.rules.append(rule)

	def destroyBoid(self,boid):
		self.boids.remove(boid)

	def createBoid(self,position):
		boid = Boid(self.boidCreationCounter,self.rules,position)
		self.boidCreationCounter+=1
		self.boids.append(boid)
		return boid

	def createBoids(self, amount=20):
		for i in range(amount):			
			randomPosition = array(
				[random.randint(0,self.width),
				random.randint(0,self.height),
				0])
				#random.randint(0,self.depth)])
				
			self.createBoid(randomPosition)
			
	def update(self):		
		for boid in self.boids:
			deltaVelocity = array([0,0,0])
			for rule in self.rules:
				deltaVelocity += rule.apply(boid,self,deltaVelocity)
			
			boid.velocity += deltaVelocity
			boid.update()
		

class Boid:
	def __init__(self,num,rules,position,velocity = array([0,0,0])):
		self.position = position;
		self.rules = rules
		self.velocity = velocity
		self.num=num

	def update(self):
		self.position += self.velocity 
		logger.info(
			"Boid "	+ str(self.num) +
			" : p= ["+ array_str(self.position) + "]" +
			" v= [" + array_str(self.velocity) + "]")

class BoidsEngine:
	def __init__(self,refreshPeriod=1,universe=BoidsUniverse()):
		self.refreshPeriod = refreshPeriod
		self.running = False
		self.universe = universe
		if len(universe.boids)==0:
			universe.createBoids()
		
	def start(self):
		logger.info('Arrancando Boids...')

		if not self.running:
			self.engineThread = threading.Thread(target=self.engineLoop)
			self.running=True
			self.engineThread.start()
			logger.info('Boids en fucionamiento.')
	
	def stop(self):
		logger.info('Deteniendo Boids...')
		if self.running:
			self.running=False
			while self.engineThread.isAlive():
				None
			logger.info('Boids detenido.')
		
	def engineLoop(self):		
		while self.running:
			logger.info('ENGINE: refrescando.')
			self.universe.update()
			time.sleep(self.refreshPeriod)
