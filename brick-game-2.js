/**
 * Brick Game 2
 * By Connor Doman
 *
 * Started February 10, 2021
 *
 */
const P5_LOCATION = 'https://connordoman.com/res/p5/p5.js';

const DEBUG = true;


const brickGame = function (p) {

    const GRID_SIZE = 16;

    let paused;

    let ball;
    let brick;
    let brickSet;

    p.setup = () => {
        // p5 preparation
        let res = scaleResolution(9 * GRID_SIZE, 16 * GRID_SIZE);
        p.frameRate(30);
        let cnv = p.createCanvas(res.w, res.h);
        cnv.parent('gamearea');

        // Game objects
        screen = new Rectangle(new Vector(0, 0), p.width, p.height);
        ball = new Ball(p, p.width / 2, p.height / 2, 8);
        //brick = new Brick(p, 20 * GRID_SIZE, 20 * GRID_SIZE);
        brickSet = [];
        for (let i = 0; i < 10; i++) {
            brickSet.push(new Brick(p, (i * 2 * GRID_SIZE) + i, 0));
        }

        ball.setVelocity(new Vector(Math.PI, Math.random() * Math.PI * 2));

        paused = false;
    };

    p.draw = () => {
        p.background(0);
        p.rectMode(p.CENTER);
        p.ellipseMode(p.RADIUS);

        if (DEBUG) {
            drawGrid();
        }

        // update objects
        ball.update();
        //brick.update();
        //ball.collision(brick);
        ball.screenCollide();

        // draw objects
        ball.draw();
        //brick.draw();
        for (let i = 0; i < brickSet.length; i++) {
            let br = brickSet[i];
            if (!br.destroyed) {
                br.destroyed = ball.collision(br);
                br.draw();
            }
        }
    };

    p.keyTyped = () => {
        if (p.key === ' ') {
            paused = !paused;
        }

        if (paused) {
            p.noLoop();
        } else if (!paused) {
            p.loop();
        }
    };

    p.windowResized = () => {
        let res = scaleResolution(9 * GRID_SIZE, 16 * GRID_SIZE);
        p.resizeCanvas(res.w, res.h);
    };

    let scaleResolution = (unitsX, unitsY) => {
        let scrRatio = p.windowWidth / p.windowHeight;
        return scrRatio > unitsX / unitsY ? { w: unitsX * (p.windowHeight / unitsY), h: p.windowHeight } : { w: p.windowWidth, h: unitsY * (p.windowWidth / unitsX) };
    };

    let drawGrid = () => {
        // draw grid
        p.stroke(128);
        p.strokeWeight(1);
        for (let i = 0; i < p.height / GRID_SIZE; i++) {
            p.line(0, i * GRID_SIZE, p.width, i * GRID_SIZE);
            for (let j = 0; j < p.width / GRID_SIZE; j++) {
                p.line(j * GRID_SIZE, 0, j * GRID_SIZE, p.height);
            }
        }
    };
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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


    dot(a) {
        return a.x * this.x + a.y * this.y;
    }

    add(a) {
        return new Vector(a.x + this.x, a.y + this.y);
    }

    sub(a) {
        return new Vector(this.x - a.x, this.y - a.y);
    }

    mult(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    div(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    normalize() {
        return new Vector(this.x / this.magnitude, this.y / this.magnitude);
    }

    bounce(normal) {
        let tmp = normal.mult(-2 * this.dot(normal));
        return this.add(tmp);
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

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

class Rectangle {
    constructor(p1, width, height) {
        this.calculateData(p1, width, height);
    }

    setPosition(pos) {
        this.calculateData(pos, this.width, this.height);
    }

    calculateData(p1, width, height) {
        this.p1 = p1;
        this.p2 = new Vector(p1.x + width, p1.y + height);
        this.width = width;
        this.height = height;
        this.x = p1.x + width / 2;
        this.y = p1.y + height / 2;
        this.center = new Vector(this.x, this.y);
    }

    intersects(pt) {
        console.log(`Checking intersection: ${pt.toString()}`);
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
    constructor(par, x, y, r) {
        super(new Vector(x, y), r);
        this.par = par;
        this.vel = new Vector(0, 0);
        this.ts = 1;
        this.bounds = new Rectangle(this.pos, 2 * this.r, 8 * this.r);
    }

    update() {
        this.pos = this.pos.add(this.vel);

        if (this.par.millis() % 1000 < 20) {
            console.log(this.pos.toString());
        }

        this.bounds.setPosition(this.pos);
    }

    draw() {
        this.par.stroke(255);
        this.par.noFill();
        this.par.circle(this.pos.x, this.pos.y, this.r);

        if (DEBUG) {
            this.par.stroke('red');
            this.par.strokeWeight(2);
            this.par.point(this.pos.x, this.pos.y);
            this.par.rect(this.bounds.p1.x, this.bounds.p1.y, this.bounds.width, this.bounds.height);
        }
    }

    setVelocity(vec) {
        this.vel = new Vector(vec.x, vec.y);
    }

    screenCollide() {
        if (this.pos.x + this.r + this.vel.x >= this.par.width || this.pos.x - this.r + this.vel.x <= 0) {
            this.vel.x *= -1;
        }
        if (this.pos.y + this.r + this.vel.y >= this.par.height || this.pos.y - this.r + this.vel.y <= 0) {
            this.vel.y *= -1;
        }
    }

    collision(rect) {

        let colour = 'red';

        let collide = false;

        let nearX = Math.max(rect.p1.x, Math.min(this.pos.x, rect.p2.x));
        let nearY = Math.max(rect.p1.y, Math.min(this.pos.y, rect.p2.y));
        let dist = new Vector(nearY - this.pos.y, -(nearX - this.pos.x));

        let radius = new Vector(this.pos.y - nearY, this.pos.x - nearX);

        if (dist.magnitude <= this.r) {

            if (Math.abs(radius.y) === Math.abs(radius.x)) {
                // 45 degrees
                this.vel = this.vel.mult(-1);
                collide = true;
            } else if (radius.y === 0) {
                // top-bottom
                this.setVelocity(new Vector(this.vel.x, -this.vel.y));
                collide = true;
            } else if (radius.x === 0) {
                // left-right
                this.setVelocity(new Vector(-this.vel.x, this.vel.y));
                collide = true;
            } else {
                // corners
                let normal = new Vector(-dist.y, dist.x).normalize();
                this.setVelocity(this.vel.bounce(normal));
                collide = true;
            }

            let distToMove = this.r - radius.magnitude;

            let theta = this.pos.angle(radius);
            this.pos.x += Math.cos(theta) * distToMove;
            this.pos.y += Math.sin(theta) * distToMove;
        }

        if (DEBUG) {
            this.par.stroke(colour);
            this.par.strokeWeight(1);
            this.par.line(this.pos.x, this.pos.y, nearX, nearY);
        }

        return collide;
    }
}

class Brick extends Rectangle {
    constructor(par, x, y) {
        super(new Vector(x, y), 32, 16);
        this.par = par;
        this.destroyed = false;
    }

    update() {
        let p = new Vector(this.par.mouseX, this.par.mouseY);
        this.calculateData(new Vector(p.x - this.width / 2, p.y - this.height / 2), this.width, this.height);
    }

    draw() {
        this.par.strokeWeight(1);
        this.par.stroke(255);
        this.par.noFill();
        this.par.rect(this.x, this.y, this.width, this.height);

        if (DEBUG) {
            this.par.stroke('red');
            this.par.strokeWeight(2);
            this.par.point(this.x, this.y);
        }
    }
}

class BrickGroup {
    constructor(num) {
        this.bricks = new Array(num);
    }

    get size() {
        return this.bricks.length;
    }

    add(brick) {
        this.bricks.push(brick);
    }

    get(index) {
        if (0 < index && index < this.bricks.length) {
            return this.bricks[index];
        }
        return false;
    }

    remove(brick) {
        let index = this.bricks.indexOf(brick);
        if (index > -1) {
            this.bricks.splice(index, 1);
        }
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
        game = new p5(brickGame);
    }

    if (!isScriptAlreadyIncluded(P5_LOCATION)) {
        console.log('p5 not found, loading...');
        addP5IfNotPresent();
    }

});