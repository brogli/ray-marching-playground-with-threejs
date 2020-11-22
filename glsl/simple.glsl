uniform vec2 resolution;
uniform float fov;
uniform vec3 camera;
uniform vec3 target; 

//the signed distance field function
//used in the ray march loop
float sdf_sphere(vec3 point_on_ray) {
 
    //a sphere of radius 1.
    return length(point_on_ray) - 1.;
}

float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}

// helpers START

// https://github.com/hughsk/glsl-square-frame/blob/master/index.glsl (MIT 22.11.2020)
vec2 squareFrame(vec2 screenSize) {
  vec2 position = 2.0 * (gl_FragCoord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}
vec2 squareFrame(vec2 screenSize, vec2 coord) {
  vec2 position = 2.0 * (coord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}

// https://github.com/stackgl/glsl-look-at/blob/gh-pages/index.glsl (MIT 22.11.2020)
mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));
  return mat3(uu, vv, ww);
}

// https://github.com/glslify/glsl-camera-ray/blob/gh-pages/index.glsl (MIT 22.11.2020)
vec3 getRay(mat3 camMat, vec2 screenPos, float lensLength) {
  return normalize(camMat * vec3(screenPos, lensLength));
}
vec3 getRay(vec3 origin, vec3 target, vec2 screenPos, float lensLength) {
  mat3 camMat = calcLookAtMatrix(origin, target, 0.0);
  return getRay(camMat, screenPos, lensLength);
}
// helpers END


// the following is hacked toghether from snippets provided by Nicolas Barradeau (https://barradeau.com)
// in his tutorial on ray marching with threejs: http://barradeau.com/blog/?p=575. 
void main( void ) {
vec2  screenPos = squareFrame(resolution);
vec3  rayDirection = getRay(camera, target, screenPos, fov);
 
//1 : retrieve the fragment's coordinates
	vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
	//preserve aspect ratio
	uv.x *= resolution.x / resolution.y;
 
//2 : camera position and ray direction
	vec3 pos = camera;
	vec3 dir = rayDirection;
 
//3 : ray march loop
    //ip will store where the ray hits the surface
	vec3 intersection_point;
 
	//variable step size
	float t = 0.0;
	for(int i = 0; i < 32; i++) {
        //update position along path
        intersection_point = pos + dir * t;
 
        //gets the shortest distance to the scene
		float current_distance = sdOctahedron(intersection_point, 1.);
 
        //break the loop if the distance was too small
        //this means that we are close enough to the surface
		if(current_distance < 0.01) {
			break;
		}
		//increment the step along the ray path
		t += current_distance;
	}
 
//4 : apply color to this fragment
    //we use the result position as the color
	gl_FragColor = vec4( intersection_point, 1.0);
}