from numpy import *
from boid import *
import time
import unittest

class RuleTest:
	def apply(boid):
		return array([0,0,0])

class BoidTest(unittest.TestCase):
	def testNumpy(self):
		a = array( [3,1,2] )
		b = array( [1,1,1] )
		c = a+b
		self.assertEqual(4,c[0])
		self.assertEqual(2,c[1])
		self.assertEqual(3,c[2])		
		
	def testAttrBoid(self):
		position = array([1,2,3])
		boid = Boid(0,[],position)
		self.assertEqual(boid.position[0],position[0])
		self.assertEqual(boid.position[1],position[1])
		self.assertEqual(boid.position[2],position[2])
		self.assertEqual(boid.rules,[])

	def testCreateBoid(self):
		boidUniverse = BoidsUniverse()
		position = array([1,2,3])
		boid = boidUniverse.createBoid(position)
		boidUniverse.addRule(RuleTest())
		self.assertEqual(6,len(boid.rules))
		self.assertEqual(11,len(boidUniverse.boids))
		
	def testCreateBoids(self):
		boidUniverse = BoidsUniverse()
		boid = boidUniverse.createBoids(5)
		self.assertEqual(15,len(boidUniverse.boids))
		
	def testDeleteBoid(self):
		boidUniverse = BoidsUniverse()
		position = array([1,2,3])
		boid = boidUniverse.createBoid(position)
		boidUniverse.destroyBoid(boid)
		self.assertEqual(10,len(boidUniverse.boids))
		
	def testUniverseSize(self):
		boidUniverse = BoidsUniverse(10,100,100,100)
		self.assertEqual(100,boidUniverse.width)
		self.assertEqual(100,boidUniverse.height)
		self.assertEqual(100,boidUniverse.depth)
		
	def testLambda(self):
		f = lambda x,y: x+y
		self.assertEqual(4,f(2,2))
		
	def testEngine(self):
		engine = BoidsEngine()
		engine.start()
		time.sleep(3)
		self.assertTrue(engine.running)
		engine.stop()
		time.sleep(1)
		self.assertFalse(engine.running)
		

if __name__ == '__main__':
    unittest.main()
