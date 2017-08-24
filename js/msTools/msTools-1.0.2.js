/**
 * @author msxiehui and Team { chenhongyu }
 * form 北京耀启网络科技有限责任公司
 * form 北京百孚思传实网络营销机构
 *
 * 工具类，部分功能需要 jquery 或者 zepto
 *
 * vesion: 1.0.2

 */

(function () {

    /**
     * @description  全局函数 ms 或者 $$ 方式使用。
     */
    var ms = window.ms = window.$$ = function (selector, context) {
        return new ms.fn.init(selector, context);
    };
    /**
     * @description msTools.js 版本号
     * @type {string}
     */
    ms.version = "1.0.2";

    /*
     *  ****************************内置属性  不做太多设置，
     */
    ms.fn = ms.prototype = {
        init: function (selector) {
            if (selector) this.selector = selector;
            return this;
        }
    };


    /*----------------------------------------通用方法和全局变量------------------------------------------------*/
    /**
     * @version 0.13
     * @description 判断当前函数是否需要 jQuery 或 Zepto 的支持
     * @return {Boolean} 布尔值是否存在jQuery或Zepto
     */
    ms.jQueryOrZepto=function(){
        if(!window.jQuery && !window.Zepto){
            console.error("此功能需要 jQuery或 Zepto 支持");
            return false;
        }
        return true;
    }
    /**
     * @description 窗口高度
     * @type {Number}
     */
    ms.height=window.innerHeight;
    /**
     * @description 窗口宽度
     * @type {Number}
     */
    ms.width=window.innerWidth;

    /*---------------------------------------独立方法-----------------------------------------*/

    /**
     * 加载进度百分比
	 * @since  0.14
	 * @param  {Array}  img
	 * @param {Boolean} elem  testasdf
     * @param{function} callback - 传回参数 data
     *  <p>
     *  <p>         data.id  当前完成图片的 ID号
     * <p>          data.total  总图片数
     * <p>          data.currenter 第几个完成的图片
     * <p>          data.bfb  加载序列的百分比。
     * @function
     */
	ms.loadings = function (img, elem,callback) {
		var imgArr=new Array();
		if(Array.isArray(img)){
			imgArr=img;
		}
		if(elem){
			var htmlImages = document.getElementsByTagName("img");
			var htmlImages_length = htmlImages.length;
			for(var i = 0; i < htmlImages_length; i++) {
				imgArr.push(htmlImages[i].src);
			}
		}

		for(var i = 0; i < imgArr.length; i++) {
			var newImages = new Image();
			newImages.src = imgArr[i];
			newImages.imgid = i;
			newImages.onload = imgload;
		};

		var currenter = 0;

		function imgload(ev) {
			currenter++;
			if(callback != null) {
    			var data = new Object;
                data.total = img.length;
                /**
                 * 图片的ID值（也是加载序列的顺序值）
                 * @type {int} data.id
                 */
                data.id = ev.target.imgid;
                data.currenter = currenter;
                data.bfb = parseInt(currenter / img.length * 100);
                callback (data);
			}
		}
	}


    /**
	 * @since  0.13
     *  @description 自动缩放和定位页面中的元素
     * @param {String}[_elem=".csBox"]  需要视频的元素 可以是 类，ID 等，如果为空则默认为 类：.csBox
     * @param fun {data,i,num} 回调函函数，data 当前元素的 缩放值，系数等，i 当前循环中的第几个，num 当前总循环数
     * @param _w 设计图宽度  默认为 750；
     * @param _h 设计图高度   默认为 1136
     * @example
     *
     */

    ms.reSet=function(_elem,fun,_w,_h){
         if(!ms.jQueryOrZepto()){
             return;
         }
        var elem,ww,hh;
        elem=_elem;
        ww=_w;
        hh=_h;
         if(typeof(elem)=="undefined" || elem==""){
            elem=".csBox";
        }
        if(typeof(ww)=="undefined" || ww=="" || ww<=0){
           ww=750;
        }
        if(typeof(hh)=="undefined" || hh=="" || hh<=0){
            hh=1136;
        }

        $(elem).each(function(i) {
            var data = elemScale($(this));
            $(this).css({
                "position": "absolute",
                "width": data.newWidth,
                "height": data.newHeight,
                "margin-left":data.marginLeft,
                "margin-top": data.marginTop
            });

            if (fun != null) {

                fun(data,i,$(elem).length);

            }
        });
        //自定义 工具对象。
        function elemScale(ele) {
            this.target=ele;
            this.Eheight =  ele.attr("height");
            this.Ewidth = ele.attr("width");
            this.scale=window.innerHeight/hh;
            this.Eleft = ele.attr("left");
            this.Etop =  ele.attr("top");
            this.newWidth =  this.Ewidth*this.scale;
            this.newHeight = this.Eheight*this.scale;
            //左右位置： （窗口宽度 - 设置宽度*缩放系数 ）/2 + 坐标位置*缩放系数
            this.marginLeft =(window.innerWidth-ww*this.scale)/2+this.Eleft*this.scale;
            this.marginTop = this.Etop*this.scale;
            return this;

        }
    }


    /**------------------------------------------------数组操作*/

    /**
     * 	@since  0.13
     * @description 判断是否为数组
     * @param obj
     * @return {boolean}
     */
    ms.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * @since  0.13
     *  @description 取元素在数组中的位置
     * @param arr 数组
     * @param str 元素
     * @return {*} 不存在返回  -1
     */
    ms.arrIndexOf = function (arr, str) {
        // 如果可以的话，调用原生方法
        if (arr && arr.indexOf) {
            return arr.indexOf(str);
        }
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            // 定位该元素位置
            if (arr[i] == str) {
                return i;
            }
        }
        // 数组中不存在该元素
        return -1;
    }

    /**------------------------------------------------数字操作*/

    /**
     * @since  0.13
     * @description
     * @param Min
     * @param Max
     * @return {*}
     */
    ms.rand = function (Min, Max) {
        var Range = Max - Min;
        var Rand = Math.random();
        return (Min + Math.round(Rand * Range));
    }

    /**------------------------------------------------时间日期操作*/

    /**
     * @since  0.13
     * @description 返回当前日期时间的文本格式
     * @param type  数字  1：日期 、2： 时间 、其他：日期时间
     *          格式 1：2016-09-21
     *          格式 2：13:51:43
     *          其他   ：2016-09-21 13:51:39
     * @returns {*} 返回时间格式
     */
    ms.getNowFormatDate = function (type) {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate;
        if (type == 1) {
            currentdate = year + seperator1 + month + seperator1 + strDate
        } else if (type == 2) {
            currentdate = date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
        } else {
            currentdate = year + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
        }
        return currentdate;
    }

    /**------------------------------------------------验证操作*/
    /**
     * @description 验证是否是邮箱
     * @param str
     * @returns {boolean}
     */
    ms.isEmail = function (str) {
        var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        if (re.test(str)) {
            return true;
        }
        return false;
    }
    /**
     * @description 验证是否是用户姓名
     * @param str
     * @returns {boolean}
     */
    ms.isName = function (name) {
        if (name != "" || name.search(/^[\u0391-\uFFE5\w]+$/) != -1) {
            return true;
        }
        return false;
    }

    /**
     * @description 验证是否是手机号
     * @param str
     * @returns {boolean}
     */
    ms.isPhone = function (str) {
        var pattern = /^1[34578]\d{9}$/;
        if (pattern.test(str)) {
            return true;
        }
        return false;
    }

    /**------------------------------------------------浏览器操作*/
    /**
     *@description 判断浏览器
     *  @example ms.browser.ios
     * @returns {boolean}
     */

    ms.browser = function () {
        var u = navigator.userAgent,
            app = navigator.appVersion;
        return {
            webKit: u.indexOf('AppleWebKit') > -1,
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
            weixin: u.indexOf('MicroMessenger') > -1,
            txnews: u.indexOf('qqnews') > -1,
            sinawb: u.indexOf('weibo') > -1,
            mqq: u.indexOf('QQ') > -1
        };
    }();


    /**
     *@description 判断是否 为电脑
     *  @example ms.isPC
     * @returns {boolean}
     */
    ms.isPC = function () {
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
    }();


    /**
     * @description 获取 URL get 参数 返回数组形式
     * @return {Array}
     */
    ms.getALL = function () {
        querystr = window.location.href.split("?");
        var GET = new Array();
        if (querystr[1]) {
            var GETs = querystr[1].split("&");
            for (i = 0; i < GETs.length; i++) {
               var tmp_arr = GETs[i].split("=");
              var key = tmp_arr[0];
                GET[key] = tmp_arr[1];
            }
        }
        return GET;
    }

    /**
     *
     * @description 根据 参数名 获取 URL 参数值
     * @param name  参数名
     * @return {*}
     */
    ms.getArg = function (name) {
        var url = document.location.href;
        var arrStr = url.substring(url.indexOf("?") + 1).split("&");
        for (var i = 0; i < arrStr.length; i++) {
            var loc = arrStr[i].indexOf(name + "=");
            if (loc != -1) {
                return arrStr[i].replace(name + "=", "").replace("?", "");
                break;
            }
        }
        return "";
    }

    /**------------------------------------------------cookies操作*/
    /**
     * @description  写cookies
     * @param name  cookies 名
     * @param value  cookies 值
     */
    ms.setCookie = function (name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    }

    /**
     * @description  取Cookies
     * @param name   cookies 名
     * @return 返回值或null
     *
     */
    ms.getCookie = function (name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }

    /**
     * @description 删除 Cookies
     * @param name  需要删除的 Cookies 名
     */
    ms.delCookie = function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        if (cval != null) {
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
        }
    }
	
	
	
	
	
    ms.fn.init.prototype = ms.fn;

})();
