

// predefines
var initialModelPath = 'teeth.json';
var ready = false;
var $container, $idleBrush, $centerwarning, $leapcolorpicker, $leapdiameterpicker, $tutorial;
var menu;
var camera, scene, renderer, projector, rayCaster;
var paintMaterial, pickMaterial, pickGeometry, pickScene;
var pickRenderScene, pickRenderTarget, pickableMesh;
var ctx;
var paintableMesh, brush;
var paintableMeshScale = 1;
var currentPickColor;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;
var domAnimSpeed = 1500;
var faceIndices = [ 'a', 'b', 'c', 'd' ];
var brushRequested = false;
var painting = false;
var leapController;
var leapNotFoundMessage = "Leap device not found. Please connect a Leap or select 'useMouseControls' from the menu on the right.";
var leapConnected = false;
var initialMeshColor = 0xffffff;
var stats;
var showStats = false;
var leapColorpicker;


/* for color selection */
var xRange = [-80, 80];
var yRange = [ 150, 300];
var zRange = [   20, 150];
var hRange = [0, 360];
var sRange = [0, 100];
var lRange = [0, 100];

$container = $('#container');

// settings used in menu
var settings = {
	showInfo: true,
	leftHandedMode: false,
	useMouseControls: false, // to test without a leap connected
	paintableMesh: {
		wireframe: false
	},
	brush: {
		stabilize: false,
		diameter: 12,
		diameterTolorance: 0.1,
		color: '#009dde',
		idleColor: '#cccccc',
		position: {
			screen: new THREE.Vector2(),
			scene: new THREE.Vector2(),
			screen1: new THREE.Vector2()
		}
	}
};


//Pseudo Hologram parameter
	var windowWidth  = window.innerWidth * window.devicePixelRatio;
	var windowHeight  = window.innerHeight * window.devicePixelRatio;
