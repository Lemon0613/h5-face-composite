<?php

/**
 * Created by msxiehui on 2017/8/16.
 * Date:2017/8/16
 * Time:19:15
 * Email:msxiehui@163.com
 * VERSION:0.1
 *北京耀启网络科技有限公司
 *北京百孚思传实网络营销机构
 *
 */

//以参数 t 区分具体接口
if (!isset($_GET["t"])) {
    die();
}

switch ($_GET["t"]) {
    case "face":
//        判断是否是POSt请求，如果不是，返回错误代码
        if (!getIsPostRequest()) {die();}

        if(!isset($_POST["type"])){
            //参数错误。
            $return_list["result"]="4002";
            $return_list["error_message"]="参数错误";
            echo json_encode($return_list);
            die();
        }

        echo face($_POST["type"]);
        break;
    case "oss":
        if (!getIsPostRequest()) {die();}
        echo toOSS();
        break;
    default:
        echo "none";
}



function face($type)
{
    include_once("Public/php/api/Face.class.php");
    $f = new \YaoQi\Face();
    $landmark=isset($_POST["landmark"])?$_POST["landmark"]:0;
    $attributes=isset($_POST["attributes"])?$_POST["attributes"]:"none";

    switch ($type){
        case "1":
            if(!isset($_POST["url"])){
                $return_list["result"]="40021";
                $return_list["error_message"]="参数错误";
                return json_encode($return_list);
            }
            return $f->getFace_url();
            break;
        case "2":
            if(!isset($_POST["img"])){
                //参数错误。
                $return_list["result"]="40022";
                $return_list["error_message"]="参数错误";
                return json_encode($return_list);
            }
            $str=$_POST["img"];
            $imgbase=explode(",",$str);
            if(count($imgbase)<2){
                $return_list["result"]="40023";
                $return_list["error_message"]="参数错误";
                return json_encode($return_list);
            }
            return $f->getFace_base64($imgbase[1],$landmark,$attributes);
            break;
        case "3":
            $fs=getFlie();
            if($fs["result"]==200){
                return $f->getFace_file($fs["files_name"],$landmark,$attributes);
            }else{
                return json_encode($fs);
            }

            break;
        default:
//            return $f->getFace_flie_post();
            break;
    }
}

function toOSS(){

    $fs=getFlie();
    if($fs["result"]==200){
        include_once("Public/php/api/ToOSS.class.php");
        $oss = new \YaoQi\ToOSS();
        $str=microtime(true);
        $str=str_replace(".",'_',$str);

        isset($_POST["bucket"])?$bucket=$_POST["bucket"]:$bucket="bfscdn";
        isset($_POST["path"])?$path=$_POST["path"]:$path="/";
        isset($_POST["url"])?$url=$_POST["url"]:$url="http://cdn.iforce-media.com/";

        $name = $path.$str.'_'.rand(1,1000).'_'.$_FILES["file"]["name"];
//        return $_FILES["file"]["name"];
        $oss->uploadFile($bucket,$fs["files_name"],$name);
        $return_list["result"]="200";
        $return_list["url"]=$url.$name;

        return json_encode($return_list);
    }else{
        return json_encode($fs);
    }
}


/**
 * 判断是否是 POST访问
 * @return bool
 */
function getIsPostRequest()
{
    return isset($_SERVER['REQUEST_METHOD']) && !strcasecmp($_SERVER['REQUEST_METHOD'], 'POST');
}

/**
 * 判断 $_FILES["file"] 是否存在。并且查询格式和大小是否超出限制。
 * @param string $imgType  默认为 image/jpeg,image/jpg,image/png
 * @param int $size 默认为  1024*1024*5 5M
 * @return mixed
 */
function getFlie($imgType="image/jpeg,image/jpg,image/png",$size=5242880){
    if (!isset($_FILES["file"])) {
        $return_list["result"]="4001";
        $return_list["error_message"]="没有获取到文件信息";
        return $return_list;
    }

    if ($_FILES["file"]["error"] > 0) {
        $return_list["result"]="4002";
        $return_list["error_message"]="文件有错误";
        return $return_list;
    }
//    禁止使用 ===true 当查找的字符位置为0 时，会出错。
    if(strpos($imgType,$_FILES["file"]["type"])!==false){}else{
        $return_list["result"]="4003";
        $return_list["error_message"]="文件格式错误";
        return $return_list;
    }
    if($_FILES["file"]["size"] > $size){
        $return_list["result"]="4004";
        $return_list["error_message"]="文件体积大于限制";
        return $return_list;
    }
    if($_FILES["file"]["name"]=="blob"){
        $name=explode("/",$_FILES["file"]["type"]);
        count($name)>1?$name=".".$name[1]:$name=".jpg";
        $_FILES["file"]["name"]=time().$name;
    }
    $return_list["result"]="200";
    $return_list["files_name"]=$_FILES["file"]["tmp_name"];
    return $return_list;
}
