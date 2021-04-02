
// generate a 512-bit key
var key = secrets.random(512) // => key is a hex string

// split into 10 shares with a threshold of 5
var shares = secrets.share(key, 10, 5)
// => shares = ['801xxx...xxx','802xxx...xxx','803xxx...xxx','804xxx...xxx','805xxx...xxx']

// combine 4 shares
var comb = secrets.combine(shares.slice(0, 4))
console.log(comb === key) // => false

// combine 5 shares
comb = secrets.combine(shares.slice(4, 9))
console.log(comb === key) // => true

// combine ALL shares
comb = secrets.combine(shares)
console.log(comb === key) // => true

// create another share with id 8
var newShare = secrets.newShare(8, shares) // => newShare = '808xxx...xxx'

// reconstruct using 4 original shares and the new share:
comb = secrets.combine(shares.slice(1, 5).concat(newShare))
console.log(comb === key) // => true

const inputs = [];

setTimeout(() => {
  const secretInput = document.getElementById('secretInput');
  const kInput = document.getElementById('kInput');
  const nInput = document.getElementById('nInput');

  secretInput.addEventListener('change', (event) => {

    var pw = secretInput.value;

    var n = Number(nInput.value);
    var k = Number(kInput.value);

    var pwHex = secrets.str2hex(pw);
    var shares = secrets.share(pwHex, n, k);

    console.log(shares);

    document.getElementById('shares').innerHTML = '';
    for (let i = 0; i < shares.length; i++) {
      pushShareCard(i + 1, shares[i]);
    }


  });

  pushShareInput();

}, 1000);


function pushShareCard(shareN, shareHash) {

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