/**
 * 模板文件业务代码
 */
define(function(require, exports, module) {
    var s = require('jsonselect'); // 工具类
    var g = require('global'); // 工具类
    var utils = require('utils/utils');
    var tpHelper = require('tpHelper'); // 用于模版模块生成的工具类，请慎重删除，___template___ 可能会用到
    module.exports = {
        init: function(par, indexs, pointArr, cameraIds, imgpath) {
            //搜索参数=======================================
            var params = {};
            var p = {};
            for (var i = 0; i < par.length; i++) {
                Object.keys(par[i]).forEach(function(item, index) {
                    p[item] = par[i][item];
                })
            };
            params.img = imgpath;
            //console.log(params);
            var URL;
            //是否上传图片
            if (params.img !== "") {
                URL = g.urlFile;
            } else {
                URL = g.URL;
            }
            //搜车 0  搜人1
            if (indexs) {
                URL = g.URL;//测试
                params.tag = p;
                params.type = "pedestrian";
            } else {
                URL = g.URL1;//测试
                params = p;
                params.type = "vehicle";
            };
            params.video = cameraIds.join(",");
            $.ajax({
                    url: URL,
                    type: 'get',//测试
                    dataType: 'json',//测试
                    //jsonpCallback: "callback" + Math.random().toString().substr(2, 6),
                    data: params
                })
                .done(function(data) {
                    var lng = s.match(".position .lng", data.data.left_data),
                        lat = s.match(".position .lat", data.data.left_data),
                        rightimgPath = s.match(".right_data", data.data)[0],
                        lefttimgPath = s.match(".position ~.img_path", data.data.left_data),
                        cameraId = s.match(".id", data.data.left_data),
                        thisImgDetail = s.match(".right_data", data.data)[0],
                        cameraId1 = cameraIds;
                    //标注数组
                    var lables = [],
                        imgs = [];
                    for (var i = 0; i < cameraId.length; i++) {
                        lables.push("<img width='100%' data-id='" + cameraId[i] + "' height='100%' src='" + lefttimgPath[i] + "' alt=''>");
                        imgs.push("/icons/videos.png?" + cameraId[i]);
                    }
                    //摄像头位置
                    var map = new BMap.Map('map'),
                        poi = new BMap.Point(116.404, 39.915); //初始化地图中心点;
                    map.centerAndZoom(poi, 12); //地图初始化显示比例
                    map.enableScrollWheelZoom(); //鼠标滚路缩放事件
                    var arr = g.pointDeal(lng, lat),
                        arr1 = g.strToarr(window.localStorage.pointArr),
                        videoHtml = require("src/template/video").render(),
                        markerConfig = {
                            id: cameraId,
                            map: map,
                            str: videoHtml,
                            arr: arr,
                            mark: lables,
                            imgs: imgs,
                            photoConfig: { //头像mark设置
                                borderColor: "#efefef",
                                width: "60px",
                                height: "60px",
                                color: "#fff",
                                textAlign: "center",
                                lineHeight: "60px",
                                backgroundColor: "#efefef",
                            }
                        },
                        markerConfig1 = {
                            id: cameraId1,
                            map: map,
                            arr: arr1,
                            imgs: "/icons/marker.png"
                        };
                    //画点
                    g.autoPoint(markerConfig1);
                    //划线
                    //console.log(params);
                    g.autoLines(markerConfig, params);

                    //显示搜索列表
                    $("#searchCar").fadeOut();
                    $("#searchList").animate({
                        width: "400"
                    }, 400, function() {
                        $("#searchList").html(require("src/template/searchList").render(rightimgPath));
                        //二次搜索，点击右侧图片==================================================================/
                        var myScroll = new IScroll('#wrapper', {
                            scrollbars: true,
                            mouseWheel: true
                        });
                        $(document).on('click', "#lister li", function(event) {
                            var dataImg = $(this).find("img").attr("data-img");
                            params.img = $(this).find("img").attr("src");
                            $.ajax({
                                    url: URL,
                                    type: 'get',//测试
                                    dataType: 'json',//测试
                                    //jsonpCallback: "callback" + Math.random().toString().substr(2, 6),
                                    data: params
                                })
                                .done(function(data) {
                                    var lng = s.match(".position .lng", data.data.left_data),
                                        lat = s.match(".position .lat", data.data.left_data),
                                        lefttimgPath = s.match(".id ~.img_path", data.data.left_data),
                                        cameraId1 = cameraIds,
                                        cameraId = s.match(".id", data.data.left_data),
                                        thisImgDetail = s.match(".right_data", data.data)[0];
                                    //标注数组
                                    var lables = [],
                                        imgs = [];
                                    for (var i = 0; i < cameraId.length; i++) {
                                        lables.push("<img width='100%' data-id='" + cameraId[i] + "' height='100%' src='" + lefttimgPath[i] + "' alt=''>");
                                        imgs.push("/icons/videos.png?" + cameraId[i]);
                                    }
                                    //摄像头位置
                                    map.clearOverlays();
                                    var arr = g.pointDeal(lng, lat),
                                        arr1 = g.strToarr(window.localStorage.pointArr),
                                        videoHtml = require("src/template/video").render(),
                                        markerConfig = {
                                            id: cameraId,
                                            map: map,
                                            str: videoHtml,
                                            arr: arr,
                                            mark: lables,
                                            imgs: imgs,
                                            photoConfig: { //头像mark设置
                                                borderColor: "#efefef",
                                                width: "60px",
                                                height: "60px",
                                                color: "#fff",
                                                textAlign: "center",
                                                lineHeight: "60px",
                                                backgroundColor: "#efefef",
                                            }
                                        },
                                        markerConfig1 = {
                                            id: cameraId1,
                                            map: map,
                                            arr: arr1,
                                            imgs: "/icons/marker.png"
                                        };
                                    //画点
                                    g.autoPoint(markerConfig1);
                                    //划线
                                    g.autoLines(markerConfig, params);
                                    //详情信息
                                    if (indexs) {
                                        $("#detail").html(require("src/template/listDetail").render(thisImgDetail[dataImg]));
                                    } else {
                                        $("#detail").html(require("src/template/carlistDetail").render(thisImgDetail[dataImg]));
                                    };
                                    $("#detail").show();
                                    setTimeout(function() {
                                        myScroll.refresh();
                                    }, 400);
                                });
                        });
                        // 加载更多
                        params.page = 1;
                        $(document).on('click', "#lastli", function(event) {
                            ++params.page;
                            $.ajax({
                                    url: URL + "1/test/1", // 加载更多
                                    type: 'post',
                                    dataType: 'jsonp',
                                    jsonpCallback: "callback" + Math.random().toString().substr(2, 6),
                                    data: params
                                })
                                .done(function(data) {
                                    var lng = s.match(".position .lng", data.data.left_data),
                                        lat = s.match(".position .lat", data.data.left_data),
                                        rightimgMore = s.match(".right_data", data.data),
                                        cameraId1 = cameraIds,
                                        cameraId = s.match(".id", data.data.left_data);
                                    $("#lister").html(require("src/template/listMore").render(rightimgMore[0]));
                                    setTimeout(function() {
                                        myScroll.refresh();
                                    }, 400);
                                    //重新加载点击事件
                                    /* $(document).on('click', "#searchList li img", function(event) {
                                         var dataImg = $(this).attr("data-img");
                                         params.img = $(this).attr("src");
                                         //console.log(params);
                                         $.ajax({
                                                 url: URL + "1/test/1",
                                                 type: 'post',
                                                 dataType: 'jsonp',
                                                 jsonpCallback: "callback" + Math.random().toString().substr(2, 6),
                                                 data: params
                                             })
                                             .done(function(data) {
                                                 var lng = s.match(".position .lng", data.data.left_data),
                                                     lat = s.match(".position .lat", data.data.left_data),
                                                     lefttimgPath = s.match(".id ~ .img_path", data.data.left_data),
                                                     cameraId1 = cameraIds,
                                                     cameraId = s.match(".id", data.data.left_data);
                                                 //标注数组
                                                 var lables = [],
                                                     imgs = [];
                                                 for (var i = 0; i < cameraId.length; i++) {
                                                     lables.push("<img width='100%' data-id='" + cameraId[i] + "' height='100%' src='" + lefttimgPath[i] + "' alt=''>");
                                                     imgs.push("/icons/videos.png?" + cameraId[i]);
                                                 }
                                                 //摄像头位置
                                                 map.clearOverlays();
                                                 var arr = g.pointDeal(lng, lat),
                                                     arr1 = g.strToarr(window.localStorage.pointArr),
                                                     videoHtml = require("src/template/video").render(),
                                                     markerConfig = {
                                                         id: cameraId,
                                                         map: map,
                                                         str: videoHtml,
                                                         arr: arr,
                                                         mark: lables,
                                                         imgs: imgs,
                                                         photoConfig: { //头像mark设置
                                                             borderColor: "#efefef",
                                                             width: "60px",
                                                             height: "60px",
                                                             color: "#fff",
                                                             textAlign: "center",
                                                             lineHeight: "60px",
                                                             backgroundColor: "#efefef",
                                                         }
                                                     },
                                                     markerConfig1 = {
                                                         id: cameraId1,
                                                         map: map,
                                                         arr: arr1,
                                                         imgs: "/icons/marker.png"
                                                     };
                                                 //画点
                                                 g.autoPoint(markerConfig1);
                                                 //划线
                                                 g.autoLines(markerConfig, params);
                                             });
                                         //详情信息
                                         $("#detail").html(require("src/template/listDetail").render(thisImgDetail[0][dataImg]));
                                         $("#detail").show();
                                         setTimeout(function() {
                                             myScroll.refresh();
                                         }, 400);
                                     });*/
                                });
                        });

                    });
                    //隐藏搜索条件
                    $("#searchMan").fadeOut(600);
                })
                .fail(function(data) {
                    console.log("error");
                })
        },
        render: function(data) {
            return ___template___(data);
        }
    }
});