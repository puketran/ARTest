let video = null;
let debugLog = "022";

async function startCamera() {
  try {
    let faceMode = "user"
      video = document.getElementById("video");
      let options = {
        audio: false,
        video: {
            facingMode: faceMode,
            width: {
                ideal: 640,
            },
            height: {
                ideal: 480,
            },
        },
    };
    const stream = await navigator.mediaDevices.getUserMedia(options);
    video.srcObject = stream;
    video.setAttribute('autoplay', true);
    video.setAttribute('loop', true);
    video.setAttribute('preload', true);
    video.setAttribute('muted', 'muted');
    video.setAttribute('playsinline', true); // for IOS
    video.style.display = "none";

    // video.style.width = window.innerWidth + "px";
    // video.style.height = window.innerHeight + "px";
    // video.style.transformStyle = "preserve-3d";
    // let styleStr = ""
  //   if (faceMode == "user") {
  //     video.style.transform = "scale(-1, 1) translateZ(0) translate";
  // } else {
  //     video.style.transform = "scale(1, 1) translateZ(0) ";
  // }
    // document.body.appendChild(video);

    video.play();
    // document.body.prepend(video);

    video.onloadedmetadata = async () => {
        console.log("onloadedmetadata");
    
        // // wait 0.5 sec
        // await new Promise(r => setTimeout(r, 500));
       
        main();
        // resetCanvasTransform();
        showCanvasInfo();

        video.style.display = "block";

        // if (faceMode == "user") {
        //   video.style.transform = "scale(-1, 1) translateZ(-1px)";
        // } else {
        //     video.style.transform = "scale(1, 1) translateZ(-1px)";
        // }
     };
  } catch (err) {
    console.error('Error accessing the camera: ', err);
  }
  return null;
}


function showCanvasInfo(){
  const canvasThree = document.getElementById('threeCanvas');
  let style = window.getComputedStyle(canvasThree);
  console.log('CanvasThree transform:', style.transform);
  console.log('CanvasThree webkit-transform:', style.webkitTransform);
  
  // show style transform of video
  let videoStyle = window.getComputedStyle(video);
  console.log('Video transform:', videoStyle.transform);
  console.log('Video webkit-transform:', videoStyle.webkitTransform);
}

async function main(){
  console.log(debugLog);
  // get the 2 canvas from the DOM:
  const canvasFace = document.getElementById('WebARRocksFaceCanvas');
  const canvasThree = document.getElementById('threeCanvas');

  // init WebAR.rock.mirror:
  WebARRocksMirror.init({
    isGlasses: false,

    //videoURL: '../../../../testVideos/1056010826-hd.mp4', // use a video from a file instead of camera video

    specWebARRocksFace: {
      // NNCPath: '../../neuralNets/NN_HEADPHONESL_2.json',
      // scanSettings: {
      //   threshold: 0.6
      // }
      NNCPath: "./neuralNets/NN_HEADPHONESL_2.json",
      // maxFacesDetected: 1,
      videoSettings: {
          videoElement: video,
      },
    },

    // lighting:
    isLightReconstructionEnabled: true,

    // increase stabilization:
    landmarksStabilizerSpec: {
      beta: 20,
      forceFilterNNInputPxRange: [1.5, 4]
    },

    solvePnPObjPointsPositions: {
      "noseLeft": [21.862150,-0.121031,67.803383], // 1791
      "noseRight": [-20.539499,0.170727,69.944778], // 2198

      "leftEyeExt": [44.507431,34.942841,38.750019], // 1808
      "rightEyeExt": [-44.064968,35.399670,39.362930], // 2214
     
      "leftEarTop": [89.165428,16.312811,-49.064980], // 3870
      "leftEarBase": [78.738243,-6.044550,-23.177490], // 2994
      "leftEarBottom": [78.786850,-41.321789,-24.603769], // 1741

      "rightEarTop": [-88.488602,17.271400,-48.199409], // 5622
      "rightEarBase": [-78.156998,-5.305619,-22.164619], // 4779
      "rightEarBottom": [-78.945511,-41.255100,-26.536131], // 5641

      "leftTemple": [60.262970,83.790382,-13.540310], // 108
      "rightTemple": [-60.034760,83.584427,-13.248530], // 286

      "foreHead": [-1.057755,97.894547,24.654940], // 696
    },
    solvePnPImgPointsLabels: [
      "foreHead",
      "leftTemple", "rightTemple",
      "leftEarTop", "rightEarTop",
      "leftEyeExt", "rightEyeExt",
      "rightEarBottom", "leftEarBottom",
    ],

    canvasFace: canvasFace,
    canvasThree: canvasThree,

    // initial canvas dimensions:
    width: window.innerWidth,
    height: window.innerHeight,

    // The occluder is a placeholder for the head. It is rendered with a transparent color
    // (only the depth buffer is updated).
    occluderURL: "assets/models3D/occluder.glb",
    modelURL: "assets/models3D/hatDraco.glb", //initial model loaded. false or null -> no model
    envmapURL: "assets/envmaps/venice_sunset_512.hdr",

    // temporal anti aliasing - Number of samples. 0 -> disabled:
    taaLevel: 0,

    // called once all is loaded:
    callback: async function(){
      document.getElementById('loading').style.display = 'none';
      console.log('WebARRocksMirror initialized successfully 2');
      video.style.display = "none";
      // wait 0.25sec
      await new Promise(r => setTimeout(r, 250));
      video.style.display = "block";
    },

    // debug flags - all should be false for production:
    debugLandmarks: false,
    debugOccluder: false
  }).then(function(){
    console.log('WebARRocksMirror initialized successfully');
  
    // display controls:
    document.getElementById('controls').style.display = 'flex';

    // handle orientation change or window resizing:
    const resizeCallback = function(){
      WebARRocksMirror.resize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('orientationchange', resizeCallback);
    window.addEventListener('resize', resizeCallback);
    // video.style.display = "block";

  }).catch(function(err){
    alert('An error happens with WebARRocksMirror: ' + err.toString());
  });
}


// this function is executed when the user clicks on CAPTURE IMAGE button
// it opens the captured image in a new tab:
function capture_image(){
  WebARRocksMirror.capture_image(function(cv){
    const dataURL = cv.toDataURL('image/png');
    const img = new Image();
    img.src = dataURL;
    img.onload = function(){
      const win = window.open("");
      win.document.write(img.outerHTML);
    }
  });
}

function startDemo() {
  startCamera();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('controls').style.display = 'flex';
}

function resizeCanvas(){
  WebARRocksMirror.resize(400, 400);
}

function showhideVideo(){
  // resetCanvasTransform();
  showCanvasInfo();
  // if(video.style.display == "none"){
  //   video.style.display = "block";
  // }else{
  //   video.style.display = "none";
  // }
  // show zindex of video
  // let zIndex = window.getComputedStyle(video).zIndex;
  // console.log('Video z-index:', zIndex);
  // // show zindex of threeCanvas
}

