/**
 * kflow/kflow.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	const Twig = require('twig');

	var px2style = px2ce.px2style;
	var $canvas = $(px2ce.getElmCanvas());
	var px2conf = {};

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);
	var infoJsonEditor = new (require('../includes/InfoJsonEditor/InfoJsonEditor.js'))(px2ce);

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
		var PICKLES2_CONTENTS_EDITOR = 'broccoli';
		rtn += (query.length ? '?'+query+'&' : '?') + 'PICKLES2_CONTENTS_EDITOR=' + PICKLES2_CONTENTS_EDITOR;
		rtn += (hash.length ? '#'+hash : '');
		return rtn;
	}
	function getPreviewUrl(){
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
					toolbar.addButton({
						"label": "info.json",
						"click": async function(){
							const result = await infoJsonEditor.edit();
							console.log('result:', result);
						}
					});
					rlv();
				});
			}); })
			.then(() => {
				return new Promise((resolve, reject) => {
					$canvas.append((() => {
						var fin = '';
						fin += '<div class="pickles2-contents-editor__module-editor-kflow"></div>';
						return fin;
					})());

					const container = $canvas.find('.pickles2-contents-editor__module-editor-kflow').get(0);
					const navigationInfo = px2ce.getBootupInfomations().navigationInfo;
					const extraValues = {
						'config': px2conf,
						'topPageInfo': navigationInfo.top_page_info,
						'currentPageInfo': navigationInfo.page_info,
						'pageInfo': navigationInfo.page_info,
						'breadcrumb': navigationInfo.breadcrumb_info,
						'parent': navigationInfo.parent_info,
						'bros': navigationInfo.bros_info,
						'children': navigationInfo.children_info,
						'globalMenu': navigationInfo.global_menu_info || null,
						'shoulderMenu': navigationInfo.shoulder_menu_info || null,
						'categoryTop': navigationInfo.category_top_info || null,
						'categorySubMenu': navigationInfo.category_sub_menu_info || null,
						'href': function(path){
							return path.replace(/^\/*/, '/');
						},
						'getCurrentPageInfo': function(){
							return navigationInfo.page_info;
						},
						'getPageInfo': function($path){
							const newPage = {
								...navigationInfo.page_info,
								title: 'my page',
								title_label: 'my page',
								title_h1: 'my page',
								title_breadcrumb: 'my page',
								title_full: 'my page',
							};
							return newPage;
						},
						'getBros': function($path, $options){
							return [
								navigationInfo.page_info.id,
								navigationInfo.page_info.id + 1,
								navigationInfo.page_info.id + 2,
								navigationInfo.page_info.id + 3,
							];
						},
						'getChildren': function($path, $options){
							return [
								navigationInfo.page_info.id,
								navigationInfo.page_info.id + 1,
								navigationInfo.page_info.id + 2,
								navigationInfo.page_info.id + 3,
							];
						},
						'getCategoryTop': function($path){
							return navigationInfo.category_top_info;
						},
						'getGlobalMenu': function(){
							const globalMenu = [];
							navigationInfo.global_menu_info.forEach((item) => {
								globalMenu.push(item.id);
							});
							return globalMenu;
						},
						'getShoulderMenu': function(){
							const shoulderMenu = [];
							navigationInfo.shoulder_menu_info.forEach((item) => {
								shoulderMenu.push(item.id);
							});
							return shoulderMenu;
						},
						'isPageInBreadcrumb': function($page_id){
							return false;
						},
					};
					kaleflower = new Kaleflower(container, {
						"urlLayoutViewPage": getCanvasPageUrl(),
						"scriptReceiverSelector": "[data-broccoli-receive-message=yes]",
						"contentsAreaSelector": (px2conf.plugins.px2dt.contents_area_selector),
						"contentsContainerNameBy": (px2conf.plugins.px2dt.contents_bowl_name_by),
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
							'api': 'getModuleSrc',
							'module_id': px2ce.module_id,
						},
						function(codes){
							kaleflower.loadXml(codes['src/template.kflow']);
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
				'src/template.kflow': kaleflower.get(),
			};

			px2ce.gpiBridge(
				{
					'api': 'saveModuleSrc',
					'module_id': px2ce.module_id,
					'codes': codes,
				},
				function(result){
					setTimeout(() => {
						px2ce.gpiBridge(
							{
								'api': 'buildKflowModule',
								'module_id': px2ce.module_id,
							},
							function(result){
								saveStatus.isProgress = false;
								currentCallbacks.forEach(currentCallback => currentCallback(result) );

								if(saveStatus.callbackPool.length){
									saveContentsSrcExecute();
									return;
								}
							}
						);
					}, 500);
				}
			);
		}
		saveContentsSrcExecute();
	}

	/**
	 * 画面を再描画する
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		callback();
		return;
	}

	/**
	 * 位置合わせ
	 */
	this.adjust = this.redraw;
}
