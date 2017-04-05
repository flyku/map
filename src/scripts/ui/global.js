/**
 * @describe: 全局使用的方法，业务逻辑等
 */
define(function(require, exports, module) {
	var s = require("jsonselect");
	module.exports = {
		urlFile: "http://10.101.6.26:8092/Home/Search/searchEs1/test/1",
		urlVideo: "http://10.101.6.26:8092/Home/Index/search2",
		//URL: "http://10.101.6.26:8092/Home/Search/searchEs",
		URL: "json/manJson.json",
		URL1: "json/carJson.json",
		strToarr: function(str) {
			var arr = [];
			for (var i = 0; i <= str.split(",").length - 1; i++) {
				if (i % 2 == 0) {
					arr.push([str.split(",")[i], str.split(",")[i + 1]]);
				}
			}
			return arr;
		},
		setStorage: function(key, val) {
			if (window.localStorage) {
				window.localStorage.setItem(key, val);
			}
		},
		getStorage: function(key) {
			if (window.localStorage) {
				return window.localStorage.getItem(key);
			}
			return null;
		},
		format: function(str, obj) {
			return str.replace(/#\[(.*?)\]/g, function($0, $1) {
				return obj[$1] === undefined || obj[$1] === false ? "" : obj[$1];
			});
		},
		pointDeal: function(arr1, arr2) {
			var arrs = [];
			for (var i = 0; i < arr1.length; i++) {
				arrs.push([arr1[i], arr2[i]]);
			}
			return arrs;
		},
		//画圆
		cicles: function(drawingManager) {
			//绘画图形
			function draw(type) {
				drawingManager.open();
				drawingManager.setDrawingMode(type);
			};
			drawingManager.open();
			draw(BMAP_DRAWING_CIRCLE);
			//完成时事件
			drawingManager.addEventListener("circlecomplete", function(e, overlay) {
				drawingManager.close(); //关闭绘画功能
			});
		},
		/**
		 * [规划路线]
		 * @param  {[type]} map  [map对象]
		 * @param  {[type]} str  [弹窗内容]
		 * @param  {[type]} arr  [经纬度数组]
		 * @param  {[type]} mark [标注数组]
		 * @return {[type]} imgs [图标路径]
		 */
		cicleLine: function(markerConfig) {
			/**
			 * [处理经纬度二维数组]
			 * @param  {[type]} arr [传入数组]
			 * @return {[type]}     [description]
			 */
			function pointDeal(arr) {
				var arrs = [];
				for (var i = 0; i < arr.length; i++) {
					arrs.push(new BMap.Point(arr[i][0], arr[i][1]));
				}
				return arrs;
			};
			var info = []; //存放提示信息窗口对象的数组
			arr = pointDeal(markerConfig.arr); //处理经纬度为百度坐标点
			markerConfig.map.clearOverlays(); //清除地图上所有的覆盖物
			////WalkingRoute    DrivingRoute判断是否骑车--连线
			var icon = new BMap.Icon(markerConfig.imgs, new BMap.Size(62, 40));
			for (var i = 0; i < arr.length; i++) {
				var marker = new BMap.Marker(arr[i], {
					icon: icon
				});
				label = new BMap.Label(markerConfig.id[i], {
					offset: new BMap.Size(20, 0)
				}); //创建marker点的标记,这里注意下,因为百度地图可以对label样式做编辑,
				　　　　　　　　　　
				label.setStyle({
					display: "none"
				}); //对label 样式隐藏     
				marker.setLabel(label); //把label设置到maker上  
				markerConfig.map.addOverlay(marker);
			};
		},
		autoPoint: function(markerConfig) {
			/**
			 * [处理经纬度二维数组]
			 * @param  {[type]} arr [传入数组]
			 * @return {[type]}     [description]
			 */
			function pointDeal(arr) {
				var arrs = [];
				for (var i = 0; i < arr.length; i++) {
					arrs.push(new BMap.Point(arr[i][0], arr[i][1]));
				}
				return arrs;
			};
			arr = pointDeal(markerConfig.arr); //处理经纬度为百度坐标点
			var icon = new BMap.Icon(markerConfig.imgs, new BMap.Size(62, 40));
			for (var i = 0; i < arr.length; i++) {
				var marker = new BMap.Marker(arr[i], {
					icon: icon
				});
				label = new BMap.Label(markerConfig.id[i], {
					offset: new BMap.Size(20, 0)
				}); //创建marker点的标记,这里注意下,因为百度地图可以对label样式做编辑,
				label.setStyle({
					display: "none"
				}); //对label 样式隐藏     
				marker.setLabel(label); //把label设置到maker上  
				markerConfig.map.addOverlay(marker);
			};
		},
		autoLines: function(markerConfig, params) {
			/**
			 * [处理经纬度二维数组]
			 * @param  {[type]} arr [传入数组]
			 * @return {[type]}     [description]
			 */
			function pointDeal(arr) {
				var arrs = [];
				for (var i = 0; i < arr.length; i++) {
					arrs.push(new BMap.Point(arr[i][0], arr[i][1]));
				}
				return arrs;
			};

			//点击窗口
			function addInfo(txt, marker, lables, params) {
				marker.addEventListener("click", function(e, id) {
					//获取摄像头id
					console.log(e.target.getLabel());
					var cameraId = e.target.getLabel().content;
					console.log("global", cameraId);
					//视频播放
					$("#video").css({
						display: 'block'
					});
					$("#video").animate({
						width: "600"
					}, 100, function() {});
					$("#video").html(require("src/template/video").render());
					setTimeout(require("src/template/video").init(cameraId, params), 3000);
				});
				lables.addEventListener("click", function() {
					var that = this;
					//列表弹出
					$("#center").css({
						display: 'block'
					}).animate({
						width: '760px'
					}, 1000);
					
					$.ajax({
							url: "json/carJson.json",
							type: 'get',
							dataType: 'json',
							//jsonpCallback: "callback" + Math.random().toString().substr(2, 6),
							data: params
						})
						.done(function(data) {
							//搜索图片列表，（第一次的）photo列表
							var cameraId = $(that.content).attr("data-id");
							data = data.data.left_data[cameraId].tracks.img_path;
							$("#center").html("");
							setTimeout(function() {
								$("#center").html(require("src/template/center").render(data));
								require("src/template/center").init(cameraId, params);
							}, 400);
						})

				});
			};
			arr = pointDeal(markerConfig.arr); //处理经纬度为百度坐标点
			//markerConfig.map.clearOverlays(); //清除地图上所有的覆盖物
			////WalkingRoute    DrivingRoute判断是否骑车--连线
			if (true) {
				var driving = new BMap.WalkingRoute(markerConfig.map); //创建步行实例
			} else {
				var driving = new BMap.WalkingRoute(markerConfig.map); //创建驾车实例
			}
			for (var i = 0; i < arr.length - 1; i++) {
				driving.search(arr[i], arr[i + 1]);
			};
			if (arr.length == 1) {
				var icon = new BMap.Icon(markerConfig.imgs, new BMap.Size(62, 40));
				for (var i = 0; i < arr.length; i++) {
					var marker = new BMap.Marker(arr[i], {
						icon: icon
					});
					label = new BMap.Label(markerConfig.id[i], {
						offset: new BMap.Size(20, 0)
					}); //创建marker点的标记,这里注意下,因为百度地图可以对label样式做编辑,
					　　　　　　　　　　
					label.setStyle({
						display: "none"
					}); //对label 样式隐藏     
					marker.setLabel(label); //把label设置到maker上  
					markerConfig.map.addOverlay(marker);
					var lables = new BMap.Label(markerConfig.mark[i], {
						position: arr[i]
					});
					// 创建信息窗口对象
					addInfo(markerConfig.str, marker, lables, params);
					lables.setStyle(markerConfig.photoConfig);
					markerConfig.map.addOverlay(lables);
				};
			} else {
				driving.setSearchCompleteCallback(function() {
					var pts = driving.getResults().getPlan(0).getRoute(0).getPath(); //通过驾车实例，获得一系列点的数组    
					var polyline = new BMap.Polyline(pts);
					markerConfig.map.addOverlay(polyline);
					var icon = new BMap.Icon(markerConfig.imgs, new BMap.Size(62, 40));
					for (var i = 0; i < arr.length; i++) {
						var marker = new BMap.Marker(arr[i], {
							icon: icon
						});
						label = new BMap.Label(markerConfig.id[i], {
							offset: new BMap.Size(20, 0)
						}); //创建marker点的标记,这里注意下,因为百度地图可以对label样式做编辑,
						　　　　　　　　　　
						label.setStyle({
							display: "none"
						}); //对label 样式隐藏     
						marker.setLabel(label); //把label设置到maker上  
						markerConfig.map.addOverlay(marker);
						var lables = new BMap.Label(markerConfig.mark[i], {
							position: arr[i]
						});
						// 创建信息窗口对象
						addInfo(markerConfig.str, marker, lables, params);
						lables.setStyle(markerConfig.photoConfig);
						markerConfig.map.addOverlay(lables);
					};
					/*setTimeout(function() {
						markerConfig.map.setViewport(arr); //调整到最佳视野        
					}, 500);*/
				})
			}
		},
		colorRgb: function(scolor) {
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
			var sColor = scolor.toLowerCase();
			if (sColor && reg.test(sColor)) {
				if (sColor.length === 4) {
					var sColorNew = "#";
					for (var i = 1; i < 4; i += 1) {
						sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
					}
					sColor = sColorNew;
				}
				//处理六位的颜色值  
				var sColorChange = [];
				for (var i = 1; i < 7; i += 2) {
					sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
				}
				return sColorChange.join(",").split(",");
			} else {
				return sColor;
			}
		}
	}
});