/**
 * 模板文件业务代码
 */
define(function(require, exports, module) {
    var $ = require('jquery'); // 工具类
    var s = require('jsonselect'); // 工具类
    var g = require('global'); // 工具类
    var autosearch = require("lib/autosearch");
    var bigColor = require("lib/jquery.bigcolorpicker");
    var tpHelper = require('tpHelper'); // 用于模版模块生成的工具类，请慎重删除，___template___ 可能会用到
    var searchList = require("src/template/searchList");
    var searchCar = require("src/template/searchCar");
    module.exports = {
        init: function(pointArr, cameraIds) {
            //搜suo的逻辑
            $(".btn").on("click", function(event) {
                $(this).addClass('bg').siblings('li').removeClass('bg');
                $("#center").animate({
                    width: "0"
                }, 100, function() {});
                $("#video").animate({
                    width: "0"
                }, 100, function() {}).fadeOut();
                var indexs = $(this).index();
                //搜车 0  搜人1
                if (!indexs) {
                    $("#searchCar").html(require("src/template/searchCar").render()).fadeIn()
                        .animate({
                            width: "900px"
                        }, 400, function() {});
                    $("#searchCarFinally").html(require("src/template/searchCarFinally").render())
                    $("#searchMan").empty().css("width", "0");
                    $("#searchCar #carImg").bigColorpicker(function(el, color) {
                        $(el).css("backgroundColor", color);
                    });
                    select();
                    $("#searchCar .xla li").on("click", function() {
                        var value = "",
                            id = "";
                        if ($(this).attr("category")) {
                            value = $(this).text();
                            var len = $(".category-list span").length;
                            if (len == 0) {
                                $(getHtml(value, "汽车分类")).appendTo(".category-list");
                            } else {
                                $(".category-list .detail-info").html(value)
                            }
                        }
                    });
                    $("#searchList").animate({
                        width: "0"
                    }, 100, function() {});
                    // 车牌号输入内容添加到左侧菜单
                    $("#searchCar .num-xla .text").on("blur", function() {
                        var numVal = $.trim($(this).val()),
                            len = $(".num-list span").length;
                        //console.log(numVal);
                        if (numVal == "") {
                            return;
                        }
                        if (len == 0) {
                            $(getHtml(numVal, "车牌号")).appendTo(".num-list");
                        } else {
                            $(".num-list .detail-info").html(numVal)
                        }
                    });
                    // 车品牌输入内容添加到左侧菜单
                    // 选中车身颜色
                    setTimeout(function() {
                        $("#carImg").bigColorpicker(function(el, color) {
                            var id = $(el).attr("img");
                            $(el).css("backgroundColor", color);
                            if ($(".detail-color0").length >= 1) {
                                $(".color-list .detail-color0").css("backgroundColor", color).attr("data-color", color);
                                return;
                            } else {
                                $(getColor0("车身颜色")).appendTo(".color-list");
                            }
                            $(".color-list .detail-color0").css("backgroundColor", color).attr("data-color", color);
                        });
                    }, 200);
                    delI();
                    uploadImg();
                    $.get('json/cars.json', function(result) {
                        var input = $('#searchCar .autosearch3');
                        var autosearchs = new autosearch();
                        autosearchs.init({
                            input: input,
                            autoShow: true,
                            data: result,
                            mutil: false,
                            callback: function(data) {
                                var data = data.name;
                                //console.log(data);
                                var len = $(".brand-list span").length;
                                if (data == "") {
                                    return;
                                }
                                if (len == 0) {
                                    $(getHtml(data, "车辆品牌")).appendTo(".brand-list");
                                } else {
                                    $(".brand-list .detail-info").html(data)
                                }
                            }
                        });
                    }, 'json')
                    var dt = {
                        "汽车分类": "type_index",
                        "车辆品牌": "carName",
                        "车牌号": "carNumber",
                        "车身颜色": "carColor",

                        "未知": "type_index",
                        "不限": "type_index",
                        "行人": "type_index",
                        "小汽车": "type_index",
                        "小货车": "type_index",
                        "SUV": "type_index",
                        "面包车": "type_index",
                        "巴士": "type_index",
                        "皮卡": "type_index",
                        "卡车": "type_index",
                        "自行车": "type_index",
                        "摩托车": "type_index"
                    }
                    $("#search-man").on("click", function() {
                        var arrCar = [];
                        $(".detail-info").each(function() {
                            var s = $.trim($(this).attr("data-name"));
                            var t = $.trim($(this).text());
                            var str = {};
                            if (s == "汽车分类") {
                                Object.keys(dt).forEach(function(item, index) {
                                    if (t === "未知") {
                                        str[dt[t]] = -1;
                                    } else if (t === "不限") {
                                        str[dt[t]] = "";
                                    } else if (t === "行人") {
                                        str[dt[t]] = 0;
                                    } else if (t === "小汽车") {
                                        str[dt[t]] = 1;
                                    } else if (t === "SUV") {
                                        str[dt[t]] = 2;
                                    } else if (t === "面包车") {
                                        str[dt[t]] = 3;
                                    } else if (t === "巴士") {
                                        str[dt[t]] = 4;
                                    } else if (t === "皮卡") {
                                        str[dt[t]] = 5;
                                    } else if (t === "卡车") {
                                        str[dt[t]] = 6;
                                    } else if (t === "自行车") {
                                        str[dt[t]] = 7;
                                    } else {
                                        str[dt[t]] = 8;
                                    }
                                });
                            } else if (s == "车辆品牌") {
                                str["carName"] = t;
                            } else if (s == "车牌号") {
                                str["carNumber"] = t;
                            };
                            arrCar.push(str);
                        });
                        $(".detail-color").each(function() {
                            var s = $(this).text();
                            var color = $(this).attr("data-color");
                            var str = {};
                            Object.keys(dt).forEach(function(item, index) {
                                if (item === s) {
                                    str[dt[s]] = g.colorRgb(color);
                                }
                            });
                            arrCar.push(str);
                        });
                        //开始搜索
                        var imgpath = window.localStorage.uploadUrl || "";
                        searchList.init(arrCar, indexs, pointArr, cameraIds, imgpath);
                        window.localStorage.uploadUrl = "";
                    });
                } else {
                    $("#searchMan").html(require("src/template/searchMan").render());
                    $("#searchMan").animate({
                        width: "1000px"
                    }, 400, function() {});
                    $("#searchCar").empty().hide();
                    $("#searchList").animate({
                        width: "0"
                    }, 100, function() {});
                    $("#searchMan").fadeIn(600);
                    getSearch();
                    var d = {
                        "男": "male",
                        "女": "male",
                        "不限": "male",
                        "长": "long_hair",
                        "短": "long_hair",
                        "不限": "long_hair",
                        "长袖": "long_sleeves",
                        "短袖": "long_sleeves",
                        "条纹": "stripe",
                        "T-shirt": "tshirt",
                        "正装": "formal",
                        "logo": "logo",
                        "上身颜色": "upColor",
                        "牛仔裤": "jeans",
                        "长裤": "long_pants",
                        "短裤": "shorts",
                        "裙子": "skirt",
                        "下身颜色": "downColor",
                        "眼镜": "sunglasses",
                        "帽子": "hat",
                        "面罩": "face_mask",
                        "不限": "sunglasses",
                        "不限": "hat",
                        "不限": "face_mask",
                        "背包颜色": "bag_color",
                        "提包颜色": "bag_color0",
                        "骑车": "ride_bike",
                        "search_type": "pedestrian",
                        "video": "2"
                    }
                    $("#search-man").on("click", function() {
                        var arrMan = [];
                        $(".detail-info").each(function() {
                            var s = $.trim($(this).text());
                            var str = {};
                            Object.keys(d).forEach(function(item, index) {
                                if (s === "女") {
                                    if (item === s) {
                                        str[d[s]] = -1;
                                    }
                                } else if (s === "短") {
                                    if (item === s) {
                                        str[d[s]] = -1;
                                    }
                                } else if (s === "短袖") {
                                    if (item === s) {
                                        str[d[s]] = -1;
                                    }
                                } else if (s === "不限") {
                                    if (item === s) {
                                        str[d[s]] = 0;
                                    }
                                } else {
                                    if (item === s) {
                                        str[d[s]] = 1;
                                    }
                                }
                            });
                            arrMan.push(str);
                        });
                        $(".detail-color").each(function() {
                            var s = $(this).text();
                            var color = $(this).attr("data-color");
                            var str = {};
                            Object.keys(d).forEach(function(item, index) {
                                if (item === s) {
                                    str[d[s]] = g.colorRgb(color);
                                }
                            });
                            arrMan.push(str);
                        });
                        var imgpath = window.localStorage.uploadUrl || "";
                        searchList.init(arrMan, indexs, pointArr, cameraIds, imgpath);
                        window.localStorage.uploadUrl = "";
                    });
                }
            });
            //下拉框
            function select() {
                $(".xla").on("mouseenter", function() {
                    $(this).find("ul").show()
                    var that = $(this)
                    $(this).find("ul").find("li").on("click", function() {
                        var str = $(this).text()
                        that.find("input").val(str)
                        $(this).parent("ul").hide()
                    })
                }).on("mouseleave", function() {
                    $(this).find("ul").hide()
                });
            }

            function getColor0(color) {
                var manHtml = "";
                manHtml += "<span class='detail'> <a class='detail-color detail-color0'>" + color + "</a> <i>x</i></span>";
                return manHtml;
            }

            function getColor1(color) {
                var manHtml = "";
                manHtml += "<span class='detail'> <a class='detail-color detail-color1'>" + color + "</a> <i>x</i></span>";
                return manHtml;
            }

            function getHtml(value, id) {
                var manHtml = "";
                if (id) {
                    manHtml = "<span class='detail'> <span class='detail-info'  data-name='" + id + "'>" + value + "</span> <i>x</i></span>";
                } else {
                    manHtml = "<span class='detail'> <span class='detail-info'>" + value + "</span> <i>x</i></span>";
                }
                return manHtml;
            }

            function delI() {
                // 点击x号删除菜单项
                $(document).on("click", ".detail i", function() {
                    if ($(this).parent().parent(".detail-div")) {
                        $(this).parent().parent(".detail-div").remove();
                    }
                    $(this).parent().remove();
                })
            }

            function uploadImg() {
                var _w = 456;
                var _h = 344;
                var _old = {};
                var _new = {};
                var _txt = $(".textarea textarea");
                $(document).on("change", ".upload-btn input", function() {
                    var _this = $(this);
                    var fr = new FileReader();
                    fr.readAsDataURL(this.files[0]);
                    var img = new Image();
                    var btn = _this.parent();
                    btn.hide();
                    var upImg = btn.siblings(".upload-img");
                    upImg.addClass("loading");
                    fr.onload = function() {
                        img.src = this.result;
                        var that = this;
                        //图片上传
                        $.ajax({
                                url: 'http://10.101.6.26:8092/Home/Search/uploadFile',
                                type: 'post',
                                dataType: '',
                                data: {
                                    imgs: that.result
                                },
                            })
                            .done(function(data) {
                                window.localStorage.uploadUrl = data;
                                console.log("success");
                            })
                        img.onload = function() {
                            btn.siblings(".upload-img").html(img);
                            var ratio = 1;
                            if (img.width > img.height) {
                                upImg.find("img").addClass("mh");
                                ratio = _h / img.height;
                            } else {
                                upImg.find("img").addClass("mw");
                                ratio = _w / img.width;
                            }
                            var src = $(".upload-img").children("img").attr("src")
                            $("<img src='" + src + "'>").appendTo(".man-photo")
                                //$(".upload-btn ").show().css("zIndex",100000000);
                                //$(".upload-img").css("display","none");
                            setTimeout(function() {
                                upImg.removeClass("loading").find("img").css("opacity", 1);
                            }, 1000);
                        }
                    }
                });
            }

            function getSearch() {
                /*选择颜色*/
                select();
                var img = $("#searchMan").find("#img");
                var imgo = $("#searchMan").find("#imgo");
                var imgt = $("#searchMan").find("#imgt");
                // 选择颜色值
                function upcolor(imcolor) {
                    imcolor.bigColorpicker(function(el, color) {
                        $(el).css("backgroundColor", color);
                    });
                }
                // 点选按钮选中
                function checkradio(cheeckyes) {
                    cheeckyes.on('click', '.checkbox-input', function() {
                        if ($(this).hasClass('active')) {
                            $(this).removeClass('active').css('backgroundColor', '');
                        } else {
                            $(this).addClass('active').css('backgroundColor', '#12bac8');
                        }
                    })
                }



                function getColorHtml(value, id) {
                    var manHtml = "";
                    manHtml += "<div class='detail-div clearfix'>";
                    manHtml += "<span class='detail' id='" + id + "'> <span>" + value + "</span> <i>x</i></span>";
                    manHtml += "<span class='detail'> <a class='detail-color detail-info" + id + "'>" + value + "颜色</a></span>";
                    manHtml += "</div>"
                    return manHtml;
                }


                // 性别、头发
                $(".xla li").on("click", function() {
                    var value = "",
                        id = "";
                    if ($(this).attr("male")) {
                        value = $(this).text();
                        var len = $(".sex-list span").length;
                        if (len == 0) {
                            $(getHtml(value)).appendTo(".sex-list");
                        } else {
                            $(".sex-list .detail-info").html(value)
                        }
                    } else if ($(this).attr("long_hair")) {
                        value = $(this).text();
                        var len = $(".hair-list span").length;
                        if (len == 0) {
                            $(getHtml(value)).appendTo(".hair-list");
                        } else {
                            $(".hair-list .detail-info").html(value)
                        }
                    }
                });
                // 选中上身下身
                setTimeout(function() {
                    $("#img").bigColorpicker(function(el, color) {
                        var id = $(el).attr("img");
                        $(el).css("backgroundColor", color);
                        if ($(".detail-color0").length >= 1) {
                            $(".top-body .detail-color0").css("backgroundColor", color).attr("data-color", color);
                            return;
                        } else {
                            $(getColor0()).appendTo(".top-body");
                        }
                        $(".top-body .detail-color0").css("backgroundColor", color).attr("data-color", color);
                    });
                }, 200);
                setTimeout(function() {
                    $("#imgo").bigColorpicker(function(el, color) {
                        var id = $(el).attr("img");
                        $(el).css("backgroundColor", color);
                        if ($(".detail-color1").length >= 1) {
                            $(".bottom-body .detail-color1").css("backgroundColor", color).attr("data-color", color);
                            return;
                        } else {
                            $(getColor1()).appendTo(".bottom-body");
                        }
                        $(".bottom-body .detail-color1").css("backgroundColor", color).attr("data-color", color);
                    });
                }, 200);
                $(".checkbox").on("click", function() {
                    if (!$(this).hasClass("active") && $(this).siblings().attr("topBody")) {
                        var value = $(this).siblings().text(),
                            id = $(this).siblings().attr("topBody");
                        $(getHtml(value, id)).appendTo(".top-body");
                        // $("#img").attr("img", id)
                        $("#img").bigColorpicker(function(el, color) {
                            var id = $(el).attr("img");
                            $(el).css("backgroundColor", color);
                            if ($(".detail-color0").length >= 1) {
                                $(".top-body .detail-color0").css("backgroundColor", color).attr("data-color", color);
                                return;
                            } else {
                                $(getColor0("上身颜色")).appendTo(".top-body");
                            }
                            $(".top-body .detail-color0").css("backgroundColor", color).attr("data-color", color);
                        });
                    } else {
                        var len = $(".top-body").children(".detail").length;
                        var id = $(this).siblings().attr("topBody");
                        for (var i = 0; i < len; i++) {
                            if ($(".top-body").children(".detail").eq(i).children('.detail-info').attr("data-name") == id) {
                                $(".top-body").children(".detail").eq(i).remove();
                            }
                        }
                    }
                    if (!$(this).hasClass("active") && $(this).siblings().attr("bottomBody")) {
                        var value = $(this).siblings().text(),
                            id = $(this).siblings().attr("bottomBody");
                        $(getHtml(value, id)).appendTo(".bottom-body");
                        // $("#imgo").attr("img", id)
                        $("#imgo").bigColorpicker(function(el, color) {
                            var id = $(el).attr("img");
                            $(el).css("backgroundColor", color);
                            if ($(".detail-color1").length >= 1) {
                                $(".bottom-body .detail-color1").css("backgroundColor", color).attr("data-color", color);
                                return;
                            } else {
                                $(getColor1("下身颜色")).appendTo(".bottom-body");
                            }
                            $(".bottom-body .detail-color1").css("backgroundColor", color).attr("data-color", color);
                        });
                    } else {
                        var len = $(".bottom-body").children(".detail").length;
                        var id = $(this).siblings().attr("bottomBody");
                        for (var i = 0; i < len; i++) {
                            if ($(".bottom-body").children(".detail").eq(i).attr("data-name") == id) {
                                $(".bottom-body").children(".detail").eq(i).remove();
                            }
                        }
                    }
                });
                $(".other-sure li").unbind("click").on("click", function() {
                    if ($(this).attr("other") == 1) {
                        var val = $(".flist").text();
                        for (var i = 0; i < $(".other-body .detail").length; i++) {
                            if ($(".other-body .detail").eq(i).children(".detail-info").text() == val) {
                                return;
                            }
                        }
                        if ($(".flist").text() == "提包" || $(".flist").text() == "背包") {
                            var id = $(".flist").attr("package");
                            $(getColorHtml(val, id)).appendTo(".other-body");
                            $("#imgt").attr("img", id)
                            $("#imgt").bigColorpicker(function(el, color) {
                                var id = $(el).attr("img");
                                $(el).css("backgroundColor", color);
                                $(".other-body .detail-info" + id).css("backgroundColor", color).attr("data-color", color);
                            });
                        } else {
                            $(getHtml(val)).appendTo(".other-body")
                        }
                    } else {
                        var val = $(".flist").text();
                        for (var i = 0; i < $(".other-body .detail").length; i++) {
                            if ($(".other-body .detail").eq(i).children(".detail-info").text() == val) {
                                $(".other-body .detail").eq(i).remove();
                            }
                        }
                    }
                });
                $(".ride-box ul li").on("click", function() {
                    var val = $(this).attr("ride"),
                        len = $(".other-body .detail").length,
                        rideHtml = "<span class='detail detail-ride'> <span class='detail-info '>骑车</span> <i>x</i></span>";
                    if (val == "1") {
                        if ($(".other-body").children(".detail-ride").length > 0) {
                            return;
                        } else {
                            $(rideHtml).appendTo(".other-body");
                        }
                    } else {
                        for (var i = 0; i < $(".other-body .detail").length; i++) {
                            if ($(".other-body .detail").eq(i).children(".detail-info").text() == "骑车") {
                                $(".other-body .detail").eq(i).remove();
                            }
                        }
                    }
                });
                delI();
                //携带物品切换效果
                function oncheck() {
                    $(".flist").parent().siblings(".package-color").hide();
                    $('.carrygoods').find('.carrylist').on('click', 'li', function() {
                        $(".carry input").val("");
                        $(this).addClass('flist').siblings('li').removeClass('flist');
                        if ($(this).hasClass("not-color")) {
                            $(".package-color").hide();
                        } else {
                            $(".package-color").show();
                        }
                    });
                }
                select();
                oncheck();
                upcolor(img);
                upcolor(imgo);
                upcolor(imgt);
                // 点击选择?按钮
                var checkbotr = $('.bot_l');
                var checkbotb = $('.bot_r');
                checkradio(checkbotr);
                checkradio(checkbotb);
                uploadImg();
                //上传文件

                function imageData(obj) {
                    obj.scroll.enabled = false;
                    var canvas = document.createElement('canvas');
                    canvas.width = _w;
                    canvas.height = _h;
                    var ctx = canvas.getContext('2d');
                    var w = _w / obj.scroll.scale / obj.ratio;
                    var h = _h / obj.scroll.scale / obj.ratio;
                    var x = Math.abs(obj.scroll.x) / obj.scroll.scale / obj.ratio;
                    var y = Math.abs(obj.scroll.y) / obj.scroll.scale / obj.ratio;
                    ctx.drawImage(obj.img, x, y, w, h, 0, 0, _w, _h);
                    return canvas.toDataURL();
                }


            }

            function loadCar() {

            }

        },
        render: function(data) {
            return ___template___(data);
        }
    }
});