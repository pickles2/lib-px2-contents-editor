/**
 * insertImageDialog.js
 * 画像挿入ダイアログの機能を提供
 */
module.exports = function(options){
	var px2ce = options.px2ce;
	var _imgDummy = options._imgDummy;
	var droppedFileList = options.droppedFileList;
	var getCurrentTab = options.getCurrentTab;
	var page_path = options.page_path;
	var px2conf = options.px2conf;
	var insertText = options.insertText;
	var saveContentsSrc = options.saveContentsSrc;

	var $ = require('jquery');
	var dateformat = require('dateformat');
	var it79 = require('iterate79');

	/**
	 * パスから拡張子を取り出して返す
	 */
	function getExtension(path){
		var ext = '';
		try {
			var ext = path.replace( new RegExp('^.*?\.([a-zA-Z0-9\_\-]+)$'), '$1' );
			ext = ext.toLowerCase();
		} catch (e) {
			ext = false;
		}
		return ext;
	}

	/**
	 * 画像としてプレビューできる種類か評価する
	 */
	function canFilePreviewAsImage(mimetype, ext){
		if( mimetype ){
			if( mimetype.match(/^image\//) ){
				return true;
			}
		}else if( ext ){
			switch( ext ){
				case 'jpg':
				case 'jpeg':
				case 'jpe':
				case 'png':
				case 'gif':
				case 'webp':
					return true;
					break;
			}
		}
		return false;
	}

	/**
	 * アップロードファイルを読み込む
	 */
	function readSelectedLocalFile(fileInfo, callback){
		var reader = new FileReader();
		reader.onload = function(evt) {
			callback( evt.target.result );
		}
		reader.readAsDataURL(fileInfo);
	}

	/**
	 * 画像を圧縮する（WebP変換 + サイズ縮小）
	 */
	function compressImage(dataUri, callback){
		var img = new Image();
		img.onload = function(){
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			
			// サイズ計算（1900pxを超える場合は縮小）
			var maxSize = 1900;
			var width = img.width;
			var height = img.height;
			
			if (width > maxSize || height > maxSize) {
				if (width > height) {
					height = Math.round((height * maxSize) / width);
					width = maxSize;
				} else {
					width = Math.round((width * maxSize) / height);
					height = maxSize;
				}
			}
			
			canvas.width = width;
			canvas.height = height;
			
			// 画像を描画
			ctx.drawImage(img, 0, 0, width, height);
			
			// WebP形式で出力（品質: 0.85）
			var compressedDataUri = canvas.toDataURL('image/webp', 0.85);
			callback(compressedDataUri);
		};
		img.src = dataUri;
	}

	/**
	 * アップロードしたファイルをコンテンツに挿入する
	 */
	function insertUploadFile(fileInfo, originalFileName, callback){
		callback = callback || function(){};
		var path_resource;

		it79.fnc({}, [
			function(it1){
				px2ce.gpiBridge(
					{
						'api': 'getPathResources',
						'page_path': page_path
					},
					function(result){
						var path = require('path');
						var tmpPathControot = px2conf.path_controot;
						tmpPathControot = tmpPathControot.replace(/\/+$/, '')+page_path;
						tmpPathControot = tmpPathControot.replace(/[^\/]*$/, '');
						var relative_path = path.relative(tmpPathControot, result);
						path_resource = relative_path;
						it1.next();
					}
				);
			},
			function(it1){
				var fileName = fileInfo.name;
				// var uploadFileName = './'+path_resource+'/'+fileName;
				var uploadFileName = '<'; // NOTE: minifyされたあと、PHPコードとして成立してしまわないように、複数行に分解している。
				uploadFileName += '?';
				uploadFileName += `= $px->h($px->path_files("/${fileName}")) ?`;
				uploadFileName += '>';
				var insertString = '';

				var current_tab = getCurrentTab();

				// 開いているタブの種類に応じて、
				// 挿入する文字列を出し分ける。
				switch(current_tab){
					case 'css':
						insertString = `url("${uploadFileName}")`;
						break;
					case 'js':
						insertString = `"${uploadFileName}"`;
						break;
					case 'html':
					default:
						if( fileInfo.type.match(/^image\//) ){
							insertString = `<img src="${uploadFileName}" alt="${originalFileName || fileName}" />`+"\n";
						}else{
							insertString = `<a href="${uploadFileName}" download="${fileName}">${originalFileName || fileName}</a>`+"\n";
						}
						break;
				}

				// アップロードファイルを一時記憶
				// ファイルは、次回保存時に保存されます。
				droppedFileList.push({
					'name': fileInfo.name,
					'type': fileInfo.type,
					'size': fileInfo.size,
					'base64': fileInfo.base64,
				});

				// コンテンツに文字列を挿入する
				insertText( insertString, current_tab );

				it1.next();
			},
			function(it1){
				saveContentsSrc(function(){
					it1.next();
				});
			},
			function(){
				callback();
			}
		]);
		return;
	}

	/**
	 * 画像挿入ダイアログを開く
	 */
	function openInsertImageDialog( presetInsertFileInfo ){

		var $body = $(`<div>
			<p>${px2ce.lb.get('editor.default.select_image_to_insert')}</p>
			<div class="px2-form-input-list">
				<ul class="px2-form-input-list__ul">
					<li class="px2-form-input-list__li">
						<div class="px2-form-input-list__label"><label for="insert-image-file">${px2ce.lb.get('editor.default.file')}</label></div>
						<div class="px2-form-input-list__input">
							<div class="pickles2-contents-editor__default-image-preview" tabindex="0">
								<img class="pickles2-contents-editor__default-image-preview-image" />
								<div class="pickles2-contents-editor__default-image-preview-no-image"></div>
							</div>
							<input type="file" id="insert-image-file" name="insert-image-file" value="" />
						</div>
					</li>
					<li class="px2-form-input-list__li">
						<div class="px2-form-input-list__label"><label for="insert-image-file-name">${px2ce.lb.get('editor.default.filename')}</label></div>
						<div class="px2-form-input-list__input">
							<input type="text" id="insert-image-file-name" name="insert-image-file-name" value="" class="px2-input px2-input--block" required />
						</div>
					</li>
					<li class="px2-form-input-list__li">
						<div class="px2-form-input-list__label"></div>
						<div class="px2-form-input-list__input">
							<button type="button" class="px2-btn pickles2-contents-editor__default-image-trigger-compress-image" disabled>画像を圧縮 (WebP)</button>
						</div>
					</li>
				</ul>
			</div>
			<input type="hidden" id="insert-image-original-file-name" name="insert-image-original-file-name" value="" />
		</div>`);
		var $imgPreview = $body.find('.pickles2-contents-editor__default-image-preview-image');
		var $imgNotImage = $body.find('.pickles2-contents-editor__default-image-preview-no-image');

		function isValidFilename(filename){
			if( !filename.match(/^[a-z0-9\-\_]+\.[a-z0-9]+$/i) ){
				return false;
			}
			return true;
		}
		function generateAutoFilename(filename){
			var ext = filename.replace(/^[\s\S]*\./, '');
			var today = new Date();
			return dateformat(today, 'yyyy-mm-dd-hhMMss') + '.' + ext;
		}

		/**
		 * 画像プレビューを更新する
		 */
		function setImagePreview(fileInfo){
			var fileSrc = fileInfo.src;
			var fileMimeType = fileInfo.mimeType;
			if( !fileInfo || !fileInfo.src || !fileInfo.ext || !fileInfo.size){
				fileSrc = px2ce.getNoimagePlaceholder() || _imgDummy;
				fileMimeType = 'image/svg+xml';
			}
			$imgPreview
				.attr({
					"src": fileSrc,
				})
			;
			$imgNotImage.text( fileInfo.ext );
			if( canFilePreviewAsImage(fileMimeType, fileInfo.ext) ){
				$imgPreview.show();
				$imgNotImage.hide();
			}else{
				$imgPreview.hide();
				$imgNotImage.show();
			}
			return;
		}

		var modalObj = px2style.modal({
			"title": px2ce.lb.get('editor.default.insert_image_dialog_title'),
			"body": $body,
			"form": {
				"submit": function(){
					var $inputFile = $body.find('input[name=insert-image-file]');
					var $inputFileName = $body.find('input[name=insert-image-file-name]');
					var $inputOriginalFileName = $body.find('input[name=insert-image-original-file-name]');
					var fileInfoJSON = $inputFile.attr('data-upload-file');
					if( !fileInfoJSON ){
						return;
					}
					if( !$inputFileName.val() ){
						return;
					}

					if( !isValidFilename($inputFileName.val()) ){
						alert(px2ce.lb.get('editor.default.invalid_filename'));
						return;
					}

					var fileInfo = JSON.parse(fileInfoJSON);
					fileInfo.name = (function(){
						if( !isValidFilename($inputFileName.val()) ){
							return generateAutoFilename($inputFileName.val());
						}
						return $inputFileName.val();
					})();

					insertUploadFile(fileInfo, $inputOriginalFileName.val());
					modalObj.close();
				}
			},
			"buttons": [
				$(`<button type="submit" class="px2-btn px2-btn--primary">${px2ce.lb.get('editor.default.insert_button')}</button>`),
			],
		}, function(){
			/**
			 * 画像圧縮ボタンの有効/無効を更新
			 */
			function updateCompressButtonState(fileInfo){
				var $compressBtn = $body.find('.pickles2-contents-editor__default-image-trigger-compress-image');
				if( fileInfo && fileInfo.ext && fileInfo.mimeType && canFilePreviewAsImage(fileInfo.mimeType, fileInfo.ext) ){
					$compressBtn.prop('disabled', false);
				}else{
					$compressBtn.prop('disabled', true);
				}
			}
			var $inputFile = $body.find('input[name=insert-image-file]');
			var $inputFileName = $body.find('input[name=insert-image-file-name]');
			var $inputOriginalFileName = $body.find('input[name=insert-image-original-file-name]');
			var $compressBtn = $body.find('.pickles2-contents-editor__default-image-trigger-compress-image');

			setImagePreview({});
			updateCompressButtonState(null);

			if( typeof(presetInsertFileInfo) == typeof({}) ){
				var fileInfo = {
					'src': presetInsertFileInfo.base64,
					'ext': getExtension(presetInsertFileInfo.name),
					'size': presetInsertFileInfo.size,
					'mimeType': presetInsertFileInfo.type,
				};
				setImagePreview(fileInfo);
				updateCompressButtonState(fileInfo);
				$inputFile.attr({
					'data-upload-file': JSON.stringify({
						'name': presetInsertFileInfo.name,
						'ext': getExtension(presetInsertFileInfo.name),
						'size': presetInsertFileInfo.size,
						'type': presetInsertFileInfo.type,
						'base64': presetInsertFileInfo.base64,
					})
				});
				$inputFileName.val((function(){
					if( !isValidFilename(presetInsertFileInfo.name) ){
						return generateAutoFilename(presetInsertFileInfo.name);
					}
					return presetInsertFileInfo.name;
				})());
			}

			$inputFile
				.on('change', function(e){
					var $this = $(this);
					var fileInfo = e.target.files[0];
					var realpathSelected = $this.val();

					$inputOriginalFileName.val(fileInfo.name);

					if( realpathSelected ){
						readSelectedLocalFile(fileInfo, function(dataUri){
							var previewInfo = {
								'src': dataUri,
								'ext': getExtension(fileInfo.name),
								'size': fileInfo.size,
								'mimeType': fileInfo.type,
							};
							setImagePreview(previewInfo);
							updateCompressButtonState(previewInfo);
							$this.attr({
								'data-upload-file': JSON.stringify({
									'name': fileInfo.name,
									'ext': getExtension(fileInfo.name),
									'size': fileInfo.size,
									'type': fileInfo.type,
									'base64': dataUri,
								})
							});
							$inputFileName.val((function(){
								if( !isValidFilename(fileInfo.name) ){
									return generateAutoFilename(fileInfo.name);
								}
								return fileInfo.name;
							})());
						});
					}
				});

			var $imagePreviewArea = $body.find('.pickles2-contents-editor__default-image-preview');
			$imagePreviewArea
				.on('paste', function(e){
					var items = e.originalEvent.clipboardData.items;
					for (var i = 0 ; i < items.length ; i++) {
						var item = items[i];
						var fileInfo = item.getAsFile();

						$inputOriginalFileName.val(fileInfo.name);

						fileInfo.name = fileInfo.name||'clipboard.'+(function(type){
							if(type.match(/png$/i)){return 'png';}
							if(type.match(/gif$/i)){return 'gif';}
							if(type.match(/(?:jpeg|jpg|jpe)$/i)){return 'jpg';}
							if(type.match(/webp$/i)){return 'webp';}
							if(type.match(/svg/i)){return 'svg';}
							return getExtension(fileInfo.name);
						})(fileInfo.type);

						// mod.filename
						readSelectedLocalFile(fileInfo, function(dataUri){
							var previewInfo = {
								'src': dataUri,
								'ext': getExtension(fileInfo.name),
								'size': fileInfo.size,
								'mimeType': fileInfo.type,
							};
							setImagePreview(previewInfo);
							updateCompressButtonState(previewInfo);
							$inputFile.attr({
								'data-upload-file': JSON.stringify({
									'name': fileInfo.name,
									'ext': getExtension(fileInfo.name),
									'size': fileInfo.size,
									'type': fileInfo.type,
									'base64': dataUri,
								})
							});
							$inputFileName.val( generateAutoFilename(fileInfo.name) );
						});
					}
				})
				.on('dragover', function(e){
					e.stopPropagation();
					e.preventDefault();
					$(this).css({
						'outline': '3px dashed #0066cc',
						'outline-offset': '-3px',
					});
				})
				.on('dragleave', function(e){
					e.stopPropagation();
					e.preventDefault();
					$(this).css({
						'outline': '',
						'outline-offset': '',
					});
				})
				.on('drop', function(e){
					e.stopPropagation();
					e.preventDefault();
					$(this).css({
						'outline': '',
						'outline-offset': '',
					});

					var event = e.originalEvent;
					var droppedFileInfo = event.dataTransfer.files[0];

					$inputOriginalFileName.val(droppedFileInfo.name);

					// mod.filename
					readSelectedLocalFile(droppedFileInfo, function(_dataUri){
						var fileInfo = {
							'name': droppedFileInfo.name,
							'ext': getExtension( droppedFileInfo.name ),
							'size': droppedFileInfo.size,
							'type': droppedFileInfo.type,
						};

						var previewInfo = {
							'src': _dataUri,
							'ext': fileInfo.ext,
							'size': fileInfo.size,
							'mimeType': fileInfo.type,
						};
						setImagePreview(previewInfo);
						updateCompressButtonState(previewInfo);
						$inputFile.attr({
							'data-upload-file': JSON.stringify({
								'name': fileInfo.name,
								'ext': fileInfo.ext,
								'size': fileInfo.size,
								'type': fileInfo.type,
								'base64': _dataUri,
							})
						});
						$inputFileName.val((function(){
							if( !isValidFilename(fileInfo.name) ){
								return generateAutoFilename(fileInfo.name);
							}
							return fileInfo.name;
						})());
					});
				});

			// 圧縮ボタンのクリックイベント
			$compressBtn.on('click', function(){
				var fileInfoJSON = $inputFile.attr('data-upload-file');
				if( !fileInfoJSON ){
					return;
				}

				var fileInfo = JSON.parse(fileInfoJSON);
				if( !canFilePreviewAsImage(fileInfo.type, fileInfo.ext) ){
					return;
				}

				// 圧縮処理
				compressImage(fileInfo.base64, function(compressedDataUri){
					// ファイル名を .webp に変更
					var newFileName = fileInfo.name.replace(/\.[^.]+$/, '.webp');
					
					var compressedFileInfo = {
						'name': newFileName,
						'ext': 'webp',
						'type': 'image/webp',
						'base64': compressedDataUri,
					};

					// プレビューを更新
					var previewInfo = {
						'src': compressedDataUri,
						'ext': 'webp',
						'mimeType': 'image/webp',
					};
					setImagePreview(previewInfo);
					updateCompressButtonState(previewInfo);

					// データを更新
					$inputFile.attr({
						'data-upload-file': JSON.stringify(compressedFileInfo)
					});
					$inputFileName.val(newFileName);
				});
			});

		});
	}

	return {
		openInsertImageDialog: openInsertImageDialog,
		getExtension: getExtension,
		readSelectedLocalFile: readSelectedLocalFile
	};
};
