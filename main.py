from numpy import *
from boid import *
from pyglet.gl import *

logging.basicConfig(
	format='%(asctime)-15s %(message)s',
	datefmt='%H:%M:%S',
	level='ERROR')

engine = BoidsEngine(1/10,BoidsUniverse(20))
engine.start()	

# Direct OpenGL commands to this window.
window = pyglet.window.Window(
			width=640,
			height=480,
			caption="Boids")
@window.event
def on_resize(width, height):
    glViewport(0, 0, 1000,1000)
    glMatrixMode(gl.GL_PROJECTION)
    glLoadIdentity()
    glOrtho(0, width, 0, height, -1, 1)
#   gluPerspective(65, width / float(height), .1, 1000)
    glMatrixMode(gl.GL_MODELVIEW)

@window.event
def on_draw():
	glClear(GL_COLOR_BUFFER_BIT)
	glLoadIdentity()	
    
	glPointSize( 3.0 );
	glBegin(GL_POINTS)
	for boid in engine.universe.boids:    
		glVertex2f(
			boid.position[0],
			boid.position[1])
	glEnd()

def update(dt): pass

pyglet.clock.schedule_interval(update, 1/60.0) 

pyglet.app.run()

engine.stop()
