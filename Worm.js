const _seg = (x1, y1, x2, y2, stroke = 'rgb(0, 0, 0)') => ({x1, y1, x2, y2, stroke});
const getLine = ({x1, y1, x2, y2}) => ([x1, y1, x2, y2]);
const getStroke = ({stroke}) => stroke;

let factor = (mult = 1) => rndMinMaxInt(0, rndMinMaxInt(1, 3)) * mult;

class Worm {
  stroke = 'rgb(0, 0, 0)'
  x = 0;
  y = 0;

  borderX = 2;
  borderY = 2;

  borderWidth = 2;
  borderHeight = 2;


  length = 5;

  lengthMin = 3;
  lengthMax = 30;

  lengthStep = 1;

  maxLength = 1024 * 4;

  segments = [];

  degFactor = 2;
  degMutator = 1;
  deg = rndMinMaxInt(-360, 360);
  oldDeg = 0;
  lastSegment = null;
  firstSegment = null;

  isStop = false;

  constructor ({x, y, width, height}) {
    this.borderWidth = width;
    this.borderHeight = height;
    this.borderX = x;
    this.borderY = y;
  }

  step() {
    let isVisDetect = false;
    let isVisHead = false;
    if(this.isStop) return false;
    let segment = co(getLast(this.segments) || this.initPosition);
    let tmpSegment = co(segment);
    segment.x1 = segment.x2;
    segment.y1 = segment.y2;

    let flag = true;
    let safeMax = 400;
    let safeCount = 0;
    let x2 = null;
    let y2 = null;

    while (flag) {
      if(++safeCount > safeMax) {
        console.log('safe exit');
        this.isStop = true;
        flag = false;
      }
      // this.deg = rndFromArray(range(0, 360, 45));
      this.deg = degGuard(rndCoinBool() ? this.deg + this.degFactor : this.deg - this.degFactor);
      if(degGuard(this.deg + 180) === this.oldDeg) return;
      let { x2: _x2, y2: _y2 } = getRelativeLine({
        x: segment.x1,
        y: segment.y1,
        deg: this.deg,
        length: this.length * 3
      });
      if(isVisDetect) {
        strokeWeight(2);
        stroke(`rgb(255,0,0)`);
        line(...getLine({
          ...segment,
          x2: _x2,
          y2: _y2
        }));
        strokeWeight(1);
      }

      let isCrossed = this.testCrossed({
        ...segment,
        x2: _x2,
        y2: _y2
      });
      // console.log(isCrossed);
      if(this.degFactor >= 360) this.degMutator = -1;
      if(this.degFactor <= 2) this.degMutator = 1;
      if(isCrossed) {
        rndCoinBool() && this.segments.shift();
        this.degFactor += this.degMutator * this.degMutator;
        this.lengthStep = -1;
        this.length += this.lengthStep;
        if(this.length < this.lengthMin) this.length = this.lengthMin;
        if(this.degMutator < 0) this.degMutator = 1;
        return;
      }
      if(!isCrossed) {
        this.degFactor += this.degMutator;
        this.lengthStep = +1;
        this.length += this.lengthStep;
        if(this.length > this.lengthMax) this.length = this.lengthMax;
        if(this.degMutator > 0) this.degMutator = -2;
        x2 = _x2;
        y2 = _y2;
        flag = false;
      }
    }
    // console.log(this.degFactor);
    this.oldDeg = this.deg;
    this.lastSegment = this.segments.at(-1) || this.lastSegment;
    this.firstSegment = this.segments.at(0) || this.firstSegment;
    let { x2: __x2, y2: __y2 } = getRelativeLine({
      x: segment.x1,
      y: segment.y1,
      deg: this.deg,
      length: this.length
    });

    segment.x2 = __x2;
    segment.y2 = __y2;

    segment.stroke = `rgb(${rndMinMaxInt(0, 20)}, ${rndMinMaxInt(0, 10)}, ${rndMinMaxInt(0, 255)})`;

    if( segment.x2 >= this.maxX) {
      segment.x2 += -(this.length);
      this.deg = degGuard(this.deg + 180);
      this.oldDeg = this.deg;
    }
    if( segment.y2 >= this.maxY) {
      segment.y2 += -(this.length);
      this.deg = degGuard(this.deg + 180);
      this.oldDeg = this.deg;
    }

    if( segment.x2 <= this.minX) {
      segment.x2 += this.length;
      this.deg = degGuard(this.deg + 180);
      this.oldDeg = this.deg;
    }
    if( segment.y2 <= this.minY) {
      segment.y2 += this.length;
      this.deg = degGuard(this.deg + 180);
      this.oldDeg = this.deg;
    }

    if(this.segments.length > this.maxLength) this.segments.shift();
    if(isVisHead) {
      strokeWeight(20);
      stroke('rgba(127, 0, 127, 1)');
      point(segment.x2, segment.y2);
      strokeWeight(1);
    }

    this.segments.push(segment);
  }

