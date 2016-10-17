/**
 * Created by fei on 17/10/16.
 */


(function () {
    var content = document.getElementById('content').style;

    // 切换到注册界面
    document.getElementById('register').onclick = function () {
        content.transform = 'rotateY(180deg)';
        content.height = '270px';
    };

    // 切换到登陆界面
    document.getElementById('login').onclick = function () {
        content.transform = 'rotateY(0deg)';
        content.height = '220px';
    };

    // 注册
    var registerBtn = document.getElementById('registerBtn')
    registerBtn.onclick = function () {
        var options = {};
        options.username = document.getElementById('username').value;
        options.nickname = document.getElementById('nickname').value;
        options.password = document.getElementById('password').value;
        registerBtn.disabled = true;
        registerBtn.className = 'disabled btn';
        registerBtn.innerText = '注册中...';

        register(options,content,registerBtn)
    };

    // 登陆
    var loginBtn = document.getElementById('loginBtn');
    loginBtn.onclick = function () {
        var options = {};
        options.user = document.getElementById('user').value;
        options.pwd = document.getElementById('pwd').value;
        loginBtn.disabled = true;
        loginBtn.className = 'disabled btn';
        loginBtn.innerText = '登陆中...';

        login(options,loginBtn)
    }

})();


// 注册
function register(data,content,btn) {



    var options = {
        username: data.username,
        password: data.password,
        nickname: data.nickname,
        appKey: Easemob.im.config.appkey,
        success: function (res) {
            alert('注册成功，请登录');
            content.transform = 'rotateY(0deg)';
            content.height = '220px';
            btn.disabled = false;
            btn.className = 'registerBtn btn';
            btn.innerText = '注册';
        },
        error: function (res) {
            btn.disabled = false;
            btn.className = 'registerBtn btn';
            btn.innerText = '注册';
            alert('注册失败')
        }
    };

    Easemob.im.Helper.registerUser(options);
}

// 登陆
function login(data,btn) {
    console.log(data);



    var options = {
        user : data.user,
        pwd : data.pwd,
        appKey : Easemob.im.config.appkey,
        success:function(res){
            // alert("成功登录");
            data.nickname = res.user.nickname;
            localStorage.setItem('data',JSON.stringify(data));

            window.location.href = '../index.html';
        },
        error: function(e){
            console.log(e);

            btn.disabled = false;
            btn.className = 'loginBtn btn';
            btn.innerText = '登陆';

            alert("登陆失败:"+e.error_description);
        }
    };

    Easemob.im.Helper.login2UserGrid(options);

}