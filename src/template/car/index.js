define(function(require, exports, module) {
    var tpHelper = require('tpHelper'); // 用于模版模块生成的工具类，请慎重删除，___template___ 可能会用到
    var $ = require('jquery');
    module.exports = {
        init: function() {
            $("#car").html(require("src/template/car").render())
            /*var myScroll = new IScroll('#iscroll', {
                scrollbars: true,
                mouseWheel: true
            })*/
        },
        render: function(data) {
            return ___template___(data);
        }
    }
});