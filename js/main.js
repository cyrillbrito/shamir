/* ----- QR Scanner ----- */

const videoEl = document.createElement('video');
const messageEl = document.getElementById('message');
const closeModalEl = document.getElementById('closeModalBtn');
const modalEl = document.getElementById('modal');
const canvasEl = document.getElementById('canvas');
const canvas = canvasEl.getContext('2d');
let scanningInput;

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
  messageEl.hidden = true;
  videoEl.srcObject = stream;
  videoEl.setAttribute('playsinline', true);
  videoEl.play();
  requestAnimationFrame(tick);
});

function tick() {
  if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA && scanningInput) {
    canvasEl.hidden = false;
    canvasEl.height = videoEl.videoHeight;
    canvasEl.width = videoEl.videoWidth;
    modalEl.style.width = `${videoEl.videoWidth + 32}px`;
    canvas.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    const imageData = canvas.getImageData(0, 0, canvasEl.width, canvasEl.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    if (code) {
      scanningInput.value = code.data;
      closeModalEl.click();
      combine();
    }
  }
  requestAnimationFrame(tick);
}

/* ----- Combine tab ----- */

const inputs = [];
pushShareInput();

function pushShareInput() {
  const sharesEl = document.getElementById('sharesInputs');

  const group = document.createElement('div');
  group.classList.add('input-group');
  sharesEl.append(group);

  const input = document.createElement('input');
  input.classList.add('form-control');
  group.append(input);
  inputs.push(input);

  const scanBtn = document.createElement('button');
  scanBtn.innerText = 'Scan QR Code';
  scanBtn.classList.add('btn');
  scanBtn.classList.add('btn-outline-secondary');
  scanBtn.setAttribute('data-bs-toggle', 'modal');
  scanBtn.setAttribute('data-bs-target', '#scanModal');
  scanBtn.onclick = () => { scanningInput = input };
  group.append(scanBtn);

  const removeBtn = document.createElement('button');
  removeBtn.innerText = 'Remove share';
  removeBtn.classList.add('btn');
  removeBtn.classList.add('btn-outline-danger');
  group.append(removeBtn);

  input.addEventListener('input', combine);
}

function combine() {
  if (inputs.every(i => i.value)) {
    pushShareInput();
  }

  const shares = inputs.map(i => i.value).filter(s => s);
  const el = document.getElementById('combine-secret');

  try {
    const secret = secrets.combine(shares);
    el.innerText = secrets.hex2str(secret);
  } catch (e) {
    el.innerText = 'Some of the shares are invalid';
  }
}



/* ----- Generate tab ----- */

document.getElementById('secretInput').addEventListener('input', generate);
document.getElementById('kInput').addEventListener('input', generate);
document.getElementById('nInput').addEventListener('input', generate);
generate();

function generate() {

  const secretStr = document.getElementById('secretInput').value;
  const secret = secrets.str2hex(secretStr);

  const nStr = document.getElementById('nInput').value;
  const n = Number(nStr);

  const kStr = document.getElementById('kInput').value;
  const k = Number(kStr);

  const sharesDiv = document.getElementById('shares');
  sharesDiv.innerHTML = '';

  if (!secretStr || !nStr || !kStr) {
    addAlert('All the fields are required');
  } else if (n < 2) {
    addAlert('Total Number of Shares must be bigger than 2');
  } else if (k < 2 || n < k) {
    addAlert('Minimum Required Shares must be more than 2 and less or equal to the Total Number of Shares');
  } else {
    const shares = secrets.share(secret, n, k);
    for (let i = 0; i < shares.length; i++) {
      addShareCard(i + 1, shares[i]);
    }
  }
}

function addAlert(message) {

  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.classList.add('alert-warning');
  alert.innerText = message;

  document.getElementById('shares').append(alert);
}

function addShareCard(shareN, shareHash) {

  const card = document.createElement('div');
  card.classList.add('card');

  const header = document.createElement('div');
  header.classList.add('card-header');
  header.append(`Share ${shareN}`);

  const body = document.createElement('div');
  body.classList.add('card-body');

  const qr = document.createElement('div');
  new QRCode(qr, shareHash);
  body.append(qr);

  const hash = document.createElement('div');
  hash.classList.add('hash');
  hash.innerText = shareHash;
  body.append(hash);

  card.append(header);
  card.append(body);

  document.getElementById('shares').append(card);
}
