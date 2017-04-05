/**
 * 模板文件业务代码
 */
define(function(require, exports, module) {
    var _$ = require('jsonselect'); // 工具类
    var _g = require('global'); // 工具类
    var utils = require('utils/utils');
    var searchList = require("src/template/searchList");
    var bigColor = require("lib/jquery.bigcolorpicker");
    var tpHelper = require('tpHelper'); // 用于模版模块生成的工具类，请慎重删除，___template___ 可能会用到
    module.exports = {
        init: function() {
            //$("#searchCarFinally").html(require("src/template/searchCarFinally").render())
        },
        render: function(data) {
            return ___template___(data);
        }
    }
});
