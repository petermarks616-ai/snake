// 游戏变量
let canvas, ctx;
let gridSize = 20;
let tileCount = 20;
let snake = [];
let apple = {x: 10, y: 10};
let bigApple = null;
let direction = {x: 0, y: 0};
let nextDirection = {x: 0, y: 0};
let score = 0;
let appleCount = 0;
let gameSpeed = 8; // 帧数
let gameRunning = false;
let gameLoop;
let lastRenderTime = 0;
let gameTime = 0;
let gameStartTime = 0;
let bigAppleTimer = 0;
let bigAppleActive = false;
let highScores = [];

// DOM元素
const menuPage = document.getElementById('menu-page');
const gamePage = document.getElementById('game-page');
const startGameBtn = document.getElementById('start-game');
const showScoresBtn = document.getElementById('show-scores');
const backToMenuBtn = document.getElementById('back-to-menu');
const returnToMenuBtn = document.getElementById('return-to-menu');
const closeScoresBtn = document.getElementById('close-scores');
const closeScoresBtn2 = document.getElementById('close-scores-btn');
const highScoresModal = document.getElementById('high-scores-modal');
const currentScoreEl = document.getElementById('current-score');
const appleCountEl = document.getElementById('apple-count');
const gameTimeEl = document.getElementById('game-time');
const finalScoreEl = document.getElementById('final-score');
const finalApplesEl = document.getElementById('final-apples');
const finalTimeEl = document.getElementById('final-time');
const bigAppleIndicator = document.getElementById('big-apple-indicator');
const bigAppleTimerEl = document.getElementById('big-apple-timer');
const bigAppleTimeEl = document.getElementById('big-apple-time');
const timerProgress = document.getElementById('timer-progress');
const scoresContainer = document.getElementById('scores-container');

// 方向控制按钮
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// 初始化游戏
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 从本地存储加载最高分
    loadHighScores();
    
    // 设置事件监听器
    startGameBtn.addEventListener('click', startGame);
    showScoresBtn.addEventListener('click', showHighScores);
    backToMenuBtn.addEventListener('click', goToMenu);
    returnToMenuBtn.addEventListener('click', goToMenu);
    closeScoresBtn.addEventListener('click', closeHighScores);
    closeScoresBtn2.addEventListener('click', closeHighScores);
    
    // 方向控制按钮事件
    upBtn.addEventListener('click', () => changeDirection(0, -1));
    downBtn.addEventListener('click', () => changeDirection(0, 1));
    leftBtn.addEventListener('click', () => changeDirection(-1, 0));
    rightBtn.addEventListener('click', () => changeDirection(1, 0));
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);
    
    // 确保游戏页面尺寸正确
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// 调整画布大小
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    
    // 保持画布比例，适应容器
    const size = Math.min(containerWidth - 40, 400);
    canvas.width = size;
    canvas.height = size;
    
    // 重新计算网格大小
    gridSize = canvas.width / tileCount;
}

// 加载最高分
function loadHighScores() {
    const savedScores = localStorage.getItem('snakeHighScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    } else {
        // 默认最高分
        highScores = [
            {score: 120, apples: 25, date: '2023-10-01'},
            {score: 95, apples: 20, date: '2023-10-05'},
            {score: 80, apples: 18, date: '2023-10-10'},
            {score: 65, apples: 15, date: '2023-10-12'},
            {score: 50, apples: 12, date: '2023-10-15'}
        ];
        saveHighScores();
    }
    updateScoresDisplay();
}

// 保存最高分
function saveHighScores() {
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
}

