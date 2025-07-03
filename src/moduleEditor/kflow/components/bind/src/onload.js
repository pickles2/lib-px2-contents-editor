// bind.kflow
const $ = fieldHelper.$;
const $dom = $(dom);
const $input = $dom.find('input[name="_"]');
const $select = $dom.find('select');
const infoJson = fieldHelper.extra.__PX2CE_MODULE_EDITOR_GET_INFOJSON__();
if(!infoJson){ infoJson = {}; }
if(!infoJson.interface){ infoJson.interface = {}; }
if(!infoJson.interface.fields){ infoJson.interface.fields = {}; }

Object.keys(infoJson.interface.fields).forEach((key) => {
	const currentField = infoJson.interface.fields[key];
	const $option = $('<option></option>');
	$option.attr('value', key);
	$option.text(`${currentField.label || key} (${key})`);
	if($input.val() == key){
		$option.attr('selected', true);
	}
	$select.append($option);
});
$select.on('change', function(){
	$input.val($(this).val());
}).trigger('change');
