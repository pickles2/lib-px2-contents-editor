<?php
$template = file_get_contents(__DIR__.'/templates/bind.kflow');
$onloadFunction = file_get_contents(__DIR__.'/../tmp_dist/onload.js');
$dist = __DIR__.'/../../../../../../data/moduleEditor/kflow/components/bind.kflow';

$kflowSrc = str_replace('{{___bindOnloadFunction___}}', $onloadFunction, $template);
$result = file_put_contents($dist, $kflowSrc);

if ($result === false) {
    echo "Error: Failed to write to $dist\n";
    exit(1);
}
exit;
