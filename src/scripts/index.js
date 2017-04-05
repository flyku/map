/**
 * @date 16-12-2016
 * @describe:
 * @author: flyku
 * @version: 1.0.0
 */
define(function(require, exports) {
	var $ = require('jquery');
	var g = require('global');
	var s = require('jsonselect');
	var searchMan = require("src/template/searchMan");
	$(function() {
		$("#loGo").on("mousedown", function() {
			$(this).find("div").show();
		})
		$("#loGo").on("mouseup", function() {
			$(this).find("div").hide();
		});
		// 百度地图API功能
		var map = new BMap.Map('map'),
			overlays = [],
			poi = new BMap.Point(116.404, 39.915), //初始化地图中心点
			styleOptions = { //绘制圆形样式设置
				strokeColor: "#12bac8", //边线颜色。
				fillColor: "#12bac8", //填充颜色。当参数为空时，圆形将没有填充效果。
				strokeWeight: 2, //边线的宽度，以像素为单位。
				strokeOpacity: 1, //边线透明度，取值范围0 - 1。
				fillOpacity: 0.5, //填充的透明度，取值范围0 - 1。
				strokeStyle: 'dashed' //边线的样式，solid或dashed。
			},
			//实例化鼠标绘制工具
			drawingManager = new BMapLib.DrawingManager(map, {
				isOpen: false, //是否开启绘制模式
				//enableDrawingTool: true, //是否显示工具栏
				drawingToolOptions: {
					anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
					offset: new BMap.Size(5, 5), //偏离值
				},
				circleOptions: styleOptions, //圆的样式
				polylineOptions: styleOptions, //线的样式
				polygonOptions: styleOptions, //多边形的样式
				rectangleOptions: styleOptions //矩形的样式
			});
		map.centerAndZoom(poi, 12); //地图初始化显示比例
		map.enableScrollWheelZoom(); //鼠标滚路缩放事件
		//添加鼠标绘制工具监听事件，用于获取绘制结果,  并获取绘制的圆心和半径
		drawingManager.addEventListener('overlaycomplete', function(e, overlay) {
			overlays.push(e.overlay);
			if (e.drawingMode === "circle") {
				//var url = 'http://10.101.6.26:8092/Home/Search/getCamera?lng=' + e.overlay.getCenter().lng + "&lat=" + e.overlay.getCenter().lat + "&dis=" + e.overlay.getRadius();
				/*$.ajax({
						url: url,
						type: 'get',
						dataType: 'jsonp',
						jsonpCallback: "callback"
					})
					.done(function(data) {
						var lng = s.match(".longitude", data.data);
						var lat = s.match(".latitude", data.data);
						var arr = g.pointDeal(lng, lat);
						var cameraId = s.match(".id", data.data);
						var markerConfig = {
							id: cameraId,
							map: map,
							str: "",
							arr: arr,
							mark: "",
							imgs: "/icons/marker.png", //摄像头的图标
						};
						window.localStorage.pointArr = arr;
						//摄像头位置
						g.cicleLine(markerConfig);
						//搜索条件an
						searchMan.init(arr, cameraId);
					})
					.fail(function() {
						console.log("error");
					})
					.always(function() {
						console.log("complete");
					});*/
				var url = "json/camera.json";
				$.ajax({
						url: url,
						type: 'get',
						dataType: 'json'
					})
					.done(function(data) {
						var lng = s.match(".longitude", data.data);
						var lat = s.match(".latitude", data.data);
						var arr = g.pointDeal(lng, lat);
						var cameraId = s.match(".id", data.data);
						var markerConfig = {
							id: cameraId,
							map: map,
							str: "",
							arr: arr,
							mark: "",
							imgs: "/icons/marker.png", //摄像头的图标
						};
						window.localStorage.pointArr = arr;
						//摄像头位置
						g.cicleLine(markerConfig);
						//搜索条件an
						searchMan.init(arr, cameraId);
					})
					.fail(function() {
						console.log("error");
					})
					.always(function() {
						console.log("complete");
					});
			};
			//清除覆盖物
			map.removeOverlay(e.overlay);
		});

		//标注数组
		var mark = ["起点", "途径点", "<img width='100%' height='100%' src='/icons/marker.png' alt=''>"];
		//坐标点经纬度
		//画圆 
		$("#loGo").off().on("click", function(event) {
			g.cicles(drawingManager);
		});
		//清除圆形
		$(".inputss").on("click", function(event) {
			g.clearAll(map, overlays);
		});
		//小图标marker点击事件
		$(".road").on("click", function(event) {
			//g.autoLine(markerConfig); //路线规划
		});

	})
});