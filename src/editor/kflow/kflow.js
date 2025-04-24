/**
 * kflow/kflow.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var it79 = require('iterate79');
	const Twig = require('twig');

	var px2style = px2ce.px2style;
	var $canvas = $(px2ce.getElmCanvas());
	var Promise = require('es6-promise').Promise;
	var px2conf = {},
		pagesByLayout = [];

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	var kaleflower;

	let timer_autoSave;
	const saveStatus = {
		isProgress: false,
		callbackPool: [],
	};

	function getCanvasPageUrl(){
		var rtn = getPreviewUrl();
		var hash = '';
		var query = '';
		if(rtn.match(/^([\s\S]*?)\#([\s\S]*)$/g)){
			rtn = RegExp.$1;
			hash = RegExp.$2;
		}
		if(rtn.match(/^([\s\S]*?)\?([\s\S]*)$/g)){
			rtn = RegExp.$1;
			query = RegExp.$2;
		}
		var PICKLES2_CONTENTS_EDITOR = (px2ce.target_mode == 'theme_layout' ? 'broccoli.layout' : 'broccoli');
		rtn += (query.length ? '?'+query+'&' : '?') + 'PICKLES2_CONTENTS_EDITOR=' + PICKLES2_CONTENTS_EDITOR;
		rtn += (hash.length ? '#'+hash : '');
		return rtn;
	}
	function getPreviewUrl(){
		if( px2ce.target_mode == 'theme_layout' ){
			var page_path = '/index.html';
			if( pagesByLayout.length ){
				page_path = pagesByLayout[0].path;
			}
			var pathname = px2conf.path_controot + page_path;
			pathname = pathname.replace( new RegExp('\/+', 'g'), '/' );
			pathname += '?THEME='+encodeURIComponent(px2ce.theme_id);
			pathname += '&LAYOUT='+encodeURIComponent(px2ce.layout_id);
			return px2ce.options.preview.origin + pathname;
		}

		var pathname = px2conf.path_controot + px2ce.page_path;
		pathname = pathname.replace( new RegExp('\/+', 'g'), '/' );
		var rtn = px2ce.options.preview.origin + pathname;
		return rtn;
	}

	/**
	 * Twig テンプレートにデータをバインドする
	 */
	function bindTwig(tpl, data, funcs){
		let rtn = '';
		let twig;
		try {
			twig = Twig.twig;

			if(funcs && typeof(funcs) == typeof({})){
				Object.keys(funcs).forEach( ($fncName, index) => {
					const $callback = funcs[$fncName];
					Twig.extendFunction($fncName, $callback);
				});
			}

			rtn = new twig({
				'data': tpl,
				'autoescape': true,
			}).render(data);
		} catch(e) {
			const errorMessage = 'TemplateEngine "Twig" Rendering ERROR.';
			console.error( errorMessage );
			rtn = errorMessage;
		}
		return rtn;
	}

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
				pagesByLayout = [];
				if( px2ce.target_mode != 'theme_layout' ){
					rlv();
					return;
				}
				pagesByLayout = px2ce.getBootupInfomations().pagesByLayout;
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
						clearTimeout(timer_autoSave);
						saveContentsSrc(() => {
							px2ce.finish();
						});
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
					const navigationInfo = px2ce.getBootupInfomations().navigationInfo;
					const extraValues = {
						'site': {
							'name': px2conf.name,
						},
						'pageInfo': navigationInfo.page_info,
						'breadcrumb': navigationInfo.breadcrumb_info,
						'parent': navigationInfo.parent_info,
						'bros': navigationInfo.bros_info,
						'children': navigationInfo.children_info,
					};
					kaleflower = new Kaleflower(container, {
						"urlLayoutViewPage": getCanvasPageUrl(),
						"scriptReceiverSelector": "[data-broccoli-receive-message=yes]",
						"contentsAreaSelector": (px2ce.target_mode == 'theme_layout' ? '[data-pickles2-theme-editor-contents-area]' : px2conf.plugins.px2dt.contents_area_selector),
						"contentsContainerNameBy": (px2ce.target_mode == 'theme_layout' ? 'data-pickles2-theme-editor-contents-area' : px2conf.plugins.px2dt.contents_bowl_name_by),
						"extra": extraValues,
						"finalize": (contents) => {
							Object.keys(contents.html).forEach((key) => {
								contents.html[key] = bindTwig(contents.html[key], extraValues);
							});
							return contents;
						},
					});
					kaleflower.on('change', (event) => {
						// 自動保存
						clearTimeout(timer_autoSave);
						timer_autoSave = setTimeout(() => {
							saveContentsSrc(() => {});
						}, 5000);
					});

					resolve();
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					px2ce.gpiBridge(
						{
							'api': 'kflowGetContentsSrc',
							'page_path': px2ce.page_path,
						},
						function(codes){
							kaleflower.loadXml(codes.kflow);
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

	/**
	 * 編集したコンテンツを保存する
	 */
	function saveContentsSrc(callback){
		callback = callback || function(){};
		saveStatus.callbackPool.push(callback);

		if(saveStatus.isProgress){
			return;
		}

		function saveContentsSrcExecute(){

			saveStatus.isProgress = true;

			const currentCallbacks = saveStatus.callbackPool;
			saveStatus.callbackPool = [];

			const codes = {
				'kflow': kaleflower.get(),
				'css': '',
				'js': '',
			};

			px2ce.gpiBridge(
				{
					'api': 'kflowSaveContentsSrc',
					'page_path': px2ce.page_path,
					'codes': codes,
				},
				function(result){
					setTimeout(() => {
						saveStatus.isProgress = false;
						currentCallbacks.forEach(currentCallback => currentCallback(result) );

						if(saveStatus.callbackPool.length){
							saveContentsSrcExecute();
							return;
						}
					}, 500); // クールダウンタイム
				}
			);
		}
		saveContentsSrcExecute();
	}
}