//create views
	var views = [
			{ 
				left: 0,
				bottom: 1/3,
				width: 1/3,
				height: 1/3,
				background: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
				eye: [ 0, 300, 1800 ],
				up: [ 0, 1, 0 ],
				fov: 30,
				angle : 0,
				rotation: 33.75,
				anglepicker: 90
			},
			{ 
				left: 1/3,
				bottom: 0,	
				width: 1/3,
				height: 1/3,
				background: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
				eye: [ 0, 300, 1800 ],
				up: [ 0, 1, 0 ],
				fov: 30,
				angle: 90,
				rotation: 101.25,
				anglepicker: 0
			},
			{ 
				left: 2/3,
				bottom: 1/3,
				width: 1/3,
				height: 1/3,
				background: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
				eye: [ 0, 300, 1800 ],
				up: [ 0, 1, 0 ],
				fov: 30,
				angle: 180,
				rotation: -101.25,
				anglepicker: 270
			},
			{ 
				left: 1/3,
				bottom: 2/3,			
				width: 1/3,
				height: 1/3,
				background: { r: 0.0, g: 0.0, b: 0.0, a: 1 },
				eye: [ 0, 300, 1800 ],
				up: [ 0, 1, 0 ],
				fov: 30,
				angle: 270,
				rotation: -33.75,
				anglepicker: 180
			}
		];

	//add cameras
	for (var i =  0; i < views.length; i++ ) {
			var view = views[i];
			var camera = new THREE.PerspectiveCamera( view.fov, windowWidth / windowHeight, 50, 10000 );
			camera.position.x = view.eye[ 0 ];
			camera.position.y = view.eye[ 1 ];
			camera.position.z = view.eye[ 2 ];
			camera.up.x = view.up[ 0 ];
			camera.up.y = view.up[ 1 ];
			camera.up.z = view.up[ 2 ];
			view.camera = camera;
			view.mouseControls= new THREE.TrackballControls(camera, $container.get(0));

			view.leapControls  = new THREE.LeapCameraControls( camera );
			view.leapControls.panEnabled 		= false;
			view.leapControls.panFingers		= [8, 12];
			view.leapControls.zoomFingers		= [4, 5];
			view.leapControls.rotateSpeed		= 2;
			view.leapControls.rotateRightHanded	= settings.leftHandedMode;
			view.leapControls.zoomRightHanded	= !settings.leftHandedMode;
			view.leapControls.panRightHanded	= !settings.leftHandedMode;
			view.leapControls.panStabilized     = true;
			view.leapControls.rotateStabilized  = true;
			view.leapControls.zoomStabilized    = false;	

			view.leapcolorpicker1 ='<div class="leapcolorpicker" style="bottom: '+ windowHeight * view.bottom +'px; left:'+ windowWidth  * view.left+'px; margin: 0 auto; width: '+ windowWidth  * view.width +'px; height: '+ windowHeight*view.height +'px; transform: rotate('+view.anglepicker+'deg) scaleX(-1);">'+
									'<div class="pickcontainer">'+
										'<div class="leapcolorpicker-wheel'+i+'"></div>'+
									'</div>'+
									'<form>'+
											'<input type="text" class="leapcolorpicker-bar" name="color" value="#0099de" />'+
									'</form>'+
								'</div>';
			view.leapdiameterpicker1 = '<div class="leapdiameterpicker" style="bottom: '+ windowHeight * view.bottom +'px; left:'+ windowWidth  * view.left+'px; margin: 0 auto; width: '+ windowWidth  * view.width +'px; height: '+ windowHeight*view.height +'px; transform: rotate('+view.anglepicker+'deg) scaleX(-1);">'+
										'<div class="pickcontainer">'+
											'<div class="leapdiameterpicker-circlecontainer">'+
												'<div class="leapdiameterpicker-circle"></div>'+
												'<div class="leapdiameterpicker-size">12</div>'+
											'</div>'+
										'</div>'+		
									'</div>';
			view.overlay = '<div class="overlay" style="bottom: '+ windowHeight * view.bottom +'px; left:'+ windowWidth  * view.left+'px; margin: 0 auto; width: '+ windowWidth  * view.width +'px; height: '+ windowHeight*view.height +'px; transform: rotate('+view.anglepicker+'deg) scaleX(-1);">'+
								'<div class="loadingmsg">'+
									'Loading'+
								'</div>'+
							'</div>';
			view.tutorial = '<div class="tutorial" style="padding-left: 100px; bottom: '+ windowHeight * view.bottom +'px; left:'+ windowWidth  * view.left+'px; margin: 0 auto; width: '+ windowWidth  * view.width +'px; height: '+ windowHeight*view.height +'px; transform: rotate('+view.anglepicker+'deg) scaleX(-1);">'+
								'<h2>Guideline</h2>'+
								'<p>2 fingers (one hand): rotate</p>'+
								'<p>4 fingers (one hand): zoom</p>'+
								'<p>hand + 1 finger + swipe up: tutorial</p>'+								
								'<p>hand + 1 finger: point</p>'+
								'<p>fist + 1 finger: paint</p>'+
								'<p>gesture circle cw: change color</p>'+
								'<p>gesture circle ccw: change diameter</p>'+
						'</div>';

			view.idleBrush= $('<div style="position: absolute;"><div class="brush-idle"></div></div>').appendTo('body');								
			$('body').append(view.leapcolorpicker1)
					 .append(view.leapdiameterpicker1)
					 .append(view.overlay)
					 .append(view.tutorial);
								
			view.vleapColorpicker = $.farbtastic('.leapcolorpicker-wheel'+i+'', '.leapcolorpicker-bar');
	
	}
			

// Everything ready to go
$(function() {
	if(Detector.webgl) {
		// Bam, WebGL is a go
		init();
		animate();
	}
	else {
		// well, that's a shame 
		var message = window.WebGLRenderingContext ? 'oldie_gpu.html' : 'oldie_browser.html';					
		$('.loadingmsg').fadeOut(800, function() {
			$('.overlay').load('./' + message, function() {
				$('#oldie').fadeIn(domAnimSpeed);
			})
		});
	}
});

