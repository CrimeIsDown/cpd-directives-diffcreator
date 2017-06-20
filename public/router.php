<?php

$url = strtolower($_SERVER['REQUEST_URI']);

// Make sure the URI matches our scheme exactly (to avoid file traversal)
if (!preg_match('/^\/diff\/([a-z0-9]{40})\/directives\/data\/[a-z0-9\-]{45}\.html$/', $url, $urlmatches)) {
    http_response_code(404);
}

$commit = $urlmatches[1]; // Pull the commit from our regex

$html = file_get_contents(__DIR__.$url);
$file = substr($url, strrpos($url, '/'));

// Check if we have the file
if (!$html) {
    // If we don't have a diff of the file, pull the relevant version from the git repo
    // @TODO: Use a git command to fetch the file instead of using master
    $path = __DIR__.'/../directives'.substr($url, strpos($url, '/directives/data/'));
    $html = file_get_contents($path);
    if (!$html) {
        // We must not have the file at all, return 404
        http_response_code(404);
    }
}

// Make sure assets load on HTTPS
$html = str_replace('ContentPackages/Core/Stylesheets/Core.css?bv=288', 'https://directives.crimeisdown.com/cpd-assets/Core.css', $html);
$html = str_replace('ContentPackages/components/General.css?bv=288', 'https://directives.crimeisdown.com/cpd-assets/General.css', $html);
$html = str_replace('ContentPackages/Core/Transforms/lang/en/strings.js?bv=288', 'https://directives.crimeisdown.com/cpd-assets/strings.js', $html);
$html = str_replace('ContentPackages/Core/Transforms/code/CommonUtilities.js?bv=288', 'https://directives.crimeisdown.com/cpd-assets/CommonUtilities.js', $html);
$html = str_replace('</head>', '<link type="text/css" rel="stylesheet" href="https://directives.crimeisdown.com/iframe.css">'."\n</head>", $html);

// Set a base so links don't break
$html = str_replace('<head>', "<head>\n<base href=\"http://directives.chicagopolice.org/directives/data/$file\">", $html);

// If one directive links to another, go to the version of it we had at the time of scraping
$html = preg_replace('/<a href="([a-z0-9\-]{45})\.html" target="new">/i', '<a href="https://directives.crimeisdown.com/diff/'.$commit.'/directives/data/$1.html" target="new">', $html);

echo $html;
