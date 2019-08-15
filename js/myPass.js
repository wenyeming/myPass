//密码本列表，格式[{name,login,pass}]
var objList = [];

//补全或截取16位字符串
function buildStr16(key) {
    var len = key.length;
    if (len < 16) {
        for (var i = 0; i < 16 - len; i++) {
            key += i < 10 ? i : i - 10;
        }
        return key;
    }
    else if (len > 16) {
        return key.substr(0, 16);
    }
    else {
        return key;
    }
}

//解密方法
function aesDecrypt(word, key) {
    var key16 = CryptoJS.enc.Utf8.parse(buildStr16(key));
    var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    var decrypt = CryptoJS.AES.decrypt(srcs, key16, { iv: key16, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

//加密方法
function aesEncrypt(word, key) {
    var key16 = CryptoJS.enc.Utf8.parse(buildStr16(key));
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key16, { iv: key16, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}

//导入json文件
function fileImport() {
    var selectedFile = document.getElementById('files').files[0];
    var name = selectedFile.name;
    var size = selectedFile.size;
    var reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = function () {
        objList = JSON.parse(this.result);
        viewList();
    }
}

//导出json文件
function fileSave() {
    var saveKey = $('#saveKey').val();
    var againKey = $('#againKey').val();
    var openKey = $('#openKey').val();
    if (saveKey == againKey) {
        if (saveKey == '') {
            saveKey = openKey;
        }
        var saveList = [];
        objList.forEach(function (o) {
            var obj = {};
            obj.name = o.name;
            obj.login = aesEncrypt(o.login, saveKey);
            obj.pass = aesEncrypt(o.pass, saveKey);
            saveList.push(obj);
        });
        var blob = new Blob([JSON.stringify(saveList)], { type: "" });
        saveAs(blob, "data.json");
    }
    else {
        alert('秘钥不一致！');
    }
}

//显示数据
function viewList() {
    var openKey = $('#openKey').val();
    $('.list').empty();
    obj.forEach(function (o) {
        o.login = aesDecrypt(o.login, openKey);
        o.pass = aesDecrypt(o.pass, openKey);
        $('.list').append('<div class="item">' + o.name + '</div>');
    });
    //事件
    $('.item').click(function () {
        var name = $(this).html();
        if (name == $('#name').val()) {
            $('#name').val('');
            $('#login').val('');
            $('#pass').val('');
        }
        else {
            var obj = objList.find(function (o) { return o.name == name; });
            $('#name').val(obj.name);
            $('#login').val(obj.login);
            $('#pass').val(obj.pass);
        }
    });
}

//增加或修改数据
function saveData() {
    var name = $('#name').val();
    var index = -1;
    for (var i = 0; i < objList.length; i++) {
        if (objList[i].name == name) {
            index = i;
            objList[i].login = $('#login').val();
            objList[i].pass = $('#pass').val();
            break;
        }
    }
    if (index == -1) {
        objList.push({
            name: name,
            login: $('#login').val(),
            pass: $('#pass').val()
        });
        $('.list').append('<div class="item">' + name + '</div>');
        $('.item').eq(objList.length - 1).click(function () {
            var name = $(this).html();          
            if (name == $('#name').val()) {
                $('#name').val('');
                $('#login').val('');
                $('#pass').val('');
            }
            else {
                var obj = objList.find(function (o) { return o.name == name; });
                $('#name').val(obj.name);
                $('#login').val(obj.login);
                $('#pass').val(obj.pass);
            }
        });
    }
}

//删除数据
function delData() {
    var name = $('#name').val();
    for (var i = 0; i < objList.length; i++) {
        if (objList[i].name == name) {
            objList.splice(i, 1);
            $('.item').eq(i).remove();
            break;
        }
    }
}

//生成密码
function createPass() {
    var minLen = 0;
    var passLen = parseInt($('#passLen').val());
    var passList = [];
    var pass = '';

    var passSet = [
        {
            name: 'number',
            min: 2,
            has: $("#number")[0].checked,
            code: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        },
        {
            name: 'lower',
            min: 2,
            has: $("#lower")[0].checked,
            code: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        },
        {
            name: 'upper',
            min: 2,
            has: $("#upper")[0].checked,
            code: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        },
        {
            name: 'codeSpecial',
            min: 2,
            has: $("#special")[0].checked,
            code: ['!', '@', '#', '$', '%', '^', '&', '*', '.', '?'],
        },
    ];

    for (var i = 0; i < passSet.length; i++) {
        if (passSet[i].has)
        { minLen += passSet[i].min; }
    }

    if (passLen >= minLen) {
        var codeConcat = [];
        //按类填写必须的字符
        for (var i = 0; i < passSet.length; i++) {
            if (passSet[i].has) {
                for (var j = 0; j < passSet[i].min; j++) {
                    var charNum = Math.floor(Math.random() * passSet[i].code.length);
                    passList.push(passSet[i].code[charNum]);
                }
                codeConcat = codeConcat.concat(passSet[i].code);
                passLen -= passSet[i].min;
            }
        }
        //剩余的数据随机取
        if (passLen > 0) {
            for (var j = 0; j < passLen; j++) {
                var charNum = Math.floor(Math.random() * codeConcat.length);
                passList.push(codeConcat[charNum]);
            }
        }

        //字符随机重排       
        while (passList.length > 0) {
            var charNum = Math.floor(Math.random() * passList.length);
            pass += passList[charNum];
            passList.splice(charNum, 1);
        }
    }
    $('#pass').val(pass);
}