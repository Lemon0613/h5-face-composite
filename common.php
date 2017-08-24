<?php
//session_start();
header("Content-type: text/html; charset=utf-8");
/*
  * 版本号 V3.0 H5 Ajax 后台处理文件。
  * 
   * */

$g = $_POST["get"];

include_once('../../Public/php/WX.class.php');

include_once('../../Public/php/MSDB-2.1.0.class.php');


$db = new MSDB();

if (empty($g)) {
    echo -99;
    exit;
}


$wx = new WX();

switch ($g) {
    // 关注账号
    case "setUser":
        echo setUser();
        break;

    // 上传图片
    case "userImg":
        echo userImg();
        break;

    // 上传配对照片
    case "mergeImg":
        echo mergeImg();
        break;

    // 个人中心
    case "userData":
        echo userData();
        break;

    // 用户点赞
    case "voteInfo":
        echo voteInfo();
        break;

    // 排行榜信息
    case "rankInfo":
        echo rankInfo();
        break;

    // 图片详情页
    case "imgInfo":
        echo imgInfo();
        break;

    // 单张图片的分享页信息
    case "singleShare":
        echo singleShare();
        break;

    // 提交图片
    case "submitImg":
        echo submitImg();
        break;
   
}

// 关注账号
function setUser()
{
    $code = $_POST["code"];
    if (!empty($code)) {

        // 通过 wx 内的 Get_user 函数 获取用户信息
        global $wx;
        global $db;
      
        $user = $wx->Get_user("2", $code);

        $img_data = array();
        // 分享页的图片信息
        if(!empty($_POST['type']) &&  !empty($_POST['img_id'])){
            if($_POST['type'] == 2){
                $img_data = getTwoImg($_POST['type'],$_POST['img_id']);
                if($img_data){
                    $list['imginfo'] = $img_data;
                }
            }
            if($_POST['type'] == 1){
                $img_data = getOneImg($_POST['type'],$_POST['img_id']);
                if($img_data){
                    if($user['openid'] == $img_data['img_user']){
                        $img_data['is_own'] = 1;
                    }else{
                        $img_data['is_own'] = 0;
                    }
                    unset($img_data['img_user']);
                    $list['imginfo'] = $img_data;
                }
            }
            
        }


        if (!empty($user["openid"])) {
            // 将用户信息写入数据库
            // 查询用户是否存在
            $table = "siwei_qixi_user";
            $map['openid'] = $user['openid'];
            $map['status'] = 1;
            $field = 'id';
            $user_uid = $db->table($table)->where($map)->getField($field);
            
            $ip = getip();
            if (!$user_uid) {
                // 添加新用户
                $data['openid'] = $user['openid'];
                $data['nickname'] = addslashes(NickName($user['nickname']));              
                $data['headimg_url'] = $user['headimgurl'];
                $data['sex'] = $user['sex'];
                $data['status'] = 1;
                $data['ip'] = $ip;
                $data['addtime'] = time();  
                $insert_id = $db->table($table)->insert($data);
                if ($insert_id) {
                    $user_uid = $insert_id;
                } else {
                    if($img_data){
                        return json_encode($list);
                    }else{
                       return -1;//用户数据写入失败 
                    }
                    
                }
            } else {
                // 老用户 更新信息
                unset($map);
                $map['id'] = $user_uid;
                $data['ip'] = $ip;
                $data['nickname'] = addslashes(NickName($user['nickname']));
                $data['headimg_url'] =  $user['headimgurl'];
                $data['sex'] = $user['sex'];
                $res = $db->table($table)->where($map)->update($data);     
        } 

            // 通过 $user["XX"] 获取用户信息。参考 微信网页授权 内的微信用户参数
            // 防止 openid 暴露， 通过加密后再返回前台。
            unset($map);
            $map['id'] = $user_uid;
            $user_info = $db->table($table)->where($map)->find();
            $list["openid"]=$wx->jiaOpenID($user["openid"]);
            $list["nickname"] = $user_info['nickname'];
            $list['img'] = $user_info['headimg_url'];
            $list['is_all'] = $user_info['is_all'];
            $list['status'] = 1;


            return json_encode($list);

        }else{
            if($img_data){
                return json_encode($list);
            }else{
               return "-2";//获取openID失败
            }
                
            }
    
} else {
            if($img_data){
                return json_encode($list);
            }else{
               return "-3";// 没有 code 参数；
            }
            
        }
}


