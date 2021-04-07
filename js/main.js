

// Generate tab events

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

  const alert = document.createElement("div");
  alert.classList.add('alert');
  alert.classList.add('alert-warning');
  alert.innerText = message;

  document.getElementById('shares').append(alert);
}

function addShareCard(shareN, shareHash) {

  const card = document.createElement("div");
  card.classList.add('card');

  const header = document.createElement('div');
  header.classList.add('card-header');
  header.append('Share ' + shareN);

  const body = document.createElement('div');
  body.classList.add('card-body');
  body.append(shareHash);

  card.append(header);
  card.append(body);

  document.getElementById('shares').append(card);
}



const inputs = [];
pushShareInput();





function pushShareInput() {

  const input = document.createElement("input");
  input.classList.add('form-control');
  document.getElementById('sharesInputs').append(input);
  inputs.push(input);

  input.addEventListener('keyup', (event) => {
    if (inputs.every(i => i.value)) {
      pushShareInput();
    }
    const shares = inputs.map(i => i.value).filter(s => s);
    const secret = secrets.combine(shares);

    console.log(secrets.hex2str(secret));
  });
}