function init() {
	
	updateDimensions();

	// Idle-brush
	$idleBrush = $('.brush-idle');

	//Tutorial
	$tutorial = $('.tutorial');

	// Center warning
	$centerwarning = $('<div id="center-warning" />').appendTo('body');


	$leapcolorpicker = $('.leapcolorpicker');


	$leapdiameterpicker = $('.leapdiameterpicker');
	
	// Scene
	scene = new THREE.Scene();
	pickScene = new THREE.Scene();

	// Lights
	var ambient = new THREE.AmbientLight( 0x101010 );
	scene.add( ambient );

	directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 0, -70, 100 ).normalize();
	scene.add( directionalLight );

	directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 0, -70, -100 ).normalize();
	scene.add( directionalLight );

	directionalLight = new THREE.DirectionalLight( 0xcccccc );
	directionalLight.position.set( 0, 200, 0 ).normalize();
	scene.add( directionalLight );

	// Renderer
	renderer = new THREE.WebGLRenderer({
		alpha: false
	});
	//renderer.autoClear = false;
	renderer.setSize( window.innerWidth, window.innerHeight );
	$container.append( renderer.domElement );
	ctx = renderer.getContext("experimental-webgl", { preserveDrawingBuffer: true });

	// Raycaster
	projector = new THREE.Projector();
	rayCaster = new THREE.Raycaster();

	pickRenderTarget = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, { 
		minFilter: THREE.LinearFilter, 
		magFilter: THREE.NearestFilter, 
		format: THREE.RGBFormat 
	});

	if(showStats) {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		$container.append(stats.domElement);
	}

	loader = new THREE.JSONLoader();

	// currentPickColor x=Red, y=Green, z=Blue, w=Alpha
	currentPickColor = new THREE.Vector4();

	initPaintableMesh();
	initBrush();
	initDomEvents();
	//initMenu();
	initLeapController();
}

function initPaintableMesh() {
	loader.load( initialModelPath, function (geometry) {
		//console.log('done loading');
		setPaintableMesh(geometry);
	});

}

function setPaintableMesh(geometry) {
	if(typeof paintableMesh != 'undefined') {		
		scene.remove(paintableMesh);
		paintableMesh = null;
	}

	// make sure the geometry is set up all nice
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.mergeVertices(); 
	//geometry.computeCentroids();
	THREE.GeometryUtils.center(geometry);

	geometry.vertexFaces = [];
	var maxFacesPerVertex = 0;
	var vertexColor = new THREE.Color( initialMeshColor);

	// pickGeometry = new THREE.SphereGeometry(200, 400, 400);
	pickGeometry = geometry.clone();

	for ( var i = 0, l = geometry.faces.length; i<l; i++ )
	{
		face = geometry.faces[ i ];
		pickGeometry.faces[i].color.setHex(i);

		var numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ ) 
		{
			vertexIndex = face[faceIndices[j]];
			
			face.vertexColors[j] = vertexColor;

			if(!(vertexIndex in geometry.vertexFaces))
				geometry.vertexFaces[vertexIndex] = [];

			geometry.vertexFaces[vertexIndex].push(i);
			if(geometry.vertexFaces[vertexIndex].length > maxFacesPerVertex)
				maxFacesPerVertex = geometry.vertexFaces[vertexIndex].length;
		}
	}
//	console.log(maxFacesPerVertex, 'maxFacesPerVertex');

//	console.log(pickGeometry, 'pickGeometry');

	paintMaterial = new THREE.MeshLambertMaterial({ 
		shading: THREE.SmoothShading, 
		vertexColors: THREE.VertexColors,
		side: THREE.DoubleSide,	
		wireframe: settings.paintableMesh.wireframe,
	});

	pickMaterial = new THREE.MeshBasicMaterial({ 
		vertexColors: THREE.FaceColors,
		side: THREE.DoubleSide
	})

	paintableMesh = new THREE.Mesh(
		geometry, 
		paintMaterial
	);

	pickableMesh = new THREE.Mesh(
		pickGeometry, 
		pickMaterial
	);

	geometry.computeBoundingBox();
	var mW = geometry.boundingBox.max.x - geometry.boundingBox.min.x
	var mH = geometry.boundingBox.max.y - geometry.boundingBox.min.y
	var mD = geometry.boundingBox.max.z - geometry.boundingBox.min.z

	//var scalingFactor =  Math.max(mW, mH, mD);
	var preferredHeight = 200;
	// paintableMeshScale = mH>mW ? HALFHEIGHT*0.6 / mH : HALFWIDTH*0.6 / mW;
	paintableMeshScale = preferredHeight / mH;
