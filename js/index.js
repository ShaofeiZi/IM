/**
 * Created by fei on 17/10/16.
 */


var getClass = function (name) {
    return document.getElementsByClassName(name);
};

var getId = function (id) {
    return document.getElementById(id);
};

var domCreate = function(node){
    return document.createElement(node)
};

(function () {
    var data = localStorage.getItem('data');


    if (!data) {
        window.location.href = 'views/login.html';
    }
    else {
        msg(data)
    }


})();

// 连接IM
function msg(data) {

    data = JSON.parse(data);

    console.log(data);
    // 创建链接
    var conn = new Easemob.im.Connection();
    conn.init({
        onOpened : function() {

            conn.setPresence();
            // 获取好友列表
            conn.getRoster({
                success : function(roster) {
                    // 获取当前登录人的好友列表
                    // 生成节点
                     console.log(roster);
                    for (var i = 0, len = roster.length; i< len; i++) {
                        var rot = roster[i];
                        if (rot.subscription != 'none') {
                            appendCell('both', rot.name);
                        }
                    }
                    getId(roster[0].name).onclick();
                }
            });
        },
        // 登陆失败
        onError: function (msg) {
            window.alert('连接失败，请重新登陆');
            window.location.href = 'views/login.html';
        },
        // 联系人请求回掉
        onPresence : function(message) {
            handlePresence(message);
        },

        // 接受消息
        onTextMessage : function(message) {
            handlePictureMessage(message)
        }
    });

    // 登陆请求
    conn.open({
        user : data.user,
        pwd : data.pwd,
        appKey : Easemob.im.config.appkey
    });

    // 好友请求反馈
    var handlePresence = function(e) {
        console.log(e);
        //（发送者希望订阅接收者的出席信息）
        if (e.type == 'subscribe') {

            getId('none').style.display = 'block';

            // 添加节点
            appendCell('none', e.from, conn);


        }
        else if (e.type == 'subscribed'){
            conn.subscribe({
                to : e.from,
                message : ""
            });

            // 添加节点
            appendCell('both', e.from);

        }

    };

    // 添加好友
    getId('addBtn').onclick = function () {
        var userID = getId('userID').value;
        console.log(userID);

        if (userID) {
            conn.subscribe({
                to : userID,
                message : "加个好友呗"
            });
            alert('请求发送成功');
        }
        else {
            alert('请输入账号');
        }

    };

    //发送消息
    getId('sending').onclick = function () {
        var val = getId('msgText').value;
        if (val) {
            sendText(conn,data.user);
        }

        getId('msgText').focus();
    };

    // 接受消息
    var handlePictureMessage = function (msg) {

        console.log(msg);

        msg.who = 'other';

        localMsg(msg);


        getId(msg.from).getElementsByClassName('newMsg')[0].style.display = 'block';

        if (msg.from == cellId) {
            appendMsg('other',msg.data);
        }
    };

}

var cellId = undefined;

// cell点击事件
function cellClick(name,cell) {
    cell.name = name;
    cell.onclick = function () {
        console.log(this.name);
        getId('msgText').focus();
        getId('msgHeader').innerText = this.name;
        if (cellId != undefined) {
            getId(cellId).style.backgroundColor = '#eaeaea';
        }
        this.style.backgroundColor = '#cacdd3';
        cellId = this.id;

        var user = JSON.parse(localStorage.getItem('data')).user;
        var key = cellId + user;
        console.log(key);
        var msgArray = JSON.parse(localStorage.getItem(key));
        console.log(msgArray);

        getId('message').innerHTML = '';

        if (msgArray != null) {
            msgArray.forEach(function(msg){
                console.log(msg.data)
                appendMsg(msg.who,msg.data);
            })
        }

        getId(cellId).getElementsByClassName('newMsg')[0].style.display = 'none';

    };
}

// 发送消息
function sendText(conn,name) {
    var data = getId('msgText').value;
    conn.sendTextMessage({
        to : cellId,
        msg :data //文本消息
        //ext :{"extmsg":"extends messages"}//用户自扩展的消息内容（群聊用法相同）
    });

    var msg = {};
    msg.who = 'me';
    msg.data = data;
    msg.to = name;
    msg.from = cellId;
    localMsg(msg);

    appendMsg('me', data);
    getId('msgText').value = '';


}

