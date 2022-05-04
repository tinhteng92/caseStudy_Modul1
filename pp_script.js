const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

// Tải âm thanh
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// Khai báo đối tượng bóng: Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "WHITE"
}

// Khai báo đối tượng thanh ngang người chơi: User Paddle
const user = {
    x: 0, // left side of canvas
    y: (canvas.height - 100) / 2, // -100 the height of paddle
    width: 10,
    height: 100,
    score: 0,
    color: "WHITE"
}

// Khai báo đối tượng thanh ngang máy tính: COM Paddle
const com = {
    x: canvas.width - 10, // - width of paddle
    y: (canvas.height - 100) / 2, // -100 the height of paddle
    width: 10,
    height: 100,
    score: 0,
    color: "WHITE"
}

// Khai báo đối tượng lưới: NET
const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "WHITE"
}
let maxScore = 10;
let isGameOver = false;
let isGameWin = false;

// Vẽ hình chữ nhật, được sử dụng làm thanh ngang
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Vẽ hình tròn, được dùng để vẽ bóng
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

// Vẽ lưới
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Vẽ phần điểm số
function drawText(text, x, y) {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

// Check va chạm
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

// Phương thức cập nhật, thực hiện tất cả các phép tính

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

    // Máy tính tự chơi và chúng ta phải có thể đánh bại nó
    // simple AI
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
        // Phát ra âm thanh
        hit.play();
        // Kiểm tra vị trí quả bóng chạm vào thanh dọc
        let collidePoint = (ball.y - (player.y + player.height / 2));
        // Chuẩn hóa giá trị của điểm va chạm, chúng ta cần lấy các số từ -1 và 1
        // -player.height/2 < điểm va chạm < player.height/2
        collidePoint = collidePoint / (player.height / 2);

        // Khi quả bóng chạm vào phần đầu của thanh dọc, chúng ta muốn bóng lấy một góc -45 độ
        // Khi quả bóng chạm vào phần giữa của của thanh dọc, chúng ta muốn bóng lấy một góc 0 độ
        // Khi quả bóng chạm vào đáy của thanh dọc, chúng ta muốn bóng lấy 1 góc 45 độ
        // Math.PI/4 = 45degrees
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

// Kiểm tra điều kiện kết thúc game
function checkGameOver(){
    if(com.score === 2){
        isGameOver = true;
        isGameWin = false;
    }else if(user.score === 2){
        isGameOver = true;
        isGameWin = true;
    }
}
// Hiển thị kết quả
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

    // Vẽ điểm số người chơi ở bên trái
    drawText(user.score, canvas.width / 4, canvas.height / 5);

    // Vẽ điểm số máy tính ở bên phải
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5);

    // Vẽ lưới
    drawNet();

    // Vẽ thanh dọc của người chơi
    drawRect(user.x, user.y, user.width, user.height, user.color);

    // Vẽ thanh dọc của máy tính
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // Vẽ bóng
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
