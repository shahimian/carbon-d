var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
ctx.fillStyle = "#4a535f";
var w = canvas.width;
var h = canvas.height;
var player = {
    state: ["stand", "running-right", "running-left", "ready-to-gun", "gunning", "gun2"],
    set: "stand"
};
var enemy = {
    state: ["wired-bird", "explosion"],
    set: undefined
}
var stand = imagePack(4, "stand", w * 0.33 * 0.33, h * 0.66, player);
var runningRight = imagePack(14, "running-right", undefined, undefined, player);
var runningLeft = imagePack(14, "running-left", undefined, undefined, player);
var readyToGun = imagePack(8, "ready-to-gun", undefined, undefined, player);
var gunning = imagePack(4, "gunning", undefined, undefined, player);
var gun2 = imagePack(14, "gun2", undefined, undefined, player);
var wiredBird = imagePack(4, "wired-bird", w * 0.33, h * 0.66 + 20, enemy);
var explosion = imagePack(24, "explosion", enemy);
var bg = new Image();
bg.src = "./spirites/bg.png";
var movePlayer, moveEnemy;
function imagePack(duration, spirite, x, y, relative){
    var frame = [];
    for(var i = 1; i <= duration; i++){
        frame[i] = new Image();
        frame[i].src = `./spirites/${spirite}/frame${i}.png`;
    }
    return {
        spirite: spirite,
        animate: frame,
        duration: duration,
        x: x || undefined,
        y: y || undefined,
        width: frame[1].width,
        height: frame[1].height,
        relative: relative
    }
}

var frame = 0;
var x = stand.x;
var y = stand.y;
var xEnemy, yEnemy;
var jump;
var isJump = false;
var stepJump = 15;
var xBg1 = -bg.width / 2;
var xBg2 = bg.width / 2;
var heightPlayer = 110;
function Floor(meter, x0, y0){
    var startFloor = new Image();
    startFloor.src = './spirites/floor/start.png';
    var floor = new Image();
    floor.src = './spirites/floor/floor.png';
    var finishFloor = new Image();
    finishFloor.src = './spirites/floor/finish.png';
    var t = x0;
    ctx.drawImage(startFloor, t, y0);
    t += startFloor.width;
    for(var i = 0; i < meter; i++){
        ctx.drawImage(floor, t, y0);
        t += floor.width;
    }
    ctx.drawImage(finishFloor, t, y0);
    t += floor.width;
}
var x0 = stand.x;
var y0 = stand.y + heightPlayer;
function animate(){
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(bg, 0, 0, bg.width, bg.height);
    Floor(5, x0, y0);
    Floor(15, x0 + 500, y0);
    switch(player.set){
        case "stand":
            movePlayer = stand.animate[(frame % stand.duration) + 1];
            break;
        case "running-right":
            movePlayer = runningRight.animate[(frame % runningRight.duration) + 1];
            break;
        case "running-left":
            movePlayer = runningLeft.animate[(frame % runningLeft.duration) + 1];
            break; 
        case "ready-to-gun":
            movePlayer = readyToGun.animate[(frame % readyToGun.duration) + 1];
            if(readyToGun[readyToGun.duration - 1] == movePlayer.animate[readyToGun.duration - 1]){ // the latest frame of ready to gun
                player.set = "gunning";
            }
            break;
        case "gunning":
            movePlayer = gunning.animate[(frame % gunning.duration) + 1];
            break;
        case "jump":
            if(Math.abs(y - jump) <= 200){
                y -= stepJump;
            } else {
                player.set = "landing";
            }
            break;
        case "landing":
            if(Math.abs(y - jump) > 0){
                y += stepJump;
            } else {
                isJump = false;
            }
            break;
    }
    switch(enemy.set){
        case "explosion":
            moveEnemy = explosion.animate[frame % explosion.duration + 1];
            xEnemy = explosion.x;
            yEnemy = explosion.y;
            if(explosion[explosion.duration - 1] == moveEnemy.animate[explosion.duration - 1]){
                enemy.set = undefined;
            }
            break;
    }
    if(player.set == "jump" || player.set == "landing")
        movePlayer = stand.animate[frame % stand.duration + 1];
    ctx.drawImage(movePlayer, x, y);
    if(enemy.set)
        ctx.drawImage(moveEnemy, xEnemy, yEnemy);
    if(player.set == "gunning"){
        gun2.x = x;
        gun2.y = y - 34;
        ctx.drawImage(gun2.animate[(frame % gun2.duration) + 1], gun2.x, gun2.y);
    }
    if(isTest(wiredBird, gun2)){
        enemy.set = "explosion";
        explosion.x = wiredBird.x;
        explosion.y = wiredBird.y;
        delete wiredBird;
    } else {
        ctx.drawImage(wiredBird.animate[frame % wiredBird.duration + 1], wiredBird.x, wiredBird.y);
    }
    frame++;
    requestAnimationFrame(animate);
}

animate();

document.body.addEventListener("keyup", function(){
    if(isJump){
        player.set = "landing";
    } else {
        player.set = "stand";
    }
})

document.body.addEventListener("keydown", function(e){
    switch(e.key){
        case 'ArrowRight':
            x += 15;
            player.set = "running-right";
            break;
        case 'ArrowLeft':
            x -= 15;
            player.set = "running-left";
            break;
        case "ArrowUp":
            if(!isJump){
                player.set = "jump";
                jump = y;
                isJump = true;
            }
            break;
        case 'x':
            player.set = "ready-to-gun";
            break;
    }
    console.log(e.key);
})

function isTest(element1, element2){
    return p(element1.x - element1.width, element1.y - element1.height) >= p(element2.x - element2.width, element2.y - element2.height); 
}

function p(x, y){
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}