// 接受拒绝点击事件
function btnClick(cell,conn ,name) {
    // 接受好友
    var receive = getClass('receiveBtn');
    // receive[receive.length-1].index = receive.length-1;
    var len = receive.length - 1;
    receive[len].onclick = function () {
        //同意好友请求
        conn.subscribed({
            to : name,
            message : "[resp:true]"
        });

        run(cell,"opacity",1,function(){
            cell.remove();
            if (!receive.length) {
                getId('none').style.display = 'none';
            }
        });

        appendCell('both', name);

    };

    // 拒绝添加
    var refuse = getClass('refuseBtn');
    refuse[len].onclick = function () {

        // 拒绝添加好友的方法处理
        conn.unsubscribed({
            to : name,
            message : "rejectAddFriend"
        });

        run(cell,"opacity",1,function(){
            cell.remove();
            if (!receive.length) {
                getId('none').style.display = 'none';
            }
        });
    }
}

// 添加好友列表节点
function appendCell(type ,name,conn) {

    var cell = domCreate("div"),
        cellIcon = domCreate("img"),
        cellText = domCreate("span");


    cell.className = 'cell';
    cellIcon.src = 'images/listIcon.png';
    cellIcon.className = 'cellIcon';
    cellText.className = 'cellText';
    cellText.innerText = name;
    cell.id = name;

    if (type == 'none') {
        var newUserBtn = domCreate("div"),
            receiveBtn = domCreate("button"),
            refuseBtn = domCreate("button");

        newUserBtn.className = 'newUserBtn';
        receiveBtn.className = 'receiveBtn';
        refuseBtn.className = 'refuseBtn';
        receiveBtn.innerText = '接受';
        refuseBtn.innerText = '拒绝';

        cell.appendChild(cellIcon);
        cell.appendChild(cellText);
        cell.appendChild(newUserBtn);
        newUserBtn.appendChild(receiveBtn);
        newUserBtn.appendChild(refuseBtn);
        getId('isAdd').appendChild(cell);

        btnClick(cell,conn,name)
    }
    else {
        var newMsg = domCreate('div');
        newMsg.className = 'newMsg';
        newMsg.innerText = '新消息';

        cell.appendChild(cellIcon);
        cell.appendChild(cellText);
        cell.appendChild(newMsg);
        getId('userList').appendChild(cell);

        cellClick(name, cell);
    }
    // return cell;
}

// 添加聊天节点
function appendMsg(who,data) {
    var domCreat = function(node){
        return document.createElement(node)
    };

    var msgBox = domCreat('div'),
        msgIcon = domCreat('img'),
        msgSanjiao = domCreat('div'),
        msgContent = domCreat('div'),
        msgText = domCreat('span');

    if (who === 'other') {
        msgBox.className = 'pull-left other';
        msgIcon.className = 'pull-left icon';
        msgSanjiao.className = 'othersanjiao pull-left';
        msgContent.className = 'msgText otherColor pull-left';
        msgText.innerText = data;
        msgIcon.src = 'images/listIcon.png';
    }
    else {
        msgBox.className = 'pull-right me';
        msgIcon.className = 'icon pull-right';
        msgSanjiao.className = 'mesanjiao pull-right';
        msgContent.className = 'msgText meColor pull-right';
        msgText.innerText = data;
        msgIcon.src = 'images/listIcon.png';
    }

    getId('message').appendChild(msgBox);
    msgBox.appendChild(msgIcon);
    msgBox.appendChild(msgSanjiao);
    msgBox.appendChild(msgContent);
    msgContent.appendChild(msgText);

    var scroll = getId('message');
    scroll.scrollTop = scroll.scrollHeight + scroll.offsetHeight

}

// 本地储存消息
function localMsg(msg) {
    var msgArray = [];

    var key = msg.from + msg.to;
    console.log(key);

    var message = localStorage.getItem(key);

    if (message != null) {
        msgArray = JSON.parse(localStorage.getItem(key));
        msgArray[msgArray.length] = msg;
        localStorage.setItem(key, JSON.stringify(msgArray));
    }
    else {
        msgArray[msgArray.length] = msg;
        localStorage.setItem(key, JSON.stringify(msgArray));
    }
}

// 动画
function run(obj,attr,target,fn){
    clearInterval(obj.timer);
    obj.timer = setInterval(function(){
        var cur = 0;
        if(attr == "opacity"){
            cur = Math.round(parseFloat(getstyle(obj,attr))*100);
        }else{
            cur = parseInt(getstyle(obj,attr));
        }
        var speed = (target-cur)/8;
        speed = speed>0?Math.ceil(speed):Math.floor(speed);

        if(cur == target){
            clearInterval(obj.timer);
            if(fn){
                fn();
            }
        }else{
            if(attr == "opacity"){
                obj.style.filter = "alpha(opacity="+(cur+speed)+")";
                obj.style.opacity = (cur+speed)/100;
            }else{
                obj.style[attr] = cur + speed + "px";
            }
        }

    },30)
}

//获取样式
function getstyle(obj,name){
    if(obj.currentStyle){
        return obj.currentStyle[name];
    }else{
        return getComputedStyle(obj,false)[name];
    }
}