// 用户上传图片
function userImg(){
    global $wx;
    global $db;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";

    if(empty($_POST['uid']) || empty($_POST['img'])){
        $return_info['status'] = -3;
        $return_info['msg'] = "参数错误";
        return json_encode($return_info);
    }

    $uid = $wx->jieOpenID($_POST['uid']);
    $u_info = getUser($table,$uid);
    if($u_info == -1){
        $return_info['status'] = -2;
        $return_info['msg'] = "非法数据";
        return json_encode($return_info);
    }

    $img_url = $_POST['img'];
    $data['uid'] = $u_info['id'];
    $data['img_url'] = $img_url;
    $data['status'] = 1;
    $data['year'] = $_POST['year'];
    $data['origin_url'] = $_POST['origin'];
    $res = $db->table($table1)->insert($data);
    if($res){
        $return_info['status'] = 1;
        $return_info['msg'] = "上传成功";
        $return_info['res_id'] = $res;
        // 更新用户表中的is_all字段 标识用户已有图片
        if($u_info['is_all'] == 0){
            $db->table($table)->where(array('id'=>$u_info['id']))->update(array('is_all'=>1));
        }
    }else{
        $return_info['status'] = 0;
        $return_info['msg'] = "上传失败,稍后再试";
    }
    return json_encode($return_info);
}


// 用户上传匹配图片 uid:用户id img_id:匹配的图片id   merge_img:上传配对图片的地址  year:上传的年份
function mergeImg(){
    global $wx;
    global $db;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";
    $table2 = "siwei_qixi_merge";

    if(empty($_POST['uid']) || empty($_POST['img_id']) || empty($_POST['merge_img'])){
        $return_info['status'] = -3;
        $return_info['msg'] = "参数错误";
        return json_encode($return_info);
    }

    $uid = $wx->jieOpenID($_POST['uid']);
    $u_info = getUser($table,$uid);
    if($u_info == -1){
        $return_info['status'] = -2;
        $return_info['msg'] = "非法数据";
        return json_encode($return_info);
    }

    $img_id = $_POST['img_id'];
    $img_url = $_POST['merge_img'];

    // 查询匹配原图片的信息
    $map['id'] = $img_id;
    $img_info = $db->table($table1)->where($map)->find();
    if(!$img_info){
        $return_info['status'] = -4;
        $return_info['msg'] = "原图已丢失,请重新选择匹配";
        return json_encode($return_info);
    }

    // 用户不能和自己的图片偏合成
    if($img_info['uid'] == $u_info['id']){
        $return_info['status'] = -5;
        $return_info['msg'] = "不能和自己的图片匹配";
        return json_encode($return_info);
    }

    // 查询是否已经和原图匹配过
    unset($map);
    $map['img_id'] = $img_id;
    $map['uid'] = $u_info['id'];
    $map['status'] = 1;
    $m_info = $db->table($table2)->where($map)->find();
    if($m_info){
        $return_info['status'] = -6;
        $return_info['msg'] = "您已匹配过该张图片,不可重复匹配";
        $return_info['res_id'] = $m_info['id'];
        return json_encode($return_info);
    }

    $year = $_POST['year'];
    $pre_array = array('80','90','95','100');
    $diff = abs($year-$img_info['year']);
    switch ($diff) {
        case 0:
           $pren = 100;
            break;
        case 1:
        case 2:
           $pren = 95;
            break;
        case 3:
        case 4:
           $pren = 90;
            break;   
        default:
            $pren = 80;
            break;
    }
    
    $merge_data['uid'] = $u_info['id'];
    $merge_data['merge_url'] = $img_url;
    $merge_data['img_id'] = $img_id;
    $merge_data['sid'] = $img_info['uid'];
    $merge_data['prence'] = $pren;
    $merge_data['create_time'] = date('Y-m-d H:i:s',time());
    $merge_data['status'] = 1;
    $merge_data['origin_url'] = $_POST['origin'];
    $res = $db->table($table2)->insert($merge_data);
    if($res){
        $return_info['status'] = 1;
        $return_info['msg'] = "匹配成功";
        $return_info['res_id'] = $res;
        // 更新用户表中的is_all字段 标识用户已有图片
        if($u_info['is_all'] == 0){
            $db->table($table)->where(array('id'=>$u_info['id']))->update(array('is_all'=>1));
        }
    }else{
        $return_info['status'] = 0;
        $return_info['msg'] = "匹配失败,请稍后再试";
    }
    return json_encode($return_info);

}


