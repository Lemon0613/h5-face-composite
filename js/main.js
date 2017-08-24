/**
 * Created by lemon on 2017/8/14.
 */

$(function() {
    ms.reSet();

    var imgArray =['/img/bg01.jpg','/img/bg02.jpg','/img/bg03.jpg','/img/mod1.png','/img/mod2.png','/img/mod3.png',
        '/img/mod4.png','/img/mod5.png'];
        
        for(var i=0;i<imgArray.length;i++){
            imgArray[i]="http://cdn5.iforce-media.com/2017/siwei_qixi"+imgArray[i];
        }
        
    ms.loadings(imgArray, true, function (obj) {
        $(".loadnum").html(obj.bfb + "%")
        if (obj.bfb > 95) {
            setTimeout(function () {
                $(".loading").fadeOut(350);
                $(".container").fadeIn(500);
            }, 800)
            setTimeout(function () {
                $('.page1 > img').first().fadeIn(600,'linear',function(){
                    $(this).next().fadeIn('slow','linear', arguments.callee);
                });
            },1500)
            setTimeout(function () {
                $('.anis').addClass('fadeIn-btn');
                $('.anis').css('opacity', '1');
            },5000)
        }
    })


    
    //------音乐-----
	$(".muc").on("touchstart", function(event) {
		event.preventDefault();
		if($(this).attr("plays") == "play"){
			$(".muc").attr("src","http://cdn5.iforce-media.com/2017/siwei_qixi/img/sound-btn2.png");
			$(".muc").attr("plays","paused");
			audio.pause();
		}else{
			$(".muc").attr("src","http://cdn5.iforce-media.com/2017/siwei_qixi/img/sound-btn.png");
			$(".muc").attr("plays","play");
			audio.play();
		}
	})
    
    
    //-----------音乐--------------
    var audio = document.getElementById("audio");

    function audioAutoPlay(a) {
        try {
            a.play();
        } catch(e) {}
        document.addEventListener("WeixinJSBridgeReady", function() {
            a.play();
        }, false);
    }
    audioAutoPlay(audio);

    //--------------------分享设置---------------
    var url = JSSDK.url;
    var link = url + '/2017/siwei_qixi/index.php';
    var tit = "特别的七夕--SWM斯威汽车";
    var doc = "500年后,你和Ta之间的心灵磁场感应度还有多少?";
    var img = url + "/2017/siwei_qixi/img/share-img.jpg";
    JSSDK.init(tit, doc, link, img, false);

    //--------------------微信授权---------------
    o_id = ms.getCookie('o_id');
    is_all = ms.getCookie('is_all'); //是否填写信息
    code = ms.getArg("code");

 var own_share;//判断用户是不是自己登陆的分享页

    $.ajax({
        type: 'POST',
        url: "common.php",
        data: {
            get: 'setUser',
            code: code,
            type:ms.getArg("type"),
            img_id:ms.getArg("imgs"),
        },
        dataType: 'json',
        success: function(data) {
            if(data.imginfo){
                res = data.imginfo;
                if(res.is_own != 1){
                    // 不是自己登陆分享页
                    $('#share_pic').attr('src',res.imgs);
                    $('.share-index').show();
                }else{
                    own_share = 1;//自己登陆的分享页
                }
                
            }

            if(data == -2) {
                if(isOpenID(o_id) == false) {
                    layer.open({
                        content: "获取身份信息失败！",
                        btn: '确定'
                    });
                }

            } else if(data == -3) {
                if(isOpenID(o_id) == false) {
                    layer.open({
                        content: "获取身份信息失败！",
                        btn: '确定'
                    });
                }
            } else if(data.status == 1) {

                o_id = data.openid;
                is_all = data.is_all;
                o_name = data.nickname;
                ms.setCookie('o_id', o_id);
                ms.setCookie('is_all', is_all);
                ms.setCookie('o_name', o_name);

            }
        },
        error: function(e) {
            layer.open({
                content: "网络不是很通畅，稍后再试哦！",
                btn: '确定'
            });
        }
    });
    //----------------------------------------      


    $('.rule-btn').click(function () {
        $('.rule-page').fadeIn(350);
    })
    $('.close-rule').click(function () {
        $('.rule-page').fadeOut(350);
    })

    var bg,bgImg;
    var stage = new createjs.Stage("stageCanvas"); //创建画布
    var mySwiper1,mod;
    $('.start-btn').click(function () {
        $('.year-page').fadeIn(350);
       mySwiper1 = new Swiper('#year-select', {
            direction: 'vertical',
            slidesPerView : 3,
            centeredSlides: true,
            coverflow: {
                rotate: 30,
                stretch: 10,
                depth: 200,
                modifier: 8,
                slideShadows : true
            }
        })

    })

    $('.close-per').click(function () {
        $('.year-page').fadeOut(350);
    })

    $('.go-btn').click(function () {
        $('.year-page').fadeOut(350);
        $('.upload').fadeIn(350);
        mod = mySwiper1.realIndex + 1;
        console.log(mod);
        bgImg = './img/mod' + mod + '.png';
        bg = new createjs.Bitmap(bgImg);
        bg.regX = 0, bg.regY = 0, bg.x = 0, bg.y = 0; //设置背景图位置

        stage.update();
        stage.addChild(bg); //放置背景图到canvas画布

        createjs.Ticker.setFPS(5);
        createjs.Ticker.addEventListener("tick", tick);

        function tick(event) {
            stage.update(event);
        }
    })

    // var mySwiper2 = new Swiper('#show-pic', {
    //     direction : 'horizontal',
    //     effect : 'slide',
    //     prevButton:'.prev-btn',
    //     nextButton:'.next-btn',
    // })


    // 图片上传
    $('.fileupload').click(function () {
        $('.load-btn').fadeOut();
        $('.stage').css('opacity','1');
        $('.comp-tips').fadeIn();
        layer.open({type: 2});
    })
    var imgthis,x,y,w,h;
    var imgFace = '';
    yaoqi.upload.init("fileupload", {
        auto: true,
        url: "/api.php?t=face",
        urlParams: {type: 3},
        lrz: true,
        callback: function (data) {
            if (data.result != 200) {
                alert(data.error_message);
                $('.load-btn').fadeIn();
                $('.stage').css('opacity','0');
                $('.comp-tips').fadeOut();
                layer.closeAll();
            } else {
                console.log(data);
                console.log(data.result);
                console.log('人脸检测成功！');

                if (mod == 3 || mod == 5) {
                    x = data.faces[0].face_rectangle.left - 50;
                    w = data.faces[0].face_rectangle.width + 100;
                } else {
                    x = data.faces[0].face_rectangle.left - 20;
                    w = data.faces[0].face_rectangle.width + 40;
                }
                y = data.faces[0].face_rectangle.top - 35;
                h = data.faces[0].face_rectangle.height + 42;
                var imgArgu = '?x-oss-process=image/crop,x_' + x + ',y_' + y + ',w_' + w + ',h_' + h;
                imgFace = imgArgu;
                // console.log(imgFace);
                oss.start();
            }
        }
    });
    // 重新上传
    $('.reload-btn').click(function () {
        $('.load-btn').fadeIn();
        $('.stage').css('opacity','0');
        $('.comp-tips').fadeOut();
        $('.reload-btn').fadeOut();
        $('.upload').fadeOut(350);
        $('.year-page').fadeIn(350);
        stage.removeChild(bg);
        stage.removeChild(imgthis);
        stage.update();
    });

    var imgSrc;
    var originSrc;
    var oss = new yaoqi.uploadfile();
    oss.init("fileupload", {
        url: "/api.php?t=oss",
        lrz: true,
        urlParams:{path:"upfile/17_siwei_qixi/", url:"http://cdn5.iforce-media.com/"},
        callback: function (data) {
            if (data.result != 200) {
                alert(data.error_message);
                layer.closeAll();
                $('.load-btn').fadeIn();
                $('.stage').css('opacity','0');
                $('.comp-tips').fadeOut();
            } else {
                console.log(data);
                console.log(data.result);
                originSrc = data.url;
                imgSrc = data.url + imgFace;
                $('.reload-btn').fadeIn(350);
                console.log(imgSrc);

                console.log("-->缓存图片");
                oss.cacheImg(imgSrc, function (img) {

                    // $('.imgSrc').attr('src', img);
                    console.log("执行缓存图片");
                    layer.closeAll();
                    stage.removeChild(imgthis);
                    imgthis = new createjs.Bitmap(img);

                    setTimeout(function () {

                        var elePos;
                        if (mod == 1) {
                            elePos = {
                                x: 302,
                                y: 472,
                                w: 170,
                                h: 172
                            }
                        } else if (mod == 2) {
                            elePos = {
                                x: 275,
                                y: 360,
                                w: 178,
                                h: 190
                            }
                        } else if (mod == 3) {
                            elePos = {
                                x: 176,
                                y: 376,
                                w: 398,
                                h: 296
                            }
                        } else if (mod == 4) {
                            elePos = {
                                x: 220,
                                y: 425,
                                w: 335,
                                h: 306
                            }
                        } else if (mod == 5) {
                            elePos = {
                                x: 176,
                                y: 416,
                                w: 398,
                                h: 296
                            }
                        } else if (mod == 6) {
                            elePos = {
                                x: 256,
                                y: 342,
                                w: 182,
                                h: 196
                            }
                        }

                        imgthis.x = elePos.x;
                        imgthis.y = elePos.y;
                        imgthis.scaleX = elePos.w/w;
                        imgthis.scaleY = elePos.h/h;
                        imgthis.w = elePos.w;
                        imgthis.h = elePos.h;
                        console.log('scaleX: ' + imgthis.scaleX);
                        console.log('scaleY: ' + imgthis.scaleY);

                        stage.addChild(imgthis);
                        stage.swapChildren(bg, imgthis);
                        stage.update();
                    }, 200);

                })

            }

            // 上传图片的初始位置 放大倍数及旋转角度
            var elePos = {
                x: 200,
                y: 350,
                s: 1,
                a: 0,
                w: 150,
                h: 160
            }

            // 调整图片位置
            var scale = 1,
                angle = 0,
                gestureArea = document.getElementById('gesture-area'); //手势区域

            interact(gestureArea).gesturable({
                onstart: function(event) {

                },
                onmove: function(event) {
                    if (typeof imgthis == 'undefined') {
                        return
                    }
                    scale = scale * (1 + event.ds);
                    angle += event.da;

                    x = (parseFloat(elePos.x) || 0) + event.dx, y = (parseFloat(elePos.y) || 0) + event.dy;

                    elePos.x = x;
                    elePos.y = y;
                    elePos.s = scale;
                    elePos.a = angle;

                    imgthis.scaleX = elePos.s, imgthis.scaleY = elePos.s, imgthis.rotation = elePos.a, imgthis.x = elePos.x, imgthis.y = elePos.y;
                    stage.update();
                },
                onend: function(event) {}
            }).draggable({
                onmove: dragMoveListener
            });

            function dragMoveListener(event) {
                if (typeof imgthis == 'undefined') {
                    return;
                }

                x = (parseFloat(elePos.x) || 0) + event.dx, y = (parseFloat(elePos.y) || 0) + event.dy;
                s = (parseFloat(elePos.s) || 1), a = (parseFloat(elePos.a) || 0);

                imgthis.scaleX = elePos.s, imgthis.scaleY = elePos.s, imgthis.rotation = elePos.a, imgthis.x = elePos.x, imgthis.y = elePos.y;

                elePos.x = x;
                elePos.y = y;

                // console.log('***'+elePos.x);
                // console.log('***'+elePos.y);

                stage.update();
            }

            // 点击合成图片
            $('.comp-btn').click(function(){
                var getCanvas = document.getElementById('stageCanvas');
                var imgData = getCanvas.toDataURL("image/jpeg", 0.8);
                var yuanfen = mySwiper1.realIndex + 1;
                var img_url = "";

                // base64上传照片
                oss.upbase64(imgData, {
                    url: "/api.php?t=oss",
                    lrz: true,
                    urlParams:{path:"upfile/17_siwei_qixi/", url:"http://cdn5.iforce-media.com/"},
                    callback: function (data) {
                        if(data.result != 200){
                            alert(data.error_message);
                            return false;
                        }else{
                            img_url = data.url;

                            if(ms.getArg('type') == 1 && own_share !=1 ){
                                // 分享的页面
                                $.ajax({
                                    type: 'POST',
                                    url: "common.php",
                                    data: {
                                        get: 'mergeImg',
                                        uid:o_id,
                                        merge_img:img_url,
                                        img_id: ms.getArg('imgs'),
                                        year: yuanfen,
                                        origin:originSrc,
                                    },
                                    dataType: 'json',
                                    success: function(data) {
                                        if(data.status == 1){
                                            $('.show').attr('src', img_url);
                                            $('#check_btn').click(function(){
                                                show_img(2,data.res_id);
                                            })
                                        }else{
                                            layer.open({
                                                content: data.msg,
                                                btn: '确定'
                                            });
                                            if(data.status == -6){
                                                show_img(2,data.res_id);
                                            }
                                            return false;
                                        }
                                    },
                                    error: function(e) {
                                        layer.open({
                                            content: "网络不是很通畅，稍后再试哦！",
                                            btn: '确定'
                                        });
                                    }
                                });  

                            }else{
                                // 用户上传
                                $.ajax({
                                    type: 'POST',
                                    url: "common.php",
                                    data: {
                                        get: 'userImg',
                                        uid:o_id,
                                        img: img_url,
                                        year: yuanfen,
                                        origin:originSrc,
                                    },
                                    dataType: 'json',
                                    success: function(data) {
                                        if(data.status == 1){
                                            $('.show').attr('src', img_url);
                                            $('#check_btn').click(function(){
                                                show_img(1,data.res_id);
                                            })
                                        }else{
                                            layer.open({
                                                content: data.msg,
                                                btn: '确定'
                                            });
                                            return false;
                                        }
                                    },
                                    error: function(e) {
                                        layer.open({
                                            content: "网络不是很通畅，稍后再试哦！",
                                            btn: '确定'
                                        });
                                    }
                                });

                            }

                            
                        }
                    }
                })

                setTimeout(function() {
                    $('.upload').fadeOut(350);
                    $('.mod').fadeIn(350);
                }, 200)
            });
        }
    });

})

// 空数据判断
    function isOpenID(wxid) {
        if(wxid == null || typeof(wxid) == undefined || typeof(wxid) == null || wxid == "" || wxid <= 0 || wxid == "null" || wxid == "undefined") {
            return false;
        } else {
            return true;
        }
    }