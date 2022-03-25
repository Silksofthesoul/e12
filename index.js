const elMain = document.body;
let fr = 60;
let width = elMain.offsetWidth || 640;
let height = elMain.offsetHeight || 640;
let x = int(width / 2) / 2;
let y = int(height / 2) / 2;

let fz = int(min(width, height) / 2);
let worms = [];
// let worm = new Worm({
//   x, y,
//   width: int(width / 2),
//   height: int(height / 2),
// });

for (var i = 0; i < rndMinMaxInt(1, 10); i++) {
  worms.push(new Worm({
    x, y,
    width: int(width / 2),
    height: int(height / 2),
  }));
}

let scene = new Scene({
  x, y,
  width: int(width / 2),
  height: int(height / 2),
  isShowGrid: false,
  isShowBorder: false,
  isShowBg: false
});

let ll = new Line();

function setup() {
  createCanvas(width, height);
  frameRate(fr);
  textAlign(CENTER, CENTER);
}

let slowDown = (fc, fr, fn) => {
  if(fc >= fr) {
    fn();
    return true;
  }
  return false;
};

let current = 0;
let maxF = int(fr/8);
maxF = 0;

let mutateCount = 0;
const mutateCountMax = 100;

function draw() {
  let flag = slowDown(++current, maxF, _ => {
    mutateCount++;
    background('rgba(255, 255, 255, 0.011)');
    scene.render();
    // ll.render();
    // worm.step();
    // worm.render();
    worms.forEach(worm => {
      worm.step();
      worm.render();
    });
    if(mutateCount > mutateCountMax) {
      mutateCount = 0;
      if(rndCoinBool() && worms.length > 2) worms.shift();
      if(rndCoinBool() && worms.length < 100) worms.push(new Worm({ x, y, width: int(width / 2), height: int(height / 2), }));
    }
  });
  if(flag) current = 0;
}
