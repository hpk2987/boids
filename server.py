from boid import *
from os import curdir,sep
from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCServer,SimpleJSONRPCRequestHandler
	
class StoppableJSONRPCServer (SimpleJSONRPCServer):
	"""http server that reacts to self.stop flag"""

	def serve_forever (self):
		"""Handle one request at a time until stopped."""
		self.stop = False
		while not self.stop:
			self.handle_request()

server = StoppableJSONRPCServer(('localhost', 8080))
engine = BoidsEngine(1/10,BoidsUniverse(20))

def stop_server ():
	engine.stop()
	server.stop = True

def start_boids():
	engine.start()
	
def stop_boids():
	engine.stop()

def boids():
	return engine.universe.boids
		
def start_serving():		
	server.register_function(stop_server)
	server.register_function(start_boids)
	server.register_function(stop_boids)
	server.register_function(boids)
	server.serve_forever()

if __name__ == '__main__':
	logging.basicConfig(
		format='%(asctime)-15s %(message)s',
		datefmt='%H:%M:%S',
		level='INFO')

	start_serving()
