import unittest
from boid import *

boidUni = BoidsUniverse()

@boidUni.isRule
def ruleN1(boid):
	print("rule1");
	
@boidUni.isRule
def ruleN2(boid):
	print("rule1");

class DecoTests(unittest.TestCase):		
	def testBoidsUniverse(self):
		self.assertEqual(2,len(boidUni.rules))
		
		
if __name__ == '__main__':
    unittest.main()