//	console.log(paintableMeshScale, 'paintableMeshScale');
	
	paintableMesh.scale.multiplyScalar(paintableMeshScale);
	paintableMesh.updateMatrix();
	paintableMesh.updateMatrixWorld();
	scene.add(paintableMesh);

	pickableMesh.scale.multiplyScalar(paintableMeshScale);
	pickableMesh.updateMatrix();
	pickableMesh.updateMatrixWorld();
	pickScene.add(pickableMesh);

//	console.log(paintableMesh, 'paintableMesh');

//	console.log(pickRenderTarget, 'pickRenderTarget');

	finishedLoading();
}

function initBrush() {
	var brushGeometry = new THREE.TorusGeometry(1, 0.05, 2, 24);
	THREE.GeometryUtils.merge(brushGeometry, new THREE.SphereGeometry(0.05, 4, 4));

	brush = new THREE.Mesh(brushGeometry,  new THREE.MeshBasicMaterial({
		color: (new THREE.Color()).setStyle(settings.brush.color), 
		opacity: 0.8, 
		transparent: true,
		matrixAutoUpdate: true,
		depthTest: false
	}));
	brush.scale.set(settings.brush.diameter, settings.brush.diameter, settings.brush.diameter);
	brush.visible = false;
	scene.add(brush); 
}

var leapFrameCount = 0;
var leapColorUpdate = false;
var leapDiameterUpdate = false;
var leapToPaintFrame = 0;
var leapControlUpdate = false;
function initLeapController() {

	leapController = new Leap.Controller({
		enableGestures: true
	});

	leapController.on('connect', function() {
	  console.log("Connected to Leap server, checking for device.");
	});

	leapController.on('ready', function() {
		console.log('Leap device is connected');
		leapConnected = true;
	});

	leapController.on('deviceConnected', function() {
		console.log("Leap device has been connected.");
		leapConnected = true;
		if(!settings.useMouseControls)
		    hideCenterWarning();
	});

	leapController.on( 'deviceDisconnected' , function() {
	    console.log( 'A Leap device has been disconnected.' );
	    leapConnected = false;
	    if(!settings.useMouseControls)
		    showCenterWarning(leapNotFoundMessage);
	});
	
	leapController.connect();
}