// 更新分数显示
function updateScoresDisplay() {
    scoresContainer.innerHTML = '';
    
    highScores.forEach((scoreData, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        
        scoreItem.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="score-value">${scoreData.score}</div>
            <div class="score-apples">${scoreData.apples}</div>
            <div class="score-date">${scoreData.date}</div>
        `;
        
        scoresContainer.appendChild(scoreItem);
    });
}

// 检查是否进入最高分
function checkHighScore() {
    const newScore = {score, apples: appleCount, date: new Date().toISOString().split('T')[0]};
    
    // 添加新分数并排序
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    
    // 只保留前5名
    if (highScores.length > 5) {
        highScores = highScores.slice(0, 5);
    }
    
    saveHighScores();
    updateScoresDisplay();
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    apple = getRandomApplePosition();
    bigApple = null;
    bigAppleActive = false;
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    appleCount = 0;
    gameTime = 0;
    gameStartTime = Date.now();
    bigAppleTimer = 0;
    
    // 更新UI
    currentScoreEl.textContent = score;
    appleCountEl.textContent = appleCount;
    gameTimeEl.textContent = gameTime;
    
    // 隐藏大苹果指示器
    bigAppleIndicator.classList.add('hidden');
    bigAppleTimerEl.classList.add('hidden');
    
    // 切换到游戏页面
    menuPage.classList.remove('active');
    gamePage.classList.add('active');
    
    // 开始游戏循环
    gameRunning = true;
    gameLoop = requestAnimationFrame(update);
}

// 返回菜单
function goToMenu() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    
    // 隐藏游戏结束弹窗
    document.getElementById('game-over').classList.add('hidden');
    
    // 切换到菜单页面
    gamePage.classList.remove('active');
    menuPage.classList.add('active');
}

// 显示最高分
function showHighScores() {
    highScoresModal.classList.remove('hidden');
}

// 关闭最高分
function closeHighScores() {
    highScoresModal.classList.add('hidden');
}

// 处理键盘输入
function handleKeyDown(e) {
    // 防止页面滚动
    if ([37, 38, 39, 40, 32].includes(e.keyCode)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowUp':
            changeDirection(0, -1);
            break;
        case 'ArrowDown':
            changeDirection(0, 1);
            break;
        case 'ArrowLeft':
            changeDirection(-1, 0);
            break;
        case 'ArrowRight':
            changeDirection(1, 0);
            break;
        case ' ':
            if (!gameRunning) {
                startGame();
            }
            break;
    }
}

// 改变方向
function changeDirection(x, y) {
    // 防止直接反向移动
    if ((x !== -direction.x || y !== -direction.y) && 
        (x !== direction.x || y !== direction.y)) {
        nextDirection = {x, y};
    }
}

// 获取随机苹果位置
function getRandomApplePosition() {
    let newApple;
    let onSnake;
    
    do {
        newApple = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        onSnake = snake.some(segment => 
            segment.x === newApple.x && segment.y === newApple.y
        );
        
        // 检查是否与大苹果位置冲突
        if (bigApple) {
            onSnake = onSnake || (newApple.x === bigApple.x && newApple.y === bigApple.y);
        }
    } while (onSnake);
    
    return newApple;
}

// 生成大苹果
function spawnBigApple() {
    if (bigAppleActive) return;
    
    bigApple = getRandomApplePosition();
    bigAppleActive = true;
    bigAppleTimer = 10; // 10秒限时
    
    // 显示大苹果指示器
    bigAppleIndicator.classList.remove('hidden');
    bigAppleTimerEl.classList.remove('hidden');
    timerProgress.style.width = '100%';
    bigAppleTimeEl.textContent = bigAppleTimer;
}

// 更新大苹果计时器
function updateBigAppleTimer(deltaTime) {
    if (!bigAppleActive) return;
    
    bigAppleTimer -= deltaTime;
    
    if (bigAppleTimer <= 0) {
        // 大苹果消失
        bigApple = null;
        bigAppleActive = false;
        bigAppleIndicator.classList.add('hidden');
        bigAppleTimerEl.classList.add('hidden');
    } else {
        // 更新UI
        bigAppleTimeEl.textContent = Math.ceil(bigAppleTimer);
        timerProgress.style.width = `${(bigAppleTimer / 10) * 100}%`;
    }
}

// 游戏更新循环
function update(currentTime) {
    if (!gameRunning) return;
    
    // 计算时间增量
    const deltaTime = (currentTime - lastRenderTime) / 1000;
    lastRenderTime = currentTime;
    
    // 更新游戏时间
    gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    gameTimeEl.textContent = gameTime;
    
    // 更新大苹果计时器
    updateBigAppleTimer(deltaTime);
    
    // 控制游戏速度
    const speedDelay = 1 / gameSpeed;
    
    // 使用requestAnimationFrame的时间来控制游戏速度
    if (deltaTime < speedDelay) {
        gameLoop = requestAnimationFrame(update);
        return;
    }
    
    // 应用方向改变
    direction = {...nextDirection};
    
    // 移动蛇
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // 检查自我碰撞
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到小苹果
    if (head.x === apple.x && head.y === apple.y) {
        // 增加分数
        score += 1;
        appleCount += 1;
        currentScoreEl.textContent = score;
        appleCountEl.textContent = appleCount;
        
        // 生成新苹果
        apple = getRandomApplePosition();
        
        // 每吃5个苹果，生成一个大苹果
        if (appleCount % 5 === 0) {
            spawnBigApple();
        }
    } 
    // 检查是否吃到大苹果
    else if (bigApple && head.x === bigApple.x && head.y === bigApple.y) {
        // 增加分数
        score += 10;
        currentScoreEl.textContent = score;
        
        // 移除大苹果
        bigApple = null;
        bigAppleActive = false;
        bigAppleIndicator.classList.add('hidden');
        bigAppleTimerEl.classList.add('hidden');
        
        // 生成新苹果
        apple = getRandomApplePosition();
    } 
    // 没吃到苹果，移除尾部
    else {
        snake.pop();
    }
    
    // 绘制游戏
    draw();
    
    // 继续游戏循环
    gameLoop = requestAnimationFrame(update);
}

// 绘制游戏
function draw() {
    // 清除画布
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头
        if (index === 0) {
            ctx.fillStyle = '#4ecca3';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // 蛇头眼睛
            ctx.fillStyle = '#000';
            const eyeSize = gridSize / 5;
            
            // 根据方向绘制眼睛
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            
            if (direction.x === 1) { // 向右
                leftEyeX = segment.x * gridSize + gridSize - eyeSize;
                leftEyeY = segment.y * gridSize + eyeSize * 2;
                rightEyeX = segment.x * gridSize + gridSize - eyeSize;
                rightEyeY = segment.y * gridSize + gridSize - eyeSize * 3;
            } else if (direction.x === -1) { // 向左
                leftEyeX = segment.x * gridSize + eyeSize;
                leftEyeY = segment.y * gridSize + eyeSize * 2;
                rightEyeX = segment.x * gridSize + eyeSize;
                rightEyeY = segment.y * gridSize + gridSize - eyeSize * 3;
            } else if (direction.y === 1) { // 向下
                leftEyeX = segment.x * gridSize + eyeSize * 2;
                leftEyeY = segment.y * gridSize + gridSize - eyeSize;
                rightEyeX = segment.x * gridSize + gridSize - eyeSize * 3;
                rightEyeY = segment.y * gridSize + gridSize - eyeSize;
            } else { // 向上
                leftEyeX = segment.x * gridSize + eyeSize * 2;
                leftEyeY = segment.y * gridSize + eyeSize;
                rightEyeX = segment.x * gridSize + gridSize - eyeSize * 3;
                rightEyeY = segment.y * gridSize + eyeSize;
            }
            
            ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
            ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        } 
        // 蛇身
        else {
            ctx.fillStyle = index % 2 === 0 ? '#4ecca3' : '#00adb5';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // 蛇身内部图案
            ctx.fillStyle = '#0f3460';
            const innerSize = gridSize / 3;
            ctx.fillRect(
                segment.x * gridSize + innerSize, 
                segment.y * gridSize + innerSize, 
                innerSize, 
                innerSize
            );
        }
    });
    
    // 绘制小苹果
    ctx.fillStyle = '#ff6f3c';
    ctx.beginPath();
    ctx.arc(
        apple.x * gridSize + gridSize / 2,
        apple.y * gridSize + gridSize / 2,
        gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 苹果茎
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(
        apple.x * gridSize + gridSize / 2 - gridSize / 10,
        apple.y * gridSize,
        gridSize / 5,
        gridSize / 3
    );
    
    // 绘制大苹果（如果存在）
    if (bigApple) {
        ctx.fillStyle = '#ff9a3c';
        ctx.beginPath();
        ctx.arc(
            bigApple.x * gridSize + gridSize / 2,
            bigApple.y * gridSize + gridSize / 2,
            gridSize / 1.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 大苹果茎
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(
            bigApple.x * gridSize + gridSize / 2 - gridSize / 8,
            bigApple.y * gridSize - gridSize / 6,
            gridSize / 4,
            gridSize / 2
        );
        
        // 大苹果光芒效果
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            bigApple.x * gridSize + gridSize / 2,
            bigApple.y * gridSize + gridSize / 2,
            gridSize / 1.5 + 2,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
    
    // 更新最终分数显示
    finalScoreEl.textContent = score;
    finalApplesEl.textContent = appleCount;
    finalTimeEl.textContent = gameTime;
    
    // 显示游戏结束弹窗
    document.getElementById('game-over').classList.remove('hidden');
    
    // 检查是否进入最高分
    checkHighScore();
}

// 初始化游戏
window.onload = init;
