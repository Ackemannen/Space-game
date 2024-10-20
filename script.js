const FPS = 30; // Frames per second
const shipSize = 30; // Height of the ship
const turnSpeed = 360; // Speed of turning in degrees per second
const shipThrust = 5; // Speed of the ship (accelerating)
const friction = 0.7; // Friction of space
const roidsSize = 100; // Size of asteroid
const roidsSpeed = 50; // Top speed of asteroids
const roidsVert = 10; // average number of sides of asteroids
const roidsJag = 0.2; // jaggedmess of asteroid (0 = none, 1 = lots)
const showBounding = false; // Bollean to show collision bounding
const showCenterDot = false; // Boolean to show center of ship or not
const shipExploteDur = 0.3; // Duration of ships explotion
const shipInvDur = 3; // Duration of ship invincibility
const shipBlinkDur = 0.1; // Duration between ship blinking during invincibility
const laserMax = 10; // Max number of lasers at one time
const laserSpeed = 500; // Laser speed in pixles per second
const laserExplodeDur = 0.2; // Duration of laser explotion
const textFadeTime = 2.5; // Text fade time
const textSize = 40; // Text font height¨
const gameLives = 3; // Number of player lives



let roidsNum = 3; // Number of asteroids at the start

/** @type {HTMLCanvasElement} */
let canv = document.getElementById("gameOutput");
let ctx = canv.getContext("2d");

// Setting up game parameters
let level, lives, roids, ship, text, textAlpha;
newGame();



// Set up eventhandler
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Set up the game loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    roids = [];
    let x, y;
    for (let i = 0; i < roidsNum + level; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < roidsSize * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 2)));
    }
}

function destroyAsteroid(index) {
    let x = roids[index].x;
    let y = roids[index].y;
    let r = roids[index].r;

    // Split in two if it needs to
    if (r == Math.ceil(roidsSize / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 4)));
    } else if (r == Math.ceil(roidsSize / 4)) {
        roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 8)))
        roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 8)))
    }

    // Destroy the asteroid
    roids.splice(index, 1);

    // Check when level is completed
    if (roids.length == 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, color = "white") {
    ctx.strokeStyle = color;
            ctx.lineWidth = shipSize / 20;
            ctx.beginPath();
            ctx.moveTo( // Front of ship
                x + 4 / 3 * ship.r * Math.cos(a),
                y - 4 / 3 * ship.r * Math.sin(a)
            );
            ctx.lineTo( // Back left of ship
                x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
                y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
            )
            ctx.lineTo( // Back right of ship
                x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
                y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
            )
            ctx.closePath();
            ctx.stroke();
}

function keyDown(event) {
    if (ship.dead) {
        return;
    }

    switch(event.key) {
        case " ": // Space will shoot a laser
            shootLaser();
            break;
        case "ArrowLeft": // Left arrow will rotate ship left
            ship.rot = turnSpeed / 180 * Math.PI / FPS;
            break;
        case "ArrowUp": // Up arrow will thrust ship
            ship.thrusting = true;
            break;
        case "ArrowRight": // Right arriw will rotate ship right
            ship.rot = -turnSpeed / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(event) {
    if (ship.dead) {
        return;
    }

    switch(event.key) {
        case " ": // Space will allow shooting again
            ship.canShoot = true;
            break;
        case "ArrowLeft": // Left arrow will stop rotate ship left
            ship.rot = 0;
            break;
        case "ArrowUp": // Up arrow will stop thrust ship
            ship.thrusting = false
            break;
        case "ArrowRight": // Right arriw will stop rotate ship right
            ship.rot = 0;
            break;
    }
}

function newGame() {
    // Space ship object
    ship = newShip();
    lives = gameLives;
    level = 0;
    newLevel();
}

function newLevel() {
    text = "Level " + (level + 1);
    textAlpha = 1.0;

    // Creating asteroids
    createAsteroidBelt();

}

function explodeShip() {
    ship.explodeTime = Math.ceil(shipExploteDur * FPS);
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: shipSize / 2,
        a: 90 / 180 * Math.PI, // Converted into radians
        rot: 0,
        thrusting: false,
        blinkTime: Math.ceil(shipBlinkDur * FPS),
        blinkNum: Math.ceil(shipInvDur / shipBlinkDur),
        explodeTime: 0,
        canShoot: true,
        lasers: [],
        dead: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    // Create the laser
    if (ship.canShoot && ship.lasers.length < laserMax) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laserSpeed * Math.cos(ship.a) / FPS,
            yv: -laserSpeed * Math.sin(ship.a) / FPS,
            explodeTime : 0
        })
    }

    // Stop it from shooting more than once a press
}