function updateFinger(frame, view){

		if(!ready || !view.leapControls ||settings.useMouseControls)
			return;
		// if(leapFrameCount % 100 == 0)
		// {
		// 	console.log(frame);
		// }	
		leapFrameCount++;

		var hl = frame.hands.length;
		var fl = frame.pointables.length;

		if(hl == 1 && fl == 1) {
			for(var i=0, l=frame.gestures.length; i<l; i++) {
				var gesture  = frame.gestures[i];
			    if(gesture.type == 'circle' && gesture.state == 'stop' && gesture.progress > 0.8) {
			    	// color update mode
			    	if( gesture.normal[2] <= 0 ) {
			    		// clockwise movement
			    		leapColorUpdate = true;
			    		$tutorial.fadeOut(domAnimSpeed);
			    		$leapcolorpicker.fadeIn(domAnimSpeed);
			    	}
			    	else {
			    		// counter clockwise
			    		leapDiameterUpdate = true;
			    		$tutorial.fadeOut(domAnimSpeed);
			    		$leapdiameterpicker.fadeIn(domAnimSpeed);
			    	}
			    }else if(gesture.type == 'swipe'){
			    	//Classify swipe as either horizontal or vertical
			          //var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
			          //Classify as right-left or up-down
			          /*if(isHorizontal){
			              if(gesture.direction[0] > 0){
			                  //swipeDirection = "right";
			              } else {
			                 // swipeDirection = "left";
			              }
			          } else { //vertical
			              if(gesture.direction[1] > 0){
			              	$tutorial.fadeIn(domAnimSpeed);
			                 // swipeDirection = "up";
			              } else {
			                 // swipeDirection = "down";
			              }                  
			          }*/

			          if(gesture.direction[1] > 0){
			              	$tutorial.fadeIn(domAnimSpeed);
			                 // swipeDirection = "up";
			            }
			    }
			}
		}

		if(leapColorUpdate) {
			if(fl < 1) {
				leapColorUpdate = false;
				$leapcolorpicker.fadeOut(domAnimSpeed);				
				return;
			}

			if(fl > 3)
			{
				var hand = frame.hands[0];
				settings.brush.color = getHexFromPosition(hand.palmPosition);
				view.vleapColorpicker.setColor(settings.brush.color);
				brush.material.color.setStyle(settings.brush.color); 
			}
		}
		else if(leapDiameterUpdate) {
			if(fl < 1) {
				leapDiameterUpdate = false;
				$leapdiameterpicker.fadeOut(domAnimSpeed);
				return;
			}

			if(fl > 3)
			{
				var hand = frame.hands[0];
				settings.brush.diameter = mapConstrainRange(hand.palmPosition[2], zRange, [2, 40]);
				brush.scale.set(settings.brush.diameter, settings.brush.diameter, settings.brush.diameter);
				var circleSize = settings.brush.diameter*3 +10;
				var circleMargin = circleSize/2 + 2;
				$('.leapdiameterpicker-circle').css({
					width: circleSize,
					height: circleSize,
					margin: '-'+circleMargin+'px 0 0 -'+circleMargin+'px'
				});
				$('.leapdiameterpicker-size').text(settings.brush.diameter);
			}
		}
		else {
			if(hl == 2) {
				var f;
				$tutorial.fadeOut(domAnimSpeed);
				if(fl > 5 && fl < 8) {
					// pointer mode
					for(var q=0; q<fl; q++) {
						if(frame.pointables[q].handId == -1)
							continue;
						var hand = frame.handsMap[frame.pointables[q].handId];

						if((typeof hand != 'undefined') && hand.fingers.length <= 2) {
							var f = frame.pointables[q];
							var fp = settings.brush.stabilize ? f.stabilizedTipPosition : f.tipPosition;
							updateBrushPosition(fp, view);
							brushRequested = true;
							break;
						}
					}
					leapToPaintFrame = leapFrameCount;
				}
				else if(fl > 0 && fl < 3 && (leapFrameCount - leapToPaintFrame > 10)) { // after 10 frames to avoid false positives
					//painting mode
					var f = frame.pointables[0];
					painting = true;
					var fp = settings.brush.stabilize ? f.stabilizedTipPosition : f.tipPosition;

					updateBrushPosition(fp, view);
					brushRequested = true;
				}
				else if(fl > 5) {
					leapControlUpdate = true;
				}
			}
			else {
				
				$idleBrush.hide();		
			 	brush.visible = false;
			 	leapControlUpdate = true;
			}
			if(leapControlUpdate){
				view.leapControls.update(frame);
				
			}
		}
		leapControlUpdate = false;
}

function initDomEvents() {
	$(window).resize(function() {
		updateDimensions();

	windowWidth  = window.innerWidth * window.devicePixelRatio;
	windowHeight  = window.innerHeight * window.devicePixelRatio;
	
	for (var i =  0; i < views.length; i++ ) {
				var view = views[i]
				var camera = view.camera;
				camera.aspect = windowWidth / windowHeight;
				camera.updateProjectionMatrix();
			}
			
	renderer.setSize(window.innerWidth, window.innerHeight);

	});

	$container.mousemove(function(event) {
		if(settings.useMouseControls) {
			settings.brush.position.screen.x = event.pageX;
			settings.brush.position.screen.y = event.pageY;
			//settings.brush.position.scene.x =   ( (event.clientX - $container.offset().left) / WIDTH ) * 2 - 1;
			//settings.brush.position.scene.y = - ( (event.clientY - $container.offset().top) / HEIGHT ) * 2 + 1;	
		}
	});

	$(window).keydown(function(event) {
		if(settings.useMouseControls) {
			if(event.which == 67) {  //  'c's
				painting = true;
				brush.visible = true;
				brushRequested = true;
			}
		}
	});

	$(window).keyup(function() {
		if(settings.useMouseControls) {
			brush.visible = false;
			painting = true;
			$idleBrush.hide();
			brush.visible = false;
		}
	});

	
}

