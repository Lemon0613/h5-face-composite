/**
 * Created by msxiehui on 2017/8/17.
 * Date:2017/8/17
 * Time:15:12
 * Email:msxiehui@163.com
 * VERSION: 0.1
 *北京耀启网络科技有限公司
 *北京百孚思传实网络营销机构
 *
 */
var yaoqi = yaoqi || {};

yaoqi.uploadfile = function () {

    this.version="0.1";

    this.isPost = false;
    this.ok = false;
    this.taget = null;
    this.params = {};
    this.types = "";
    this.fd = "";
    this.xhr = "";
    this.files = "";
    this.defaults={
        size: 1024 * 1024 * 5,
        imgType: "jpeg,png",
        auto: false,
        lrz: false,
        maxHeight: 500,
        maxWidth: 500,
        lrzType: "width",
        url: "",
        urlParams: {},
        onStart:function (data) {},
        callback: function (data) {}
    }
    return this;
}

yaoqi.uploadfile.prototype.init = function (id, params) {

    this.taget = document.getElementById(id);

    params = params || {};
    for (var def in this.defaults) {
        if (typeof params[def] === 'undefined') {
            params[def] = this.defaults[def];
        } else if (typeof params[def] === 'object') {
            for (var deepDef in this.defaults[def]) {
                if (typeof params[def][deepDef] === 'undefined') {
                    params[def][deepDef] = this.defaults[def][deepDef];
                }
            }
        }
    }

    this.params = params;
    var types = this.params.imgType.split(",");

    if (types.length > 0) {
        for (var i = 0; i < types.length; i++) {
            this.types += "image/" + types[i] + ",";
        }
        this.types = this.types.slice(0, this.types.length - 1);
    } else {
        this.types = "image/jpeg,image/png"
    }

    if(this.isPC()){
        this.taget.setAttribute("accept", this.types);
    }else{
        this.taget.setAttribute("accept", "");
    }

    this.ok = true;
    var self = this;
    console.log("yaoqi.uploadfile.init");
    this.taget.addEventListener("change", function (event) {
        self.isPost = false;
        self.files = event.target.files[0];
        console.log("change");
        if (self.params.auto == true) {
            self.start();
        }
    });
    return this;
}

yaoqi.uploadfile.prototype.start = function () {
    console.log("执行upload");
    if (!this.ok) {
        console.error("请先初始化 yaoqi.upload.init();");
        return;
    }
    if (this.isPost) {
        return;
    }

    if (!this.files) {
        var data = {
            result: 4001,
            error_message: "没有文件信息"
        }
        this.params.callback(data);
        return;
    }
    if (this.files.size > this.params.size) {
        var data = {
            result: 4002,
            error_message: "文件超过限制大小"
        }
        this.params.callback(data);
        return;
    }

    if (this.types.indexOf(this.files.type) == -1) {
        var data = {
            result: 4003,
            error_message: "文件类型超出限制"
        }
        this.params.callback(data);
        return;
    }

    if(this.params.lrz==true){
        var self=this;
        var data={};
        if(this.params.lrzType=="height"){
            data["height"]=this.params.maxHeight;
        }else{
            data["width"]=this.params.maxWidth;
        }
        if(typeof(lrz)=="undefined") {
            var data = {
                result: 4000,
                error_message: "请加载压缩插件(lrz.mobile.min.js)"
            }
            self.params.callback(data);
            return;
        }
        //开始压缩并上传。
        lrz(this.files,data, function(results) {
            var blob = self.dataURLtoBlob(results.base64);
            self.files=blob;
            self.send();
        });
    }else{
        this.send();
    }
}
yaoqi.uploadfile.prototype.dataURLtoBlob=function (dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime
    });
}
yaoqi.uploadfile.prototype.send=function () {
    this.isPost = true;
    this.fd = new FormData();
    this.fd.append("file", this.files);
    for (var val in this.params.urlParams) {
        this.fd.append(val, this.params.urlParams[val]);
    }
    var self = this;
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener("load", uploadComplete, true);
    this.xhr.addEventListener("loadstart",start , true);
    this.xhr.addEventListener("error", uploadFailed, true);
    this.xhr.open("POST", this.params.url);
    this.xhr.send(this.fd);

    function start(evt) {
        console.log("start");
        if(self.params.onStart!=null){
            self.params.onStart(evt);
        }
    }

    function uploadComplete(evt) {
        self.isPost = false;
       // console.log(self);
        if (evt.currentTarget.status == 200) {
            var return_body = evt.currentTarget.responseText;
            var data = JSON.parse(return_body);
            self.params.callback(data);
        } else if (evt.currentTarget.status == 404) {
            var data = {
                result: 4004,
                error_message: evt.currentTarget.responseText
            }
            self.params.callback(data);
        } else {
            var data = {
                result: 4005,
                status: evt.currentTarget.status,
                error_message: evt.currentTarget.responseText
            }
            self.params.callback(data);
        }
    }
    function uploadFailed(evt) {
        self.isPost = false;
        var data = {
            result: 4006,
            message: evt.responseText
        }
        self.params.callback(data);
    }
}
yaoqi.uploadfile.prototype.upbase64=function (imgData,params) {
    this.files=this.dataURLtoBlob(imgData);
    params = params || {};
    for (var def in this.defaults) {
        if (typeof params[def] === 'undefined') {
            params[def] = this.defaults[def];
        } else if (typeof params[def] === 'object') {
            for (var deepDef in this.defaults[def]) {
                if (typeof params[def][deepDef] === 'undefined') {
                    params[def][deepDef] = this.defaults[def][deepDef];
                }
            }
        }
    }
    this.params = params;
    this.send();
}
yaoqi.uploadfile.prototype.isPC=function () {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
}
yaoqi.uploadfile.prototype.cacheImg=function(src,callback){
    var img = new Image,
        canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

    img.crossOrigin = "Anonymous";
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage( img, 0, 0 );
        if(callback!=null){
            callback(img);
        }
    }
    img.src = src;
    if ( img.complete || img.complete === undefined ) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}
yaoqi.upload = new yaoqi.uploadfile();