// 个人中心
function userData(){
    global $wx;
    global $db;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";
    $table2 = "siwei_qixi_merge";

    if(empty($_POST['uid'])){
        $return_info['status'] = -3;
        $return_info['msg'] = "参数错误";
        return json_encode($return_info);
    }

    $uid = $wx->jieOpenID($_POST['uid']);
    $u_info = getUser($table,$uid);
    if($u_info == -1){
        $return_info['status'] = -2;
        $return_info['msg'] = "非法数据";
        return json_encode($return_info);
    }

    // 查询用户上传图片
    $map['uid'] = $u_info['id'];
    $map['status'] = 1;
    $user_data = $db->table($table1)->where($map)->select();

    // 查询合成的图片
    // unset($map);
    // $map['sid'] = $u_info['id'];
    // $map['status'] = 1;
    // $merge_data = $db->table($table2)->where($map)->select();
    $sql = "select * from siwei_qixi_merge where (sid={$u_info['id']} or uid={$u_info['id']}) and status='1'";
    $res = $db->query($sql);
    $merge_data = $res->fetchAll(PDO::FETCH_ASSOC);

    foreach ($merge_data as $key => $val) {
        unset($map);
        // 查询匹配图片的用户id
        if($val['sid'] == $u_info['id']){
            $map['id'] = $val['uid'];
        }
        if($val['uid'] == $u_info['id']){
            $map['id'] = $val['sid'];
        }
        $merge_data[$key]['sid_img'] = $db->table($table)->where($map)->getField('headimg_url');
    }

    $data['self'] = $user_data;
    $data['merge'] = $merge_data;
    $return_info['data'] = $data;
    $return_info['uid_img'] = $u_info['headimg_url'];//用户自己的头像
    $return_info['status'] = 1;
    return json_encode($return_info);

}


// 用户点赞  uid:点赞用户id  img_id:点赞的合成图片id 2017.8.23——2017.8.28
function voteInfo(){
    global $wx;
    global $db;

    $table = "siwei_qixi_user";
    $table2 = "siwei_qixi_merge";
    $table3 = "siwei_qixi_vote";
    $end_time = strtotime('2017-08-28 23:59:59');
    if(time()>$end_time){
        $return_info['status'] = -5;
        $return_info['msg'] = "投票活动已结束";
        return json_encode($return_info);
    }

    if(empty($_POST['uid']) || empty($_POST['img_id'])){
        $return_info['status'] = -3;
        $return_info['msg'] = "参数错误";
        return json_encode($return_info);
    }

    $uid = $wx->jieOpenID($_POST['uid']);
    $u_info = getUser($table,$uid);
    if($u_info == -1){
        $return_info['status'] = -2;
        $return_info['msg'] = "点赞失败,稍后再试";
        return json_encode($return_info);
    }

    $img_id = $_POST['img_id'];
    $today_start = strtotime(date('Y-m-d').'00:00:00');
    $today_end = strtotime(date('Y-m-d').'23:59:59');
    
    $map['sid'] = $u_info['id'];
    $map['status'] = 1;
    $map['addtime'] = array('between ',$today_start.' and '.$today_end);
    $count = $db->table($table3)->where($map)->getField('count(id)');
    if($count >=8){
        // 今日已无投票机会
        $return_info['status'] = -4;
        $return_info['msg'] = "每个微信每天限投8票,请明日再来";
    }else{
        // 添加投票数据
        $vote_data['sid'] = $u_info['id'];
        $vote_data['merge_id'] = $img_id;
        $vote_data['addtime'] = time();
        $vote_data['ip'] = getip();
        $vote_data['status'] = 1;
        $res = $db->table($table3)->insert($vote_data);
        if($res){
            $return_info['status'] = 1;
            $return_info['msg'] = "投票成功";
            // 更新匹配图片表中的投票数
            $num = $db->table($table3)->where(array('merge_id'=>$img_id,'status'=>1))->getField('count(id)');
            $db->table($table2)->where(array('id'=>$img_id))->update(array('vote_num'=>$num));
        }else{
            $return_info['status'] = -4;
            $return_info['msg'] = "投票失败,稍后再试";
        }
    }

    return json_encode($return_info);
}


