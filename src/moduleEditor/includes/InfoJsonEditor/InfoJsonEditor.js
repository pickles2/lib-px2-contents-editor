/**
 * InfoJsonEditor.js
 */
module.exports = function(px2ce){
	var _this = this;
	var $ = require('jquery');
	const Twig = require('twig');
	var px2style = window.px2style;

	this.edit = async function(prevValue){
		return new Promise((resolve, reject) => {
			const modal = px2style.modal({
				title: 'Edit info.json',
				body: `<div><p>TODO: info.json editor</p></div>`,
				form: {
					action: "javascript:void(0);",
					method: "get",
					submit: function(){
						console.info('Form has submitted.');
						modal.close();
						resolve(prevValue);
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
