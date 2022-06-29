let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let captureBtn = document.querySelector(".capture-btn");
let recordFlag = false;
let filter= "transparent";

let recorder;
let chunks = []; // media data in chunks

let constraints = {
    video: true,
    audio: true
}

navigator.mediaDevices.getUserMedia(constraints)
.then((stream)=>{
    video.srcObject = stream;
    
    recorder = new MediaRecorder(stream);
    recorder.addEventListener("start",(event)=>{
       chunks = []; // make chunks empty so that old video does not persist 
    })
    recorder.addEventListener("dataavailable",(event)=>{
       chunks.push(event.data); // store data in parts
    })  
    recorder.addEventListener("stop",(event)=>{
       // convert chunks to video

       let blob = new Blob(chunks,{type: "video/mp4"});
       let videoURL = URL.createObjectURL(blob);
       
       if(db){
          let videoID = shortid();
          let dbTransaction = db.transaction("video","readwrite");
          let videoStore = dbTransaction.objectStore("video");
          let videoEntry = {
              id: `vid-${videoID}`,
              blobData: blob
          }
          videoStore.add(videoEntry);
       }
    })  
})

recordBtnCont.addEventListener("click",(event)=>{
    if(!recorder) return; // since recorder is instantiated when promise resolves
    recordFlag = !recordFlag;

    if(recordFlag){ // start
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    }else{ // stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
})

captureBtnCont.addEventListener("click",(event)=>{
    captureBtn.classList.add("scale-capture");

    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let tool = canvas.getContext("2d");
    tool.drawImage(video,0,0,canvas.width,canvas.height);
    
    // Filtering
    tool.fillStyle = filter;
    tool.fillRect(0,0,canvas.width,canvas.height);

    let imageURL = canvas.toDataURL();

    if(db){
        let imageID = shortid();
        let dbTransaction = db.transaction("image","readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id: `img-${imageID}`,
            url: imageURL
        }
        imageStore.add(imageEntry);
     }
     
     setTimeout(()=>{
     captureBtn.classList.remove("scale-capture");
     },500)
})

let timerID;
let counter = 1; // total seconds
let timer = document.querySelector(".timer");
function startTimer() {
    timer.style.display = "block";
    function displayTimer(){
        let totalSeconds = counter;
        
        let hours = Number.parseInt(totalSeconds/3600);
        totalSeconds = totalSeconds%3600;
        let minutes = Number.parseInt(totalSeconds/60);
        totalSeconds = totalSeconds%60;
        let seconds = totalSeconds;
        hours = (hours<10) ? `0${hours}` : hours;
        minutes = (minutes<10) ? `0${minutes}` : minutes;
        seconds = (seconds<10) ? `0${seconds}` : seconds;
        timer.innerText = `${hours}:${minutes}:${seconds}`;

        counter++; // increments every second
    }

    timerID = setInterval(displayTimer,1000);
}

function stopTimer() {
    timer.style.display = "none";
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    counter = 1;
}

// Filtering logic

let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach((filterElem)=>{
    filterElem.addEventListener("click",(event)=>{
         filter = getComputedStyle(filterElem).getPropertyValue("background-color");
         filterLayer.style.backgroundColor = filter;
        })
})