// 排行榜信息
function rankInfo(){
    global $db;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";
    $table2 = "siwei_qixi_merge";

    $map['status'] = 1;
    $map['vote_num'] = array('>',0);
    $page = $_POST['page_num'];
    $jump = ($page-1)*10;
    $rank_info = $db->table($table2)->where($map)->order(array('vote_num'=>'desc','id'=>'asc'))->limit($jump,10)->select();
    // 查询匹配的 原图和上传的用户信息
    $data = array();
    if($rank_info){
       foreach ($rank_info as $key => $val) {
            $img_url = $db->table($table1)->where(array('id'=>$val['img_id'],'status'=>1))->getField('img_url');
            $user_info = $db->table($table)->where(array('id'=>$val['sid'],'status'=>1))->getField('nickname');
            $data[$key]['nickname'] = $user_info;
            $data[$key]['vote_num'] = $val['vote_num'];
            $data[$key]['merge_id'] = $val['id'];
        } 
    }
    
    return json_encode($data);

}


// 图片详情页
function imgInfo(){
    global $db;
    global $wx;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";
    $table2 = "siwei_qixi_merge";

    if(empty($_POST['type']) || empty($_POST['img_id'])){
        $return_info['status'] = -3;
        $return_info['msg'] = "参数错误";
        return json_encode($return_info);
    }

    $uid = $wx->jieOpenID($_POST['uid']);
    $u_info = getUser($table,$uid);//登录的用户信息

    if($u_info == -1){
        $return_info['status'] = -2;
        $return_info['msg'] = "非法数据";
        return json_encode($return_info);
    }

    $type = $_POST['type'];
    $img_id = $_POST['img_id'];
    $num1 = substr(strtotime('2017-08-22 10:00:00'),3,4);
    $num2 = substr(strtotime('2017-08-22 10:00:00'),-3);
    switch ($type) {
        case 1:
            // img表中个人单张图片
            $rand_num = $num1.$u_info['id'].($num2+$u_info['id']);
            $map['id'] = $img_id;
            $img_info = $db->table($table1)->where($map)->find();
            $data['imgs'] = $img_info['img_url'];//图片地址
            $data['num'] = $rand_num;//编号
            $data['nickname'] = $u_info['nickname'];//昵称
            $data['headimg_url'] = $u_info['headimg_url'];//用户头像
            break;
        case 2:

            // 合成的图片
            $map['id'] = $img_id;
            $img_info = $db->table($table2)->where($map)->find();
            
            // 查询合成图片的上传用户
            unset($map);
            $map['id'] = $img_info['sid'];
            $user_info = $db->table($table)->where($map)->find();
            // 查询匹配的另一张图片的信息
            unset($map);
            $map['id'] = $img_info['img_id'];
            $match_img = $db->table($table1)->where($map)->getField('img_url');
            $data['img_left'] = $img_info['merge_url'];
            $data['img_right'] = $match_img;
            $data['num'] = $user_info['id'];
            $data['nickname'] = $user_info['nickname'];//昵称
            $data['prence'] = $img_info['prence'];
            $data['vote_num'] = $img_info['vote_num'];
            break;
        
        default:
            break;
    }
    $return_info['data'] = $data;
    $return_info['status'] = 1;
    return json_encode($return_info);
}