function initMenu() {
	menu = new dat.GUI();
	var genMenu = menu.addFolder('General');
		genMenu.open();
	genMenu.add(settings, 'showInfo').onChange(function(newValue) {
		if(newValue)
			$('#info').fadeIn(domAnimSpeed);
		else
			$('#info').fadeOut(domAnimSpeed)
	});

	genMenu.add(settings, 'leftHandedMode');

	genMenu.add(settings, 'useMouseControls').onChange(function(newValue) {


		if(!leapConnected && !newValue) {
			showCenterWarning(leapNotFoundMessage);
		}
		else {
			hideCenterWarning();
		}

		if(newValue) { 
			$('#usage-leap').stop().fadeOut(domAnimSpeed/2, function() {
				$('#usage-mouse').stop().fadeIn(domAnimSpeed/2);
			});
		} else {
			$('#usage-mouse').stop().fadeOut(domAnimSpeed/2, function() {
				$('#usage-leap').stop().fadeIn(domAnimSpeed/2);
			});
		}
	});

	
	var meshMenu = menu.addFolder('mesh');				
		meshMenu.open();
		meshMenu.add(settings.paintableMesh, 'wireframe').onChange(function() {
			paintableMesh.material.wireframe = settings.paintableMesh.wireframe;
		});
		

	var brushMenu = menu.addFolder('brush');
		brushMenu.open();

		brushMenu.add(settings.brush, 'stabilize');

		brushMenu.add(settings.brush, 'diameter', 2, 40).listen().onChange( function() {
			brush.scale.set(settings.brush.diameter, settings.brush.diameter, settings.brush.diameter);
			var circleSize = settings.brush.diameter*3 +10;
			var circleMargin = circleSize/2 + 2;
			$('.leapdiameterpicker-circle').css({
				width: circleSize,
				height: circleSize,
				margin: '-'+circleMargin+'px 0 0 -'+circleMargin+'px'
			});
			$('.leapdiameterpicker-size').text(Math.round(settings.brush.diameter)); 
		});
	
		brushMenu.addColor(settings.brush, 'color').listen().onChange( function() {
	  		brush.material.color.setStyle(settings.brush.color);
			view.vleapColorpicker.setColor(settings.brush.color);
		}); 
}


function finishedLoading() {
	$('.overlay').stop().fadeOut(domAnimSpeed);

	$('.dg.ac').fadeIn(domAnimSpeed);

	// Horrific solution, I know.
	// If you found this little gem and you can improve this (by at least eleven),
	// I'll get you a cookie!
	setTimeout(function() {
		if(!leapConnected && !settings.useMouseControls) {
			showCenterWarning(leapNotFoundMessage);
		}
	}, 4000);

	ready = true;
}

var handleJSON = function ( data, file, filename ) {
	if ( data.metadata === undefined ) { // 2.0
		data.metadata = { type: 'Geometry' };
	}

	if ( data.metadata.type === undefined ) { // 3.0
		data.metadata.type = 'Geometry';
	}

	if ( data.metadata.version === undefined ) {
		data.metadata.version = data.metadata.formatVersion;
	}

	if ( data.metadata.type.toLowerCase() === 'geometry' ) {
		var result = loader.parse( data );
		var geometry = result.geometry;

		geometry.sourceType = "ascii";
		geometry.sourceFile = file.name;
		setPaintableMesh(geometry);
	} 
};

function updateDimensions() {
	//WIDTH  = $container.width(),
	//HEIGHT = $container.height();
	WIDTH = window.innerWidth * window.devicePixelRatio;
	HEIGHT = window.innerHeight * window.devicePixelRatio;
	HALFWIDTH = WIDTH/2;
	HALFHEIGHT = HEIGHT/2;
}

function animate() {

	render();

	if(brushRequested)
		doBrush();

	brushRequested = false;
	painting = false;

	requestAnimationFrame(animate);
}

var pickPixelArray = new Uint8Array(4);
var lrt = 0;
var cameraRadius = 600;
var rotateY = 90, rotateX = 0, curY = 0;

