/**
 * kflow/kflow.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var px2style = px2ce.px2style;
	var $canvas = $(px2ce.getElmCanvas());
	var Promise = require('es6-promise').Promise;
	var px2conf = {};

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var kaleflower;

	/**
	 * 初期化
	 */
	this.init = function(editorOption, callback){
		callback = callback || function(){};

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				px2conf = px2ce.getBootupInfomations().projectConf;
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				var btns = [
				];

				$canvas.html('');
				toolbar.init({
					"btns": btns,
					"onFinish": function(){
						// 完了イベント
						px2ce.finish();
					}
				},function(){
					rlv();
				});
			}); })
			.then(() => {
				return new Promise((resolve, reject) => {
					$canvas.append((() => {
						var fin = '';
						fin += '<div class="pickles2-contents-editor__kflow"></div>';
						return fin;
					})());

					const container = $canvas.find('.pickles2-contents-editor__kflow').get(0);
					kaleflower = new Kaleflower(container, {});

					resolve();
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					px2ce.gpiBridge(
						{
							'api': 'getContentsSrc',
							'page_path': px2ce.page_path,
						},
						function(codes){
							kaleflower.loadXml(codes.html);
							resolve();
						}
					);
				});
			})
			.then(function(){ return new Promise(function(rlv, rjt){
				callback();
			}); })
		;

	};

}
