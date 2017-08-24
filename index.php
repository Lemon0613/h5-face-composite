<?php
//项目入口页面
error_reporting(0);
header("Content-type: text/html; charset=utf-8");

//授权微信的  appid 微信公众号的网页授权 域名为下方 wxUrl 的域名。
$appid="wxaf38679dff6b5e50";

// 授权方式： snsapi_base  静默    snsapi_userinfo  弹窗
// $scope="snsapi_userinfo";

// 公众号授权的域名 中间 跳转地址。微信授权后获取 code  带上code 跳转回 backUrl ;
$wxUrl="http://wx.iforce-media.com/bfscs_api/url.php";
//如果客户无法将域名修改成我方域名，则将 go.html 文件，放置对方授权的域名服务器内.如下：。
// $wxUrl="http://csdemo.dreaminheart.com/csDemo/go.html";


//项目真实页面 微信授权后，带上code 返回此页面。
// 静默授权

$scope="snsapi_userinfo";
// $scope="snsapi_base";
if(!empty($_GET['imgs']) && !empty($_GET['type'] && $_GET['type']==2)){
	// 分享的为两人匹配的照片 进入分享页
	$backUrl="http://".$_SERVER["HTTP_HOST"]."/2017/siwei_qixi/share.html";
}else{
	// 分享的为单人合成图片或主页 进入首页
	$backUrl="http://".$_SERVER["HTTP_HOST"]."/2017/siwei_qixi/game.html";
}





//获取所有Get 参数 并且带给 backUrl
$tiao=$_SERVER['QUERY_STRING'];

echo '<script>
		var url="'.$wxUrl.'?url='.$backUrl.'?'.$tiao."&t=".time().'";			
		var open="https://open.weixin.qq.com/connect/oauth2/authorize?appid='.$appid.'&redirect_uri="+encodeURIComponent(url)+"&response_type=code&scope='.$scope.'&state=yuyan#wechat_redirect"					
		console.log(open);
		window.location=open;
	</script>
	';

?>