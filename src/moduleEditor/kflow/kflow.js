/**
 * kflow/kflow.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	const Twig = require('twig');
	var jsonEditor = new (require('../includes/JsonEditor/JsonEditor.js'))(px2ce);

	var $canvas = $(px2ce.getElmCanvas());
	var px2conf = {};

	var toolbar = new (require('../../apis/toolbar.js'))(px2ce);

	let kaleflower;

	let timer_autoSave;
	const saveStatus = {
		isProgress: false,
		callbackPool: [],
	};

	let codeInfoJson = '';
	let codeFinalizePhp = '';

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

			const bindData = {
				...data,
				lb: this.lb,
			};

			rtn = new twig({
				'data': tpl,
				'autoescape': false,
			}).render(bindData);
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
				$canvas.html('');
				toolbar.init({
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
							codeInfoJson = await jsonEditor.edit(codeInfoJson, {
								title: 'info.json',
							});
						}
					});
					toolbar.addButton({
						"label": "finalize.php",
						"click": async function(){
							codeFinalizePhp = await jsonEditor.edit(codeFinalizePhp, {
								title: 'finalize.php',
							});
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
						'__PX2CE_MODULE_EDITOR_GET_INFOJSON__': function(){
							return JSON.parse(codeInfoJson);
						},
						'__PX2CE_MODULE_EDITOR_UPDATE_INFOJSON__': function(updatedInfoJson){
							codeInfoJson = JSON.stringify(updatedInfoJson, null, 2);
						},
						'loopitem_start': function($loop_field_id){
							return '';
						},
						'loopitem_end': function($loop_field_id){
							return '';
						},
						'appender': function($loop_field_id){
							return '';
						},
					};
					kaleflower = new Kaleflower(container, {
						"urlLayoutViewPage": getCanvasPageUrl(),
						"scriptReceiverSelector": "[data-broccoli-receive-message=yes]",
						"contentsAreaSelector": (px2conf.plugins.px2dt.contents_area_selector),
						"contentsContainerNameBy": (px2conf.plugins.px2dt.contents_bowl_name_by),
						"previewWrapSelector": true,
						"extra": extraValues,
						"finalize": (contents) => {
							const finalizeExtraValues = {
								...extraValues,
							};

							// 定義されたフィールドからダミーコンテンツを作成し、Twigにバインドする
							const infoJson = JSON.parse(codeInfoJson || '{}');

							try {
								function getDummyData(fieldId, currentField, index){
									if(currentField.fieldType === 'module'){
										return `<p>Dummy test${index}.</p>`;
									}else if(currentField.fieldType === 'loop'){
										if(!infoJson.interface.subModule || !infoJson.interface.subModule[fieldId] || !infoJson.interface.subModule[fieldId].fields){
											return [];
										}
										const subModuleInfo = infoJson.interface.subModule[fieldId].fields;
										const dummyAry = [];
										for(let i = 0; i < 3; i++){
											const dataRow = {};
											Object.keys(subModuleInfo).forEach((key) => {
												dataRow[key] = getDummyData(key, subModuleInfo[key], i);
											});
											dummyAry.push(dataRow);
										}
										return dummyAry;
									}
									if(currentField.type === 'image'){
										return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiZTdmZmNiZS1lMTgwLTQwZGUtOTA3My1lNjk2MDk5YmYyNDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzlGNUUyODQ5NzU4MTFFNTg0MTBGRkY3MEQzOTdDQTQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzlGNUUyODM5NzU4MTFFNTg0MTBGRkY3MEQzOTdDQTQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDphMDI5NWE5YS05YzRkLTQzNjYtYjhjOS05NWQ1MjM0ZThhNDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6YmU3ZmZjYmUtZTE4MC00MGRlLTkwNzMtZTY5NjA5OWJmMjQ5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';
									}else if(currentField.type === 'text' || currentField.type === 'html_attr_text'){
										return `Dummy test${index}.`;
									}
									return `<p>Dummy test${index}.</p>`;
								}
								if(infoJson.interface && infoJson.interface.fields){
									Object.keys(infoJson.interface.fields).forEach((key) => {
										finalizeExtraValues[key] = getDummyData(key, infoJson.interface.fields[key]);
									});
								}
							}
							catch(e) {
								console.error('Error parsing info.json:', e);
							}
							Object.keys(contents.html).forEach((key) => {
								contents.html[key] = bindTwig(contents.html[key], finalizeExtraValues);
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
							'api': 'getKflowModuleSrc',
							'module_id': px2ce.module_id,
						},
						function(codes){
							codeInfoJson = codes['info.json'] || '{}';
							codeFinalizePhp = codes['finalize.php'] || '';
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
				'info.json': codeInfoJson,
				'finalize.php': codeFinalizePhp,
				'src/template.kflow': kaleflower.get(),
			};

			px2ce.gpiBridge(
				{
					'api': 'saveKflowModuleSrc',
					'module_id': px2ce.module_id,
					'codes': codes,
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