function render() {
	renderer.clear();


//for each view
	for (var i =  0; i < views.length; i++ ) {

				//grab each view
				var view = views[i]
		
				//grab each camera
				var camera = view.camera;

				//Grab view ports
				var left   = Math.floor( windowWidth  * view.left );							
				var bottom = Math.floor( windowHeight * view.bottom );
				var width  = Math.floor( windowWidth  * view.width );
				var height = Math.floor( windowHeight * view.height );

				if(settings.useMouseControls){					
					view.mouseControls.update();
				}

				updateFinger(leapController.frame(), view);
				
				/*if(leapControlUpdate==false){
					if(paintableMesh!= null){
						paintableMesh.rotation.z+=.006;
					

					//Adjust camera within 3D spherical coordinates 
					camera.position.x = paintableMesh.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(view.angle * Math.PI/180)
					camera.position.z = paintableMesh.position.z + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(view.angle * Math.PI/180)
					camera.position.y = paintableMesh.position.y + cameraRadius * Math.cos(rotateY * Math.PI/180)
					camera.rotation.z= view.rotation - Math.PI;
					camera.lookAt(scene.position)
					}
				}*/

				
				
				camera.lookAt(scene.position)
				//Set rotation of camera on Z-Axis
				camera.rotation.z= view.rotation - Math.PI;

				if(painting==false){

					if(i==0) {
							view.idleBrush.css({
								top: bottom + (height - settings.brush.position.screen1.x),
								left: left + (height - settings.brush.position.screen1.y)
							});
					}else if(i==1){
							view.idleBrush.css({
								top: bottom + (height -settings.brush.position.screen1.y),
								left: left + settings.brush.position.screen1.x
							});
					}else if(i==2){
							view.idleBrush.css({
								top: bottom +  settings.brush.position.screen1.x,
								left: left +  settings.brush.position.screen1.y
							});
					}else if(i==3){
							view.idleBrush.css({
								top: bottom + settings.brush.position.screen1.y,
								left: left +  (height - settings.brush.position.screen1.x)
							});
					
					}
				}


				
				if(brushRequested) {
						// render to renderTarget
						renderer.setScissor(
							settings.brush.position.screen.x,
							settings.brush.position.screen.y,
							1,
							1
						);
						renderer.enableScissorTest(true);
						renderer.render(pickScene, camera, pickRenderTarget);
						renderer.enableScissorTest(false);

						ctx.readPixels(settings.brush.position.screen.x, settings.brush.position.screen.y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pickPixelArray);

						currentPickColor.set(pickPixelArray[0], pickPixelArray[1], pickPixelArray[2], pickPixelArray[3]);
				}


				//Render
				renderer.setViewport( left, bottom, width, height );
				renderer.setScissor( left, bottom, width, height );
				renderer.enableScissorTest ( true );
				renderer.setClearColor( view.background, view.background.a );
				
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.render(scene, camera)


				
	}

	if(showStats)
		stats.update();

}

function rgb2int(red, green, blue) {
	var rgb = blue | (green << 8) | (red << 16);
	var index = parseInt((0x1000000 + rgb).toString(16).slice(1), 16);
	//console.log(index);
	return index;
}

