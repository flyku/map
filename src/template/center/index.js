/**
 * 模板文件业务代码
 */
define(function(require, exports, module) {
    var s = require('jsonselect'); // 工具类
    var g = require('global'); // 工具类
    var utils = require('utils/utils');
    var tpHelper = require('tpHelper'); // 用于模版模块生成的工具类，请慎重删除，___template___ 可能会用到
    module.exports = {
        init: function(cameraId, params) {
            //二次搜索，点击列表图片==================================================================/
            $(".bg").on('click', function(event) {
                $.ajax({
                        url: g.URL,
                        type: 'GET',
                        dataType: 'json',
                        //jsonpCallback: "callback" + Math.random().toString().substr(2, 6),
                        data: params
                    })
                    .done(function(data) {
                        $("#center").css({
                            display: 'none'
                        }).animate({
                            width: '0px'
                        }, 1000);
                        //地图对象
                        var lng = s.match(".position .lng", data.data.left_data),
                            lat = s.match(".position .lat", data.data.left_data),
                            lefttimgPath = s.match(".id ~.img_path", data.data.left_data),
                            cameraIds = s.match(".id", data.data.left_data);
                        //标注数组
                        var lables = [],
                            imgs = [];
                        for (var i = 0; i < cameraIds.length; i++) {
                            if (cameraIds[i] == cameraId) {
                                lables.push("<img width='100%' data-id='" + cameraIds[i] + "' height='100%' src='" + window.localStorage.srcs + "' alt=''>")
                            } else {
                                lables.push("<img width='100%' data-id='" + cameraIds[i] + "' height='100%' src='" + lefttimgPath[i] + "' alt=''>");
                            }
                            imgs.push("/icons/videos.png?" + cameraIds[i]);
                        }
                        //摄像头位置 
                        var map = new BMap.Map('map'),
                            poi = new BMap.Point(116.404, 39.915); //初始化地图中心点;
                        map.centerAndZoom(poi, 12); //地图初始化显示比例
                        map.enableScrollWheelZoom(); //鼠标滚路缩放事件
                        map.clearOverlays();
                        console.log(cameraId);
                        var arr = g.pointDeal(lng, lat),
                            arr1 = window.localStorage.pointArr.split(","),
                            cameraId1 = params.video.split(","),
                            videoHtml = require("src/template/video").render(),
                            markerConfig = {
                                id: cameraIds,
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
                        require("src/template/center").init();
                        window.localStorage.srcs = "";
                    });
            });
        },
        render: function(data) {
            return ___template___(data);
        }
    }
});