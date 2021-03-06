'use strict';

const video = document.querySelector('video');
const btnCamera = document.querySelector('#btnCamera');
const btnRecord = document.querySelector('#btnRecord');
const btnRepeat = document.querySelector('#btnRepeat');
const btnPlay = document.querySelector('#btnPlay');
const progressBar1cont = document.querySelector('#bar1');
const progressBar2cont = document.querySelector('#bar2');
const progressBar1 = document.querySelectorAll('#bar1 .progressBarPart');
const progressBar2 = document.querySelectorAll('#bar2 .progressBarPart');
const title = document.querySelector('#title');
const gif = document.querySelector('#gif');
const lblTimer = document.querySelector('#timer');

const apiUpload = 'https://upload.giphy.com/v1/gifs';

let cameraStream,
	recorder,
	blob,
	flag = 'record';

document.getElementById('arrow').addEventListener('click', () => (document.location.href = './misgifos.html'));
document.getElementById('logo').addEventListener('click', () => (document.location.href = './index.html'));
btnRecord.addEventListener('click', () => dynamicFunctionality());
btnRepeat.addEventListener('click', () => {
	location.reload();
	recordVideo();
});

//! Funcionalidad secuencial del btn 'Grabar'.
function dynamicFunctionality() {
	switch (flag) {
		case 'record':
			flag = 'stop';
			recordVideo();
			lblTimer.classList.toggle('visible');
			timer();
			btnRecord.innerHTML = 'Listo';
			btnRecord.classList.toggle('btnReady');
			btnCamera.classList.toggle('btnRecord');
			title.innerHTML = 'Capturando Tu Gifo';
			break;
		case 'stop':
			flag = 'preview';
			stopRecording();
			stopCamera();
			btnRecord.classList.toggle('btnReady');
			btnCamera.classList.toggle('btnRecord');
			btnCamera.style.display = 'none';
			title.innerHTML = 'Vista Previa';
			btnRecord.innerHTML = 'Subir Gifo';
			btnRepeat.classList.toggle('visible');
			progressBar2cont.classList.toggle('visible');
			btnPlay.classList.toggle('visible');
			progressBarEffect(progressBar2);
			break;
		case 'preview':
			flag = 'upload';
			upload(blob);
			document.querySelector('.container-video').style.display = 'none';
			document.querySelector('.container-uploading').style.display = 'flex';
			progressBarEffect(progressBar1);
			title.innerHTML = 'Subiendo Gifo';
			btnRecord.innerHTML = 'Cancelar';
			btnRepeat.classList.toggle('visible');
			progressBar1cont.classList.toggle('visible');
			progressBar2cont.classList.toggle('visible');
			btnPlay.classList.toggle('visible');
			lblTimer.classList.toggle('visible');
			break;
	}
}

function persistenceTheme() {
	if (localStorage.theme != undefined) {
		document.documentElement.dataset.theme = localStorage.getItem('theme');
		if (localStorage.getItem('theme') == 'light') {
			const logo = document.getElementById('logo');
			logo.setAttribute('src', '../img/gifOF_logo.png');
		} else {
			const logo = document.getElementById('logo');
			logo.setAttribute('src', './gifOF_logo_dark.png');
		}
	}
}

function startCamera() {
	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				height: { max: 480 }
			}
		})
		.then(function(stream) {
			cameraStream = stream;
			video.srcObject = cameraStream;
			video.play();
		})
		.catch(() => alert('Necesitas una cámara para continuar.'));
}

function stopCamera() {
	cameraStream.getTracks().forEach(track => track.stop());
}

function recordVideo() {
	recorder = createGifRecorder(cameraStream);
	recorder.startRecording();
	video.style.display = 'block';
	gif.style.display = 'none';
}

function stopRecording() {
	recorder.stopRecording(showRecordedGif);
	video.style.display = 'none';
	gif.style.display = 'block';
}

function showRecordedGif() {
	blob = recorder.getBlob();
	gif.src = URL.createObjectURL(blob);
	recorder.destroy();
	recorder = null;
}

function createGifRecorder(stream) {
	return RecordRTC(stream, {
		type: 'gif',
		frameRate: 1,
		quality: 10,
		width: 360,
		hidden: 240,
		onGifRecordingStarted: () => console.log('started')
	});
}

function progressBarEffect(bar) {
	let cont = 0;
	setInterval(() => {
		if (cont < bar.length) {
			bar[cont].classList.toggle('progressBarPartEnabled');
			cont++;
		} else {
			cont = 0;
		}
	}, 100);
}

function timer() {
	let segs = 1;
	let mins = 0;
	let timerElement = document.querySelector('#timer');
	let timer = setInterval(() => {
		if (flag == 'stop') {
			if (segs < 60) {
				if (segs <= 9) {
					segs = '0' + segs;
				}
				timerElement.innerHTML = `00:00:0${mins}:${segs}`;
				segs++;
			} else {
				mins++;
				segs = 0;
			}
		} else {
			clearInterval(timer);
		}
	}, 1000);
}

async function upload(blob) {
	const formData = new FormData();
	formData.append('file', blob, 'myGif.gif');
	await fetch(`${apiUpload}?api_key=${apiKey}`, {
		method: 'post',
		body: formData
	})
		.then(res => res.json())
		.then(resParsed => {
			const uploadedGifoId = resParsed.data.id;
			localStorage.setItem('lastUpload', uploadedGifoId);
			saveGifoInLocalStorage(uploadedGifoId);
		});
	localStorage.setItem('newGifos', false);
	localStorage.setItem('hasUploaded', true);
	document.location.href = './misgifos.html';
}

//! Guarda IDs separados por , en un solo key
function saveGifoInLocalStorage(gifoID) {
	let savedGifs = localStorage.getItem('myGifos');
	if (savedGifs != null) localStorage.setItem('myGifos', `${savedGifs},${gifoID}`);
	else localStorage.setItem('myGifos', gifoID);
}

persistenceTheme();
startCamera();
