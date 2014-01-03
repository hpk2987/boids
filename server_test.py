from boid import *

import jsonrpclib
import unittest
import server

from threading import Thread


logging.basicConfig(
	format='%(asctime)-15s %(message)s',
	datefmt='%H:%M:%S',
	level='ERROR')

class BoidTest(unittest.TestCase):
	def test_server(self):
		thread = Thread(target = server.start_serving)
		thread.start()		
		remote = jsonrpclib.Server('http://localhost:8080/')
		remote.stop_server()
		thread.join()
		
	def test_server_boid(self):
		thread = Thread(target = server.start_serving)
		thread.start()		
		remote = jsonrpclib.Server('http://localhost:8080/')
		remote.start_boids()
		remote.stop_server()
		thread.join()
		
	def test_boids(self):
		thread = Thread(target = server.start_serving)
		thread.start()		
		remote = jsonrpclib.Server('http://localhost:8080/')
		remote.start_boids()		
		remote.boids()
		remote.stop_server()
		thread.join()
		
		
if __name__ == '__main__':
    unittest.main()
