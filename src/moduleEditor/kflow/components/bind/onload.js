// bind.kflow
const $input = dom.querySelector('input[name="_"]');
const $select = dom.querySelector('select[name="field-selector"]');
const infoJson = fieldHelper.extra.__PX2CE_MODULE_EDITOR_GET_INFOJSON__();
if(!infoJson){ infoJson = {}; }
if(!infoJson.interface){ infoJson.interface = {}; }
if(!infoJson.interface.fields){ infoJson.interface.fields = {}; }

Object.keys(infoJson.interface.fields).forEach((key) => {
	const currentField = infoJson.interface.fields[key];
	const $option = document.createElement('option');
	$option.value = key;
	$option.textContent = `${currentField.label || key} (${key})`;
	if($input.value == key){
		$option.selected = true;
	}
	$select.appendChild($option);
});
$select.addEventListener('change', function(){
	$input.value = this.value;
	$input.dispatchEvent(new Event('input'));
});
$select.dispatchEvent(new Event('change'));