function newAsteroid(x, y, r) {
    let levelMult = 1 + 0.1 * level;
    let roid = {
        x: x,
        y: y,
        r: r,
        xv: Math.random() * roidsSpeed * levelMult / FPS * (Math.random() < 0.5 ? 1: -1),
        yv: Math.random() * roidsSpeed * levelMult / FPS * (Math.random() < 0.5 ? 1: -1),
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (roidsVert + 1) + roidsVert / 2),
        offs: []
    };

    // create the vertex offset array
    for (let i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * roidsJag * 2 + 1 - roidsJag)
    }

    return roid;
}

function update() {
    let exploding = ship.explodeTime > 0;
    let blinkOn = ship.blinkNum % 2 == 0;

    //draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // Thrust ship
    if(ship.thrusting && !ship.dead) {
        ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;

        // add thrust effect
        if (!exploding && blinkOn) {
            ctx.fillStyle = "red"
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = shipSize / 10;
            ctx.beginPath();
            ctx.moveTo( // Back left of ship Front of ship
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo( // Centre behind ship
                ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
            )
            ctx.lineTo( // Back right of ship
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            )
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

    } else {
        ship.thrust.x -= friction * ship.thrust.x / FPS;
        ship.thrust.y -= friction * ship.thrust.y / FPS;
    }

    //draw ship
    if (!exploding) {
        if (blinkOn && !ship.dead) {
            drawShip(ship.x, ship.y, ship.a);
        } // end of blinkOn check

        if (ship.blinkNum > 0) {

            // Reduce blink time
            ship.blinkTime--;

            // Reduce blink number
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(shipBlinkDur * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        // Draw explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // Show the outline of ship
    if (showBounding) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // Draw asteroids
    let x, y, r, a, vert, offs;
    for (let i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "grey";
        ctx.lineWidth = shipSize / 20;

        // Getting asteroid properties
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offs = roids[i].offs;

        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        if (showBounding) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    // Show the center of ship
    if (showCenterDot) {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    // Drawing lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "cyan";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // Draw explosion
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "lightblue";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
        
    }

    // Draw game text
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + textSize + "px dejavu sans mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / textFadeTime / FPS);
    } else if (ship.dead) {
        newGame();
    }

    // Draw lives
    let lifeColor;
    for (let i = 0; i < lives; i++) {
        lifeColor = exploding && i == lives - 1 ? "red" : "white";
        drawShip(shipSize + i * shipSize * 1.2, shipSize, 0.5 * Math.PI, lifeColor);
    }

    // Check if laser hits asteroid
    let ax, ay, ar, lx, ly;
    for (let i = roids.length - 1; i >= 0; i--) {

        // Asteroid properties
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;

        // Loop the lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {

            // Laser properties
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // Detect hit
            if (distBetweenPoints(ax, ay, lx, ly) < ar && ship.lasers[j].explodeTime == 0) {

                // Destroy asteroid and explode laser
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(laserExplodeDur * FPS);

                break;
            }
        }
    }

    // Asteroid Collisions
    if (!exploding) {
        if (ship.blinkNum == 0 && !ship.dead) {
            for (let i = 0; i < roids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        //move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        //rotate ship
        ship.a += ship.rot;
    } else {
        ship.explodeTime--;

        if (ship.explodeTime == 0) {
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

    // handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    } else if (ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r;
    }

    // Laser Movement
    for (let i = 0; i < ship.lasers.length; i++) {

        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // Destroy Laser after explode time
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;
        }

        // Reload laser when off screen
        if (ship.lasers[i].x < 0) {
            ship.lasers.splice(i, 1);
        } else if (ship.lasers[i].x > canv.width) {
            ship.lasers.splice(i, 1);
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers.splice(i, 1);
        } else if (ship.lasers[i].y > canv.height) {
            ship.lasers.splice(i, 1);
        }
    }

    // Asteroid movement
    for (let i = 0; i < roids.length; i++) {
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;

        // fix asteroids disappearing off screen
        if (roids[i].x < 0 - roids[i].r) {
            roids[i].x = canv.width + roids[i].r;
        } else if (roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r;
        }
        if (roids[i].y < 0 - roids[i].r) {
            roids[i].y = canv.height + roids[i].r;
        } else if (roids[i].y > canv.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r;
        }
    }

}