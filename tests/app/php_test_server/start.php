<?php
static $pid;
if($pid){
    return;
}
$WEB_SERVER_HOST = '127.0.0.1';
$WEB_SERVER_PORT = 8088;
// $WEB_SERVER_DOCROOT = __DIR__.'/../../htdocs2/htdocs/';
// $WEB_SERVER_ROUTER = __DIR__.'/router.php';
$WEB_SERVER_DOCROOT = __DIR__.'/../../../';
$WEB_SERVER_ROUTER = null;

// Command that starts the built-in web server
$command = sprintf(
    'php -S %s:%d -t %s %s >/dev/null 2>&1 & echo $!',
    $WEB_SERVER_HOST,
    $WEB_SERVER_PORT,
    $WEB_SERVER_DOCROOT,
    $WEB_SERVER_ROUTER
);

// Execute the command and store the process ID
$output = array();
exec($command, $output);
$pid = (int) $output[0];

echo sprintf(
    '%s - Web server started on %s:%d with PID %d',
    date('r'),
    $WEB_SERVER_HOST,
    $WEB_SERVER_PORT,
    $pid
) . PHP_EOL;

// Kill the web server when the process ends
register_shutdown_function(function() use ($pid) {
    echo sprintf('%s - Killing process with ID %d', date('r'), $pid) . PHP_EOL;
    exec('kill ' . $pid);
});
sleep(10000000000);