function doBrush() {	
	//if(currentPickColor.w == 255 && painting) {
	if(painting) {
		if(currentPickColor.x === 0 && currentPickColor.y === 0 && currentPickColor.z === 0)
			return;

		var geometry = paintableMesh.geometry;
		var face = geometry.faces[rgb2int(currentPickColor.x, currentPickColor.y, currentPickColor.z)];
		if(face) { // face sometimes not defined on edge
			var source = face.centroid;
			var sourceWorld = paintableMesh.localToWorld(source.clone());

			brush.visible = true;
			$idleBrush.hide();
			brush.position.set(0,0,0);
			brush.lookAt(face.normal);
			brush.position.copy(sourceWorld);

			if(painting) {

				// update source to local coordinates
				//intersect.object.worldToLocal(source);

				// var intersectFaceIndex = intersect.faceIndex;
				var intersectFaceIndex = geometry.vertexFaces[face.a][0];

				var queue = [];
					queue.push(intersectFaceIndex);
				var visited = [];
					visited[intersectFaceIndex] = true;

				// scale the diameter of the brush as well
				var checkDiameter = Math.pow((settings.brush.diameter + settings.brush.diameterTolorance)/paintableMeshScale,2);

				while(queue.length > 0) {
					var faceIndex = queue.shift()
					face = geometry.faces[faceIndex];
					
					var numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
					for( var k = 0; k < numberOfSides; k++ ) 
					{
						vertexIndex = face[faceIndices[k]];

						var vertexPoint = geometry.vertices[ vertexIndex ];
						var d2 = Math.pow((vertexPoint.x - source.x),2) + Math.pow((vertexPoint.y - source.y),2) + Math.pow((vertexPoint.z - source.z),2)

						if(d2 <= checkDiameter) {
							face.vertexColors[k] = brush.material.color.clone();

							for(var l=0,m=geometry.vertexFaces[vertexIndex].length; l<m; l++) {
								var faceIndex= geometry.vertexFaces[vertexIndex][l];
								if(visited[faceIndex] !== true) {
									queue.push(faceIndex);
									visited[faceIndex] = true;
								}
							}
						}
					}
				}
				geometry.colorsNeedUpdate = true;
			}
		}
	} else {
		brush.visible = false;
		$idleBrush.show();
	}
}

function updateBrushPosition(tipPosition) {


	var width = 150;
	var height = 150;
	var minHeight = 100;
	
	var ftx = tipPosition[0];
	var fty = tipPosition[1];
	
	ftx = (ftx > width ? width - 1 : (ftx < -width ? -width + 1 : ftx));
	fty = (fty > 2*height ? 2*height - 1 : (fty < minHeight ? minHeight + 1 : fty));
	
	settings.brush.position.screen.x = THREE.Math.mapLinear(ftx, -width, width, 0, windowWidth);
	settings.brush.position.screen.y = THREE.Math.mapLinear(fty, 2*height, minHeight, 0, windowHeight);
	//settings.brush.position.scene.x =  (settings.brush.position.screen.x / windowWidth)  *2 - 1;
	//settings.brush.position.scene.y = -(settings.brush.position.screen.y / windowHeight) *2 + 1;

	var vwidth  = Math.floor( windowWidth  * views[1].width );
	var vheight = Math.floor( windowHeight * views[1].height );
	settings.brush.position.screen1.x = THREE.Math.mapLinear(ftx, -width, width, 0, vwidth);
	settings.brush.position.screen1.y = THREE.Math.mapLinear(fty, 2*height, minHeight, 0, vheight);

}


function showCenterWarning(message) {
	$centerwarning.html('<p>'+message+'</p>').fadeIn(domAnimSpeed);
}

function hideCenterWarning(message) {
	$centerwarning.fadeOut(domAnimSpeed);
}

function getHexFromPosition(position) {
	var HSL = getHSLFromPosition(position);
	var RGB = hslToRgb(HSL.h, HSL.s, HSL.l);
	var HEX = rgbToHex(RGB.r, RGB.g, RGB.b);
	return HEX;
}

function getHSLFromPosition(position) {
	var x = position[0];
	var y = position[1];
	var z = position[2];
	
	return {
		h: mapConstrainRange(x, xRange, hRange),
		s: mapConstrainRange(y, yRange, sRange),
		l: mapConstrainRange(z, zRange, lRange)
	}
}

function mapConstrainRange(value, inRange, outRange) {
	return Math.round(
		constrain(
			map(
				value, 
				inRange[0], 
				inRange[1], 
				outRange[0], 
				outRange[1]
			), 
			outRange[0], outRange[1]
		)
	)  
}

function constrain(val, min, max){
	return val < min ? min : (val > max ? max : val);
}

function map(val, min1, max1, min2, max2){
	return lerp( norm(val, min1, max1), min2, max2 );
}

function lerp(ratio, start, end){
	return start + (end - start) * ratio;
}

function norm(val, min, max){
	return (val - min) / (max - min);
}

function hslToHex(h,s,l) {
	rgb = hslToRgb(h,s,l);
	return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function hslToRgb(h, s, l) {
    var r, g, b;

    h = h / 360;
    s = s / 100;
    l = l / 100;

	function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
	}

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