  testCrossed(newSegment) {
    // console.log(';');
    // debugger;

    const segments = [
      _seg(...this.borderSegments.top),
      _seg(...this.borderSegments.right),
      _seg(...this.borderSegments.bottom),
      _seg(...this.borderSegments.left),
      ...this.segments,
    ];
    let count = -1;
    let max = segments.length - 1;
    let touched = [];
    let crossed = [];
    let equal = [];



    for (let i = 0; i < max; i++) {
      let segment  = segments[i];
      if(i === max) return false;
      const { isCrossed, isTouched, isEqual, dX, dY } = testCrossingLines(newSegment, segment);
      // if(i === max - 1){
      //   strokeWeight(10);
      //   stroke('rgb(0,0,255)');
      //   line(...getLine(segment));
      //   strokeWeight(1);
      // }
      if(isCrossed) crossed.push(i);
      if(isTouched) touched.push(i);
      if(isEqual) equal.push(i);
    }
    // console.log(crossed, equal, touched);
    if(crossed.length > 0) return true;
    if(equal.length > 0) return true;
    if(touched.length > 0) return true;
    // if(touched.length > 1 && touched[0] !== max  && max > 1) return true;
    return false;
  }

  get maxX() { return this.borderX + this.borderWidth; }
  get maxY() { return this.borderY + this.borderHeight; }
  get minX() { return this.borderX; }
  get minY() { return this.borderY; }
  get borderSegments() {
    return {
      top: [this.minX, this.minY, this.maxX, this.minY],
      bottom: [this.minX, this.maxY, this.maxX, this.maxY],
      left: [this.minX, this.minY, this.minX, this.maxY],
      right: [this.maxX, this.minY, this.maxX, this.maxY]
    };
  }

  get initPosition() {
    // const x1 = rndMinMaxInt(this.borderX, this.borderX + (this.borderWidth - this.length));
    // const y1 = rndMinMaxInt(this.borderY, this.borderY + (this.borderHeight - this.length));
    // const x2 = x1 + this.length;
    // const y2 = y1 + this.length;
    // return {x1, y1, x2, y2, stroke: this.stroke};
    if(this.lastSegment) return this.lastSegment;
    const x1 = int(this.borderX + (this.borderWidth - this.length) / 2);
    const y1 = int(this.borderY + (this.borderHeight - this.length) / 2);
    const x2 = x1 + this.length;
    const y2 = y1 + this.length;
    return {x1, y1, x2, y2, stroke: this.stroke};

  }

  drawWorm() {
    const isVisSegemntsEnd = false;
    for (let segment of this.segments) {
      stroke(getStroke(segment));
      if(isVisSegemntsEnd) {
        strokeWeight(5)
        point(segment.x1, segment.y1);
        point(segment.x2, segment.y2);
        strokeWeight(1)
      }
      line(...getLine(segment));
    }
  }

  render() {
    this.drawWorm();
  }

}