// 单张图片的分享页
function singleShare(){
    global $db;
    global $wx;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";
    $table2 = "siwei_qixi_merge";

    if(empty($_POST['type']) || empty($_POST['img_id'])){
        $return_info['status'] = -3;
        $return_info['msg'] = "参数错误";
        return json_encode($return_info);
    }

    $uid = $wx->jieOpenID($_POST['uid']);
    $u_info = getUser($table,$uid);
    if($u_info == -1){
        $return_info['status'] = -2;
        $return_info['msg'] = "非法数据";
        return json_encode($return_info);
    }

    $type = $_POST['type'];
    $img_id = $_POST['img_id'];
 
    // img表中个人单张图片
    if($type != 1){
        $return_info['status'] = -4;
        $return_info['msg'] = "非法请求";
        return json_encode($return_info);
    }

    $map['id'] = $img_id;
    $img_info = $db->table($table1)->where($map)->find();
    if($u_info['id'] == $img_info['uid']){
        $return_info['status'] = -5;
        $return_info['msg'] = "用户登陆自己的分享页";
        return json_encode($return_info);
    }

    $data['imgs'] = $img_info['img_url'];//图片地址
    $data['num'] = $img_info['uid'];//编号
    $data['nickname'] = $u_info['nickname'];//昵称
    $data['headimg_url'] = $u_info['headimg_url'];//用户头像
    
    $return_info['data'] = $data;
    $return_info['status'] = 1;
    return json_encode($return_info);
           
}

// 提交图片
function submitImg(){
     $img = $_POST['img'];
     $img = str_replace('data:image/png;base64,', '', $img);
     $img = str_replace(' ', '+', $img);
     $data = base64_decode($img);
     $file = './upload/' .time().'_'.rand(1,10000) . '.png';
     file_put_contents($file, $data);

}

// 查询分享页的图片数据
function getTwoImg($type,$imgid){
    global $db;
    global $wx;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";
    $table2 = "siwei_qixi_merge";

    // 合成的图片
    $map['id'] = $imgid;
    $img_info = $db->table($table2)->where($map)->find();
    
    // 查询合成图片的上传用户
    unset($map);
    $map['id'] = $img_info['sid'];
    $user_info = $db->table($table)->where($map)->find();
    // 查询匹配的另一张图片的信息
    unset($map);
    $map['id'] = $img_info['img_id'];
    $match_img = $db->table($table1)->where($map)->getField('img_url');
    $data['img_left'] = $img_info['merge_url'];
    $data['img_right'] = $match_img;
    $data['num'] = $user_info['id'];
    $data['nickname'] = $user_info['nickname'];//昵称
    $data['prence'] = $img_info['prence'];
    $data['vote_num'] = $img_info['vote_num'];
    return $data;
}


// 查询单张图片
function getOneImg($type,$img_id){
    global $db;
    global $wx;

    $table = "siwei_qixi_user";
    $table1 = "siwei_qixi_img";

    // 图片信息
    $map['id'] = $img_id;
    $img_info = $db->table($table1)->where($map)->find();

    $num1 = substr(strtotime('2017-08-22 10:00:00'),3,4);
    $num2 = substr(strtotime('2017-08-22 10:00:00'),-3);

    unset($map);
    $user_info = $db->table($table)->where(array('id'=>$img_info['uid']))->find();//图片用户信息
    $rand_num = $num1.$user_info['id'].($num2+$user_info['id']);//编号
    $data['imgs'] = $img_info['img_url'];//图片地址
    $data['num'] = $rand_num;//编号
    $data['nickname'] = $user_info['nickname'];//昵称
    $data['headimg_url'] = $user_info['headimg_url'];//用户头像
    $data['img_user'] = $user_info['openid'];
    return $data;
}


// 查询是否有用户信息
function getUser($table,$id){
    global $wx;
    global $db;

    $map['openid'] = $id;
    $map['status'] = 1;
    $info = $db->table($table)->where($map)->find();
    if($info){
        return $info;
    }else{
        return -1;
    }
}




// 获取用户ip
function getip()
{
    $unknown = 'unknown';
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])
        && $_SERVER['HTTP_X_FORWARDED_FOR']
        && strcasecmp($_SERVER['HTTP_X_FORWARDED_FOR'],
            $unknown)
    ) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (isset($_SERVER['REMOTE_ADDR'])
        && $_SERVER['REMOTE_ADDR'] &&
        strcasecmp($_SERVER['REMOTE_ADDR'], $unknown)
    ) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }

    return $ip;
}



function NickName($str){
    return preg_replace('/[\x{10000}-\x{10FFFF}]/u','',$str);   
}

?>