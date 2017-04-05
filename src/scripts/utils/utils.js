/**
 * @describe: 工具类 函数类工具集
 */
define(function(require, exports, module) {
	module.exports = {
		format: function(str, obj) {
			return str.replace(/#\[(.*?)\]/g, function($0, $1) {
				return obj[$1] === undefined || obj[$1] === false ? "" : obj[$1];
			});
		}
	}

});