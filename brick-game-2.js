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

    let ball;
    let brick;

    p.setup = () => {
        p.createCanvas(400, 400);

        // Game objects
        ball = new Ball(p, p.width / 5, p.height / 4, 16);
        brick = new Brick(p, 200, 200);

        ball.setVelocity(1, 1);
    };

    p.draw = () => {
        p.background(0);
        p.rectMode(p.CENTER);
        p.ellipseMode(p.CENTER);

        // draw grid
        p.stroke(128);
        p.strokeWeight(1);
        for (let i = 0; i < p.height / GRID_SIZE; i++) {
            p.line(0, i * GRID_SIZE, p.width, i * GRID_SIZE);
            for (let j = 0; j < p.width / GRID_SIZE; j++) {
                p.line(j * GRID_SIZE, 0, j * GRID_SIZE, p.height);
            }
        }


        // update objects
        ball.update();
        brick.update();
        ball.collision(brick);

        // draw objects
        ball.draw();
        brick.draw();
    };

    p.keyTyped = () => {
        if (p.key === ' ') {
            p.noLoop();
        }
    };
}


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    setCoords(x, y) {
        this.x = x;
        this.y = y;
    }

    dist(pt) {
        let dx = this.x - pt.x;
        let dy = this.y - pt.y;

        return Math.sqrt((dx * dx) + (dy * dy));
    }
}

class Rectangle {
    constructor(p1, width, height) {
        this.calculateData(p1, width, height);
    }

    calculateData(p1, width, height) {
        this.p1 = p1;
        this.p2 = new Point(p1.x + width, p1.y + height);
        this.width = width;
        this.height = height;
        this.x = p1.x + width / 2;
        this.y = p1.y + height / 2;
    }

    intersects(pt) {
        if (pt.x > this.pos.x ||
            pt.x < this.pos.x + this.width ||
            pt.y > this.pos.y ||
            pt.y < this.pos.y + this.height) {
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

        let p1 = new Point(x1, y1);
        let p2 = new Point(x2, y2);
        let p3 = new Point(x3, y3);
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
        super(new Point(x, y), r);
        this.par = par;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        this.pos.x += this.vx;
        this.pos.y += this.vy;
        if (this.pos.x - this.r + this.vx < 0 || this.pos.x + this.r + this.vx > this.par.width) {
            this.setVelocity(-this.vx, this.vy);
        }
        if (this.pos.y - this.r + this.vy < 0 || this.pos.y + this.r + this.vy > this.par.height) {
            this.setVelocity(this.vx, -this.vy);
        }
    }

    draw() {
        this.par.noStroke();
        this.par.fill(255);
        this.par.circle(this.pos.x, this.pos.y, this.r);

        if (DEBUG) {
            this.par.stroke('red');
            this.par.point(this.pos.x, this.pos.y);
        }
    }

    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    collision(rect) {

        let colour = 'red';

        let rectHypo = rect.p1.dist(new Point(rect.x, rect.y));

        let nearX = Math.max(rect.p1.x, Math.min(this.pos.x, rect.p2.x));
        let nearY = Math.max(rect.p1.y, Math.min(this.pos.y, rect.p2.y));

        let corner = false;

        if (this.pos.dist(new Point(rect.x, rect.y)) < this.r + rectHypo) {
            corner = false;
        } else if (this.pos.dist(new Point(nearX, nearY)) <= this.r) {
            corner = true;
            colour = 'green';
        }

        if (corner) {

            // the long way
            let corner = false;
            let theta = Math.atan2(this.vy, this.vx);
            let reflectVector = new Point(1, 1);
            let piOver4 = Math.PI / 4;
            if (this.pos.x < rect.p1.x && this.pos.y < rect.p1.y) {
                // top left
                if (theta == piOver4) {
                    this.setVelocity(-this.vx, -this.vy);
                } else if (theta < piOver4) {
                    this.setVelocity(-this.vy, this.vx);
                } else if (theta > piOver4) {
                    this.setVelocity(this.vy, -this.vx);
                }
            } else if (this.pos.x > rect.p2.x && this.pos.y < rect.p1.y) {
                // top right
                if (theta == piOver4) {
                    this.setVelocity(-this.vx, -this.vy);
                } else if (theta < piOver4) {
                    this.setVelocity(-this.vy, -this.vx);
                } else if (theta > piOver4) {
                    this.setVelocity(this.vy, this.vx);
                }
            } else if (this.pos.x < rect.p1.x && this.pos.y > rect.p2.y) {
                // bottom left
                if (theta == piOver4) {
                    this.setVelocity(-this.vx, -this.vy);
                } else if (theta < piOver4) {
                    this.setVelocity(this.vy, -this.vx);
                } else if (theta > piOver4) {
                    this.setVelocity(-this.vy, this.vx);
                }
            } else if (this.pos.x > rect.p1.x && this.pos.y < rect.p2.y) {
                // bottom right
                if (theta == piOver4) {
                    this.setVelocity(-this.vx, -this.vy);
                } else if (theta < piOver4) {
                    this.setVelocity(-this.vy, this.vx);
                } else if (theta > piOver4) {
                    this.setVelocity(this.vy, -this.vx);
                }
            }

        } else if (!corner) {
        }


        /*if (collide) {
            console.log('collision');
            let c = -2 * (this.vx * nearX + this.vy * nearY) / (nearX * nearX + nearY * nearY);
            this.setVelocity(this.vx + (c * nearX), this.vy + (c * nearY));
        }*/

        if (DEBUG) {
            this.par.stroke(colour);
            this.par.line(this.pos.x, this.pos.y, nearX, nearY);
        }
        return corner;
    }
}

class Brick extends Rectangle {
    constructor(par, x, y) {
        super(new Point(x, y), 32, 16);
        this.par = par;
    }

    update() {
        let p = new Point(this.par.mouseX, this.par.mouseY);
        this.calculateData(new Point(p.x - this.width / 2, p.y - this.height / 2), this.width, this.height);
    }

    draw() {
        this.par.noStroke();
        this.par.fill(255);
        this.par.rect(this.x, this.y, this.width, this.height);

        if (DEBUG) {
            this.par.stroke('red');
            this.par.strokeWeight(2);
            this.par.point(this.x, this.y);
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