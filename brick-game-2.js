/**
 * Brick Game 2
 * By Connor Doman
 *
 * Started February 10, 2021
 *
 */
const P5_LOCATION = 'https://connordoman.com/res/p5/p5.js';

const DEBUG = false;


const BRICK_GAME = function (p) {

    p.preload = () => {
        this.font = p.loadFont('./res/fonts/press_start_2p.ttf');
    };

    p.setup = () => {
        this.setupDomElements();
        this.gridSize = 16;
        this.unitsX = 9;
        this.unitsY = 16;
        this.score = 0;
        this.level = 0;
        this.p = p;
        this.paused = true;

        // p5 preparation
        p.frameRate(60);
        let cnv = p.createCanvas(2 * this.unitsX * this.gridSize, 2 * this.unitsY * this.gridSize);
        cnv.parent('gamearea');
        p.textFont(this.font);

        // Game objects
        this.ball = new Ball(this, this.unitsX * this.gridSize, this.unitsY * this.gridSize, 8);
        this.ball.reset();
        this.paddle = new Paddle(this);
        this.levelUp();
    };

    p.draw = () => {
        p.background(0);
        p.rectMode(p.CENTER);
        p.ellipseMode(p.RADIUS);

        if (DEBUG) {
            this.drawGrid();
        }

        // update objects
        this.ball.update();
        this.brickSet.update();
        this.paddle.update();
        this.ball.screenCollide();

        // draw hud
        this.drawGameInfo();

        // draw objects
        this.paddle.draw();
        this.ball.draw();
        this.brickSet.draw();
    };

    p.keyTyped = () => {
        if (p.key === ' ') {
            this.pause();
        }
        if (DEBUG) {
            if (p.key === 'l') {
                this.levelUp();
            }
        }
    };

    p.windowResized = () => {
        //let res = scaleResolution(9 * GRID_SIZE, 16 * GRID_SIZE);
        //p.resizeCanvas(res.w, res.h);
    };

    this.scaleResolution = (unitsX, unitsY) => {
        let scrRatio = p.windowWidth / p.windowHeight;
        return scrRatio > unitsX / unitsY ? { w: unitsX * (p.windowHeight / unitsY), h: p.windowHeight } : { w: p.windowWidth, h: unitsY * (p.windowWidth / unitsX) };
    };

    this.drawGrid = () => {
        // draw grid
        p.stroke(p.color(0, 0, 50));
        p.strokeWeight(1);
        for (let i = 0; i < p.height / this.gridSize; i++) {
            p.line(0, i * this.gridSize, p.width, i * this.gridSize);
            for (let j = 0; j < p.width / this.gridSize; j++) {
                p.line(j * this.gridSize, 0, j * this.gridSize, p.height);
            }
        }
    };

    this.drawGameInfo = () => {
        // top border
        p.stroke(255);
        p.strokeWeight(1);
        p.line(0, this.gridSize * 2, p.width, this.gridSize * 2);

        // score
        p.noStroke();
        p.fill(255);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(this.gridSize * 3 / 4);
        p.text(`Score: ${this.score}`, this.gridSize / 2, this.gridSize);

        // level
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(`Lv:${this.level.toString().padStart(2, '0')}`, p.width - this.gridSize / 2, this.gridSize);
    }

    this.log = (obj) => {
        if (DEBUG) {
            console.log(obj);
        }
    };

    this.err = (obj) => {
        if (DEBUG) {
            console.error(obj);
        }
    };

    this.pause = () => {
        this.paused = !this.paused;
        if (this.paused) {
            p.noLoop();
            this.buttonPause.innerHTML = 'Play';
        } else if (!this.paused) {
            p.loop();
            this.buttonPause.innerHTML = 'Pause';
        }
    };

    this.pauseExplicit = (pause) => {
        this.paused = !pause;
        this.pause();
    };

    this.levelUp = () => {
        let layouts = Object.keys(BrickGroup.layouts);
        let lvl = BrickGroup.layouts[layouts[this.level % layouts.length]];
        this.log(lvl);
        this.brickSet = new BrickGroup(this, lvl);
        this.brickSet.startingScore = this.score;
        this.ball.pos = new Vector(this.unitsX * this.gridSize, this.unitsY * this.gridSize);
        this.ball.vel = new Vector(0, 5);
        this.paddle.reset();
        this.level++;
        this.pauseExplicit(true);
        p.draw();
    };

    this.setupDomElements = () => {
        // play-pause
        this.buttonPause = document.querySelector('#pause-play');
        this.buttonPause.addEventListener('click', () => {
            this.pause();
        });
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get distanceSq() {
        return this.x * this.x + this.y * this.y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set magnitude(value) {
        let dir = this.direction;
        this.x = Math.cos(dir) * value;
        this.y = Math.sin(dir) * value;
    }

    get direction() {
        return Math.atan2(this.y, this.x);
    }

    set direction(angle) {
        let mag = this.magnitude;
        this.x = Math.cos(angle) * mag;
        this.y = Math.sin(angle) * mag;
    }

    get directionX() {
        if (this.x === 0) {
            return 1;
        } else {
            return this.x / Math.abs(this.x);
        }
    }

    get directionY() {
        if (this.y === 0) {
            return 1;
        } else {
            return this.y / Math.abs(this.y);
        }
    }

    get degrees() {
        return this.direction * (180 / Math.PI);
    }

    moveLeft(m) {
        return new Vector(this.x - m, this.y);
    }

    moveRight(m) {
        return new Vector(this.x + m, this.y);
    }

    moveUp(m) {
        return new Vector(this.x, this.y - m);
    }

    moveDown(m) {
        return new Vector(this.x, this.y - m);
    }

    left(a) {
        return new Vector(this.x - a.x, this.y);
    }

    right(a) {
        return new Vector(this.x + a.x, this.y);
    }

    up(a) {
        return new Vector(this.x, this.y - a.y);
    }

    down(a) {
        return new Vector(this.x, this.y + a.y);
    }


    dot(a) {
        return a.x * this.x + a.y * this.y;
    }

    add(a) {
        return new Vector(a.x + this.x, a.y + this.y);
    }

    sub(a) {
        return new Vector(this.x - a.x, this.y - a.y);
    }

    increase(scalar) {
        return new Vector(this.x + scalar * Math.cos(this.direction), this.y + scalar * Math.sin(this.direction));
    }

    decrease(scalar) {
        return new Vector(this.x - scalar * Math.cos(this.direction), this.y - scalar * Math.sin(this.direction));
    }

    mult(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    div(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    normalize() {
        let mag = this.magnitude;
        if (mag == 0) {
            alert('MAGNITUDE ZERO');
            return new Vector(1, 1);
        }
        return new Vector(this.x / mag, this.y / mag);
    }

    bounce(normed) {
        let tmp = normed.mult(2 * this.dot(normed));
        return this.sub(tmp);
    }

    parity() {
        return (this.x * this.y) / Math.abs(this.x * this.y);
    }



    dist(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;

        return Math.sqrt((dx * dx) + (dy * dy));
    }

    angle(v) {
        return this.direction - v.direction;
    }

    endpoint(from) {
        return new Vector(this.x + from.x, this.y + from.y);
    }

    roundDown() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }

    toString() {
        return `${this.magnitude} @ ${this.degrees}° (${this.x}, ${this.y})`;
    }

    kineticEnergy() {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    rotate(angle) {
        let turn = new Vector(this.x, this.y);
        turn.direction += angle;
        return turn;
    }

    distance(v) {
        return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y);
    }
}

class Rectangle {
    constructor(p1, width, height) {
        this.width = width;
        this.height = height;
        this.calculateData(p1);
    }

    setPosition(pos) {
        this.calculateData(pos);
    }

    calculateData(p1) {
        this.p1 = p1;
        this.p2 = new Vector(p1.x + this.width, p1.y + this.height);
        this.x = p1.x + this.width / 2;
        this.y = p1.y + this.height / 2;
        this.center = new Vector(this.x, this.y);
    }

    intersects(pt) {
        if (pt.x > this.p1.x &&
            pt.x < this.p2.x &&
            pt.y > this.p1.y &&
            pt.y < this.p2.y) {
            return true;
        } else {
            return false;
        }
    }
}

class Circle {
    constructor(pos, r) {
        this.pos = pos;
        this.r = r;
    }

    intersects(pt) {
        let dx = this.pos.x - pt.x;
        let dy = this.pos.y - pt.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= r) {
            return true;
        } else {
            return false;
        }
    }
}

class Triangle {
    constructor(pos, r, angle) {
        this.pos = pos;
        this.r = r;
        this.angle = angle;

        let pts = this.points();
        this.p1 = pts[0];
        this.p2 = pts[1];
        this.p3 = pts[2];
    }

    intersects(pt) {
        let d1 = this.sign(pt, this.p1, this.p2);
        let d2 = this.sign(pt, this.p2, this.p3);
        let d3 = this.sign(pt, this.p3, this.p1);

        let hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        let hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(hasNeg && hasPos);
    }

    points() {
        let x1 = this.pos.x + this.r * Math.sin(this.angle);
        let x2 = this.pos.x + this.r * Math.sin(this.angle + (2 * Math.PI / 3));
        let x3 = this.pos.x + this.r * Math.sin(this.angle - (2 * Math.PI / 3));

        let y1 = this.pos.y + this.r * Math.cos(this.angle);
        let y2 = this.pos.y + this.r * Math.cos(this.angle + (2 * Math.PI / 3));
        let y3 = this.pos.y + this.r * Math.cos(this.angle - (2 * Math.PI / 3));

        let p1 = new Vector(x1, y1);
        let p2 = new Vector(x2, y2);
        let p3 = new Vector(x3, y3);
        return [p1, p2, p3];
    }

    /**
     * https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
     * 
     * sign() and intersects()
     */
    sign(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }
}

class Ball extends Circle {
    constructor(g, x, y, r) {
        super(new Vector(x, y), r);
        this.g = g;
        this.vel = new Vector(0, 0);
        this.bounds = new Rectangle(this.pos, 2 * this.r, 8 * this.r);
        this.lastPos = this.pos;
    }

    update() {
        // shitty ass NaN solution
        if (isNaN(this.vel.x) || isNaN(this.vel.y)) {
            console.error('Velocity is NaN');
            this.vel = new Vector(0, 3);
        }

        // if it's only moving side to side
        if (this.vel.y === 0) {
            this.vel.y += 0.02;
        } else if (Math.abs(this.vel.y) < 2) {
            this.vel.y += 0.01 * (Math.abs(this.vel.y) / this.vel.y);
        }

        this.lastPos = this.pos;
        this.pos = this.pos.add(this.vel);


        if (this.g.p.millis() % 1000 < 20) {
            this.g.log(`Ball: ${this.pos.toString()}\nBall.vel: ${this.vel.toString()}\nBall.vel.kineticEnergy: ${this.vel.kineticEnergy()}`);
        }

        //this.bounds.setPosition(this.pos);
    }

    draw() {
        this.g.p.stroke(255);
        this.g.p.noFill();
        this.g.p.circle(this.pos.x, this.pos.y, this.r);

        if (DEBUG) {
            this.g.p.strokeWeight(2);
            this.g.p.point(this.pos.x, this.pos.y);
            //this.g.p.rect(this.bounds.p1.x, this.bounds.p1.y, this.bounds.width, this.bounds.height);
            let velTip = this.vel.endpoint(this.pos);
            this.g.p.stroke(this.g.p.color(125, 100, 100));
            this.g.p.line(this.pos.x, this.pos.y, velTip.x, velTip.y);
        }
    }

    setVelocity(vec) {
        this.vel = new Vector(vec.x, vec.y);
    }

    screenCollide() {
        if (this.pos.x + this.r + this.vel.x >= this.g.p.width || this.pos.x - this.r + this.vel.x <= 0) {
            this.vel.x *= -1;
        }
        if (this.pos.y - this.r + this.vel.y < this.g.gridSize * 2) {
            this.vel.y *= -1;
            this.pos.y = this.g.gridSize * 2 + this.r;
        } else if (this.pos.y - this.r >= this.g.p.height) {
            this.reset();
        }
    }

    reset() {
        this.pos = new Vector(this.g.unitsX * this.g.gridSize, this.g.unitsY * this.g.gridSize);
        this.vel = new Vector(0, 5);
    }

    collision(rect) {
        let colour = 'red';
        let collide = false;

        let nearX = Math.max(rect.p1.x, Math.min(this.pos.x, rect.p2.x));
        let nearY = Math.max(rect.p1.y, Math.min(this.pos.y, rect.p2.y));

        let radius = new Vector(nearX, nearY);
        let dist = radius.sub(this.pos);

        if (dist.distanceSq < this.r * this.r) {
            let distMag = dist.magnitude;
            if (distMag < 1) {
                dist.magnitude = 1;
                distMag = 1;
            }
            let distToMove = distMag - this.r;
            let theta = this.vel.angle(dist.rotate(Math.PI / 2));
            let dispX = 0;
            let dispY = 0;

            dispX = Math.cos(theta) * distToMove * dist.directionX;
            dispY = Math.sin(theta) * distToMove * dist.directionY;

            this.pos.x -= dispX;
            this.pos.y -= dispY;

            this.g.log(dist.toString());

            if (Math.abs(radius.y) === Math.abs(radius.x)) {
                // 45 degrees
                this.vel = this.vel.mult(-1);
                collide = true;
                this.g.log('Collision at 45°');
            } else if (theta % (Math.PI / 2) === 0) {
                // top-bottom
                this.setVelocity(new Vector(this.vel.x, -this.vel.y));
                collide = true;
                this.g.log('Collision on horizontal');
            } else if (theta % Math.PI === 0) {
                // left-right
                this.setVelocity(new Vector(-this.vel.x, this.vel.y));
                collide = true;
                this.g.log('Collision on vertical');
            } else {
                // corners
                this.setVelocity(this.vel.bounce(dist.normalize()));
                collide = true;

                this.g.log('Collision at ' + theta * (180 / Math.PI) + '°');
            }

            this.g.log(`Distance to move: ${distToMove} (${dispX},${dispY}) ${(theta * (180 / Math.PI)).toFixed(2)}°`);

        }

        if (DEBUG) {
            this.g.p.stroke(colour);
            this.g.p.strokeWeight(1);
            this.g.p.line(this.pos.x, this.pos.y, radius.x, radius.y);
        }

        return collide;
    }
}

class Brick extends Rectangle {
    constructor(g, x, y, type) {
        super(new Vector(x, y), 2 * g.gridSize, g.gridSize);
        this.g = g;
        this.destroyed = false;
        this.g.p.colorMode(this.g.p.HSB);
        if (type) {
            this.type = type;
        } else {
            this.type = 1;
        }
        this.determineColor();
    }

    determineColor() {
        if (this.type === Brick.types.standard) {
            // rainbow color
            this.color = this.g.p.color(this.g.p.map(this.p1.x, 0, 18 * this.g.gridSize, 0, 360), this.g.p.map(this.p1.y, 0, 16 * this.g.gridSize, 75, 0), 90);
        } else if (this.type === Brick.types.concrete) {
            // concrete color
            this.color = this.g.p.color(0, 0, 80);
        }
    }

    update() {
        let p = new Vector(this.g.p.mouseX, this.g.p.mouseY);
        this.calculatePos(new Vector(p.x - this.width / 2, p.y - this.height / 2));
    }

    draw() {
        this.g.p.strokeWeight(1);
        this.g.p.stroke(255);
        this.g.p.fill(this.color);
        this.g.p.rect(this.x, this.y, this.width, this.height);

        if (DEBUG) {
            this.g.p.stroke('red');
            this.g.p.strokeWeight(2);
            this.g.p.point(this.x, this.y);
        }
    }

    collision(ball) {
        let collide = ball.collision(this);
        if (collide) {
            if (this.type === Brick.types.standard) {
                window.setTimeout(this.destroyed = true, 100);
                this.g.score++;
            }
        }
        return collide;
    }

    toString() {
        let str = `Brick: ${this.center.toString()}\n\tdestroyed: ${this.destroyed}`;
        return str;
    }
}

Brick.types = {
    air: 0,
    standard: 1,
    concrete: 2
};

class BrickGroup {
    constructor(g, layout) {
        this.g = g;
        this.bricks = [];
        this.score = 0;
        this.pos = new Vector(0, 2 * this.g.gridSize);
        this.startingScore = 0;
        if (Array.isArray(layout)) {
            // custom layouts
            for (let y = 0; y < layout.length; y++) {
                for (let x = 0; x < layout[y].length; x++) {
                    let val = layout[y][x];
                    if (val > 0) {
                        this.add(new Brick(this.g, this.pos.x + x * 2 * g.gridSize, this.pos.y + y * g.gridSize, val));
                    }
                }
            }
        } else if (typeof layout === 'number') {
            // default row of one
            for (let i = 0; i < layout; i++) {
                this.add(new Brick(this.g, this.pos.x + (i % 9) * 2 * g.GRID_SIZE, this.pos.y + i + (i / 9) * g.GRID_SIZE));
            }
        }
        this.g.log(this.toString());
    }

    get size() {
        return this.bricks.length;
    }

    update() {
        let br;
        let nearest;
        let distSq = 0;
        for (let i = 0; i < this.size; i++) {
            br = this.get(i);
            if (br) {
                distSq = br.center.sub(this.g.ball.pos).distanceSq;
                if (!nearest || distSq < nearest.center.sub(this.g.ball.pos).distanceSq) {
                    nearest = br;
                }
            }
        }

        if (nearest) {
            if (nearest.collision(this.g.ball)) {
                if (this.score + this.startingScore === this.g.score) {
                    this.g.levelUp();
                }
            }
        }

    }

    draw() {
        let br;
        for (let i = 0; i < this.size; i++) {
            br = this.get(i);
            if (br)
                br.draw();
        }
    }

    add(brick) {
        if (!this.contains(brick)) {
            this.bricks.push(brick);
            if (brick.type !== Brick.types.concrete) {
                this.score++;
            }
        }
    }

    get(index) {
        if (0 <= index && index < this.bricks.length) {
            let brick = this.bricks[index];
            if (brick && !brick.destroyed)
                return this.bricks[index];
        }
        return false;
    }

    remove(brick) {
        if (this.contains(brick))
            this.bricks.splice(index, 1);
    }

    contains(brick) {
        let index = this.bricks.indexOf(brick);
        return index > -1;
    }

    translate(x, y) {
        this.pos = new Vector(x, y);
        for (let i = 0; i < this.size; i++) {
            let br = this.get(i);
            br.setPosition(this.pos.add(br.p1));
        }
    }

    toString() {
        let str = '';
        for (let i = 0; i < this.size; i++) {
            str += this.get(i).toString() + '\n';
        }
        return str;
    }
}

BrickGroup.layouts = {
    fenceLayout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    gridLayout: [
        [0, 1, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0, 1]
    ],
    ryanSpecialLayout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    smileLayout: [
        [0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 0]
    ],
    filterLayout: [
        [1, 0, 0, 1, 0, 1, 0, 0, 1],
        [0, 1, 1, 1, 0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 0, 0, 2, 0, 2, 0, 0, 2]
    ]
};

class Paddle extends Rectangle {
    constructor(g) {
        super(new Vector((g.p.width / 2) - 2.5 * g.gridSize, (g.gridSize * 29)), g.gridSize * 5, g.gridSize / 2);
        this.g = g;
        this.vel = new Vector(4, 0);
        this.indicator = new Triangle(new Vector(0, 0), this.height / 2, Math.PI);
    }

    update() {
        if (this.g.p.keyIsDown(this.g.p.LEFT_ARROW)) {
            this.move(-1);
        } else if (this.g.p.keyIsDown(this.g.p.RIGHT_ARROW)) {
            this.move(1);
        } else if (this.g.p.mouseIsPressed) {
            if (this.g.p.mouseY > this.g.gridSize * 28 && this.g.p.mouseY <= this.g.p.height + this.g.gridSize) {
                this.translate(this.g.p.mouseX, this.p1.y);
            }
        }
        //if (this.g.ball.collision(this)) {
        this.collision(this.g.ball);
        //}

    }

    move(dir) {
        dir = dir / Math.abs(dir);
        let xDisp = dir * this.vel.x;
        if (this.p1.x + xDisp >= 0 && this.p2.x + xDisp <= this.g.p.width) {
            this.setPosition(this.p1.add(new Vector(xDisp, this.vel.y)));
        }
    }

    translate(x, y) {
        let halfWid = this.width / 2;
        if (x < halfWid) {
            x = halfWid;
        } else if (x > this.g.p.width - halfWid) {
            x = this.g.p.width - halfWid;
        }
        if (0 <= this.p1.x && this.p2.x <= this.g.p.width) {
            this.setPosition(new Vector(x - halfWid, y));
        }
    }

    collision(ball) {
        let collide = false;
        if (ball.pos.x + ball.r > this.p1.x && ball.pos.x - ball.r < this.p2.x) {
            if (ball.pos.y + ball.r >= this.p1.y && ball.pos.y < this.p2.y) {
                // center of paddle
                let disp = ball.pos.x - this.p1.x;
                let angle = this.g.p.map(disp, -ball.r, this.width + ball.r, -Math.PI, 0);
                ball.vel.direction = angle;
                ball.pos.y = this.p1.y - ball.r;
                collide = true;
            }
        }
        return collide;
    }

    draw() {
        this.g.p.fill(255);
        this.g.p.noStroke();
        this.g.p.rect(this.x, this.y, this.width, this.height, this.g.gridSize / 4);
        this.g.p.fill(0);
        this.g.p.triangle(this.x + this.indicator.p1.x, this.y + this.indicator.p1.y, this.x + this.indicator.p2.x, this.y + this.indicator.p2.y, this.x + this.indicator.p3.x, this.y + this.indicator.p3.y);
    }

    reset() {
        this.translate(this.g.p.width / 2, this.p1.y);
    }
}


/**
 * 
 * System functions
 */

let game;

window.addEventListener('load', (evt) => {

    let isScriptAlreadyIncluded = (src) => {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++)
            if (scripts[i].getAttribute('src') == src) return true;
        return false;
    }

    let addP5IfNotPresent = () => {
        let scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.src = P5_LOCATION;
        scr.addEventListener('load', (evt) => {
            startGame();
        });
        document.head.appendChild(scr);
    }

    let startGame = () => {
        game = new p5(BRICK_GAME);
    }

    if (!isScriptAlreadyIncluded(P5_LOCATION)) {
        console.log('p5 not found, loading...');
        addP5IfNotPresent();
    }

});