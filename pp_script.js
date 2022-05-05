const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";


const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "WHITE"
}


const user = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "WHITE"
}


const com = {
    x: canvas.width - 10,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "WHITE"
}


const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "WHITE"
}

let maxScore = 2;
let isGameOver = false;
let isGameWin = false;


function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}


function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}
// Sự kiện di chuột
canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();

    user.y = evt.clientY - rect.top - user.height / 2;
}

// Khi máy tính hoặc người chơi ghi điểm, chúng ta reset lại bóng
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function drawText(text, x, y) {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

// Kiểm tra va chạm
function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// Hàm cập nhật, thực hiện tất cả các phép tính

function update() {

    // Cập nhật điểm số của người chơi, nếu bóng đi về phía bên trái "ball.x < 0" máy tính thắng, hoặc "ball.x > canvas.width" người chơi thắng
    if (ball.x - ball.radius < 0) {
        com.score++;
        comScore.play();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        userScore.play();
        resetBall();
    }

    // Vận tốc của bóng
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Máy tính tự chơi và chúng ta phải đánh bại nó
    // AI đơn giản
    com.y += ((ball.y - (com.y + com.height / 2))) * 0.1;

    // Khi quả bóng va chạm vào phía trên hoặc phía dưới bức tường, ta phải nghịch chuyển vận tốc y
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }

    // Kiểm tra xem bóng đập vào thanh dọc của người chơi hay của máy tính
    let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;

    // Nếu bóng chạm vào một thanh dọc
    if (collision(ball, player)) {
        hit.play();
        let collidePoint = (ball.y - (player.y + player.height / 2));
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;

        // Thay đổi hướng vận tốc X và Y
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Tăng tốc bóng mỗi khi thanh dọc chạm vào nó
        ball.speed += 0.5;
    }
}
// Kiểm tra điều kiện để dừng vòng lặp game
function endGame() {
    if (isGameOver === true)
        clearInterval(loop);
}


function checkGameOver(){
    if(com.score === 2){
        isGameOver = true;
        isGameWin = false;
    }else if(user.score === 2){
        isGameOver = true;
        isGameWin = true;
    }
}

function handleGameOver() {
    if (isGameWin) {
        alert('YOU WIN');
    } else {
        alert('YOU LOSE');
    }
}

// Thực hiện các hàm vẽ
function render() {

    // Xóa canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000");

    drawText(user.score, canvas.width / 4, canvas.height / 5);

    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5);

    drawNet();

    drawRect(user.x, user.y, user.width, user.height, user.color);

    drawRect(com.x, com.y, com.width, com.height, com.color);

    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

function game() {
    if (!isGameOver) {
        update();
        checkGameOver();
        render();
    } else {
        handleGameOver();
        endGame();
    }

}

// Số khung hình mỗi giây
let framePerSecond = 50;

//Gọi hàm trò chơi 50 lần mỗi giây
let loop = setInterval(game, 1000 / framePerSecond);
