function Container() {
    this.blocks = document.querySelectorAll('.blocks');
    this.blocks2D = new Array(4);
    this.scorePad = document.querySelector('.panel #score');
    this.highestPad = document.querySelector('.panel #highest');
    this.score = 0;
    this.highest = Number(localStorage.getItem('highest'));
    this.contentString = 0;
    this.storageString = 0;
    this.times =  Number(localStorage.getItem('times')) + 1;
    this.counter = 0;

    let j=0;
    for(let i=0; i<4; i++){
        this.blocks2D[i] = new Array(4);
        for(; j<4*(i+1); j++)  this.blocks2D[i][j%4] = this.blocks[j];
    }
}
//清空格子的示数
Container.prototype.empty = function () {
    let blocks = document.querySelectorAll('.blocks');
    for (let i=0; i<16; i++) {
        blocks[i].innerHTML = '';
    }
}
//检测空白元素，随机填充
Container.prototype.ranNumber = function () {
    let i = 0;
    for(let j=0; j<16; j++){
        if(!this.blocks[j].innerHTML)       //该块无值/为0
            i++;
    }
    if(i){                      //如果有空元素
        //赋予的数字
        let given;
        //决定赋予数字的随机数
        let ranNum2 = Math.random();
        if      (ranNum2 > 0.4)     //生成赋予随机数
            given = 2;
        else
            // if (ranNum2 > 0.2)
            given = 4;
        // else if (ranNum2 > 0.05)
        //     given = 8;
        // else
        //     given = 16;
        //随机生成 空白 盒子

        //决定第几号盒子
        let ranNum = Math.ceil (Math.random()*i);
        //待做更改的元素
        let ranBlock;
        for (let i=0, j=0; ; i++){
            if (!this.blocks[i].innerHTML){
                j++;
                if (j >= ranNum){
                    ranBlock = this.blocks[i];
                    break;
                }
            }
        }

        ranBlock.innerHTML = '' + given;
        return true;
    } else
        return false;
}
//一个方法，实现对特定格子某方向上的内容检测，空白则下落继续迭代，相同则合并,出界及遇到不同元素就停止迭代
Container.prototype.neighborDetect = function (x, y, direction) {
    let x2, y2;
    switch (direction) {
        case 1:
            x2 = x;     y2 = y-1;   break;
        case 2:
            x2 = x+1;   y2 = y;     break;
        case 3:
            x2 = x;     y2 = y+1;   break;
        case 4:
            x2 = x-1;   y2 = y;     break;
    }
    if (x2>=0 && x2<4 && y2>=0 && y2<4 && (originHTML=this.blocks2D[y][x].innerHTML) ){      //所指在范围内，且本身有内容
        //
        pointerHTML = this.blocks2D[y2][x2].innerHTML;
        this.counter++;
        if (!pointerHTML){          //所指为空
            this.blocks2D[y2][x2].innerHTML = this.blocks2D[y][x].innerHTML;
            this.blocks2D[y][x].innerHTML = '';
            this.neighborDetect(x2, y2, direction);
        }else if (pointerHTML === originHTML){      //两者相同
            this.score += Number(pointerHTML);
            this.scorePad.innerHTML = 'score: ' + this.score.toString();
            this.blocks2D[y2][x2].innerHTML = ( Number(pointerHTML)+Number(originHTML) ).toString();
            this.blocks2D[y][x].innerHTML = '';
        }else
            this.counter--;
    }
}
//fall方法调用neighborDetect函数以一个方向遍历棋盘，达到向一侧偏倒的目的
Container.prototype.fall = function (key) {
    let floorX = [0, 1, 2, 3], floorY = [0, 1, 2, 3];
    switch (key) {
        case 'w':   case 'W':   case 'ArrowUp':
            for(let i=0; i<4; i++){
                for (let j=0; j<4; j++)     this.neighborDetect(floorX[i], j, 1);
            }   break;
        case 'd':   case 'D':   case 'ArrowRight':
            for(let i=0; i<4; i++){
                for (let j=0; j<4; j++)     this.neighborDetect(3-j, floorY[i], 2);
            }   break;
        case 's':   case 'S':   case 'ArrowDown':
            for(let i=0; i<4; i++){
                for (let j=0; j<4; j++)     this.neighborDetect(floorX[i], 3-j, 3);
            }   break;
        case 'a':   case 'A':   case 'ArrowLeft':
            for(let i=0; i<4; i++){
                for (let j=0; j<4; j++)     this.neighborDetect(j, floorY[i], 4);
            }   break;
    }
}
//记录16个格子的函数，返回值为字符串
Container.prototype.contentRecording = function () {
    let value = this.blocks[0].innerHTML;
    for(let i=1; i<16; i++){
        value += ','+this.blocks[i].innerHTML;
    }
    return value;
}
//传入预设的字符串参数，改变格子的示数
Container.prototype.contentChange = function (blocksContent) {
    if (blocksContent){
        let contentArray = blocksContent.split(',');
        for (let i=0; i<16; i++){
            this.blocks[i].innerHTML = contentArray[i];
        }
    } else {
        alert('已到达本局游戏最后一步');
    }
}


let container = new Container();
container.highestPad.innerHTML = 'highest score: ' + container.highest.toString();
//如果按下游戏开始/重置
function gameStart() {
    window.onkeydown = function keyDown(event) {
        container.fall(event.key);
        window.onkeydown = function () {}
        setTimeout(function () {
            if(container.counter){
                container.counter=0;
                container.ranNumber();
                container.contentString += '.'+container.contentRecording();
            }
            window.onkeydown = keyDown;
        }, 300);            //太快了会bug
    }
    //对记录的存储
    container.times = Number(localStorage.getItem('times')) + 1;
    if(container.contentString){
        //最后一局的游玩记录
        localStorage.setItem((container.times-1).toString(), container.contentString);
        //最后一局的次数
        localStorage.setItem('times', (container.times-1).toString());
    }
    //对最高分的记录
    if(container.score > container.highest){
        container.highest = container.score;
        container.highestPad.innerHTML = 'highest score: ' + container.highest.toString();
        localStorage.setItem('highest', container.highest.toString());
    }

    container.score = 0;
    container.scorePad.innerHTML = 'score: 0';
    container.empty();
    container.ranNumber();
    container.contentString = container.contentRecording();
}
document.querySelector('.panel button').onclick = gameStart;
//按下历史记录回放
document.querySelector('footer #review').onclick = function () {
    let i=0;
    container.contentString = 0;
    container.storageString = localStorage.getItem((--container.times).toString());
    if(container.storageString){
        let prompt = document.querySelector('footer #prompt');
        prompt.style.display = 'inline'; //按钮显示
        let contentArray = container.storageString.split('.');
        container.storageString = 0;
        container.contentChange(contentArray[0]);
        window.onkeydown = function switchBlocks() {
            container.contentChange(contentArray[i++]);
        }
    } else {
        alert('本地无游玩记录！');
    }
}
//清除历史记录
document.querySelector('footer #delete').onclick = function () {
    localStorage.clear();
    container.highestPad.innerHTML = 'highest score: 0';
    gameStart();
    alert('历史记录清除完毕，将自动开始游戏');
}