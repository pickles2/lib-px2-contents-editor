/**
 * InfoJsonEditor.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	var px2style = window.px2style;
	const template = require('-!text-loader!./includes/templates/form.twig');

	this.edit = async function(prevValue, options = {}){
		return new Promise((resolve, reject) => {
			const $body = $(px2ce.bindTwig(template, {
				value: prevValue || '',
				title: options.title || 'JSON',
			}));
			const modal = px2style.modal({
				title: options.title || 'Edit JSON',
				body: $body,
				width: 700,
				form: {
					action: "javascript:void(0);",
					method: "get",
					submit: function(){
						const retouchedValue = $body.find('textarea[name="value"]').val();
						modal.close();
						resolve(retouchedValue);
					},
				},
				buttons: [
					$('<button type="submit" class="px2-btn px2-btn--primary">OK</button>'),
				],
				buttonsSecondary: [
					$('<button type="button" class="px2-btn">Cancel</button>')
						.on('click', function(){
							modal.close();
							resolve(prevValue);
						}),
				],
			});
		});
	}
}
