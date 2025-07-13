<?php
function build_component($component_name) {
	$template = file_get_contents(__DIR__.'/'.urlencode($component_name).'/template.xml');
	$onloadFunction = file_get_contents(__DIR__.'/tmp_dist/'.urlencode($component_name).'.js');
	$dist = __DIR__.'/../../../../data/moduleEditor/kflow/components/'.urlencode($component_name).'.kflow';

	$kflowSrc = str_replace('{{___bindOnloadFunction___}}', $onloadFunction, $template);
	$result = file_put_contents($dist, $kflowSrc);

	if ($result === false) {
		echo "Error: Failed to write to $dist\n";
		exit(1);
	}
}

build_component('bind');
exit;
