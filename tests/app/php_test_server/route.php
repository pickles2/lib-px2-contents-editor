<?php
if( strrpos($_SERVER['REQUEST_URI'], '/tests/htdocs2/htdocs/subapp/') !== 0 ){
    return false;
}

chdir($_SERVER['DOCUMENT_ROOT']);
$path = $_SERVER['REQUEST_URI'];
$path_controot = '/tests/htdocs2/htdocs/subapp/';
$path = preg_replace('/^'.preg_quote($path_controot, '/').'/', '/', $path);
$path_entryScript = './tests/htdocs2/htdocs/subapp/.px_execute.php';
$script_name = '/tests/htdocs2/htdocs/subapp/.px_execute.php';
$querystring = '';

if( strpos($path, '?') !== false ){
    list($path, $querystring) = preg_split('/\?/', $path, 2);
}
if( strrpos($path, '/') === strlen($path)-1 || preg_match('/\.(?:html|htm|css|js)$/', $path) ){
    $_SERVER['SCRIPT_FILENAME'] = realpath($path_entryScript);
    $_SERVER['SCRIPT_NAME'] = $script_name;
    $_SERVER['PATH_INFO'] = $path;
    $_SERVER['PHP_SELF'] = $path_entryScript.$path;
    include($path_entryScript);
    return;
}
return false;
