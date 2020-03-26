<?php
ini_set('display_errors', true);
ini_set('log_errors', true);

require __DIR__.'/../vendor/autoload.php';

use GitWrapper\GitWrapper;

$url = strtok($_SERVER['REQUEST_URI'], '?');

// Make sure the URI matches our scheme exactly (to avoid file traversal)
if (preg_match('/^\/diff\/([a-z0-9]{40})\/directives\/data\/[a-z0-9\-]{45}\.html$/', $url, $urlmatches)) {
    $commit = $urlmatches[1]; // Pull the commit from our regex
    $html = file_get_contents(__DIR__.$url);
} else if (preg_match('/^\/([a-z0-9]{40})\/directives\/data\/[a-zA-Z0-9\-_]+\.html$/', $url, $urlmatches)) {
    $file = substr($url, strpos($url, 'directives/data/'));

    http_response_code(301);
    header('Location: /'.$file.'?commit='.$urlmatches[1]);
    exit;
} else if (preg_match('/^\/directives\/data\/[a-zA-Z0-9\-_]+\.html$/', $url, $urlmatches)) {
    // If we don't have a diff of the file, pull the relevant version from the git repo
    $file = substr($url, strpos($url, 'directives/data/'));

    $GIT_PATH = __DIR__.'/../directives';
    $wrapper = new GitWrapper();
    if (file_exists($GIT_PATH)) {
        $git = $wrapper->workingCopy($GIT_PATH);
    } else {
        http_response_code(500);
        die('Cannot locate repository');
    }

    // @TODO Limit to hash
    if (isset($_GET['date'])) {
        $commit = trim($git->run('rev-list', ['HEAD', $file, ['n' => '1', 'before' => $_GET['date']]]));
    } else if (isset($_GET['commit']) && preg_match('/^[a-z0-9^~]+$/', $_GET['commit'])) {
        $commit = $_GET['commit'];
    } else {
        $commit = 'HEAD';
    }

    try {
        $html = $git->show($commit.':'.$file);
    } catch (\Exception $e) {
        http_response_code(404);
    }
} else {
    http_response_code(404);
    exit;
}

// If one directive links to another, go to the version of it we had at the time of scraping
$html = preg_replace('/<a href="([a-z0-9\-]{45})\.html" target="new">/i', '<a href="/directives/data/$1.html?commit='.$commit.'" target="new">', $html);

// Add in our iframe css
$html = str_replace('</head>', '<link type="text/css" rel="stylesheet" href="/assets/iframe.css">'."\n</head>", $html);

echo $html;
