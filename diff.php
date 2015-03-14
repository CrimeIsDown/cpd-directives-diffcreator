<?php

require __DIR__.'/vendor/autoload.php';

use GitWrapper\GitWrapper;
use Caxy\HtmlDiff\HtmlDiff;

$public_path = __DIR__.'/public';

$html = '';

// $link = 'http://directives.chicagopolice.org/directives/data/a7a57be2-1290de63-7db12-90f0-e9796f7bbbc1a2d2.html?hl=true';
// $file = substr($link, strrpos($link, '/directives/data')+1, strpos($link, '.html')-strrpos($link, '/directives/data')+4).'?ownapi=1';

$wrapper = new GitWrapper();
$git = $wrapper->workingCopy('.');
$git->log();

$commits = array_values(preg_grep('/^commit /', explode("\n", $git->getOutput())));
foreach ($commits as $key => $value) {
    $commits[$key] = str_replace('commit ', '', $value);
}

for ($i = 0; $i < count($commits); $i+=2) {
    if (!isset($commits[$i+1])) break;

    $git->diff($commits[$i+1], $commits[$i]);
    $diffs = explode("\n", $git->getOutput());

    $directives = [];
    foreach ($diffs as $index=>$line) {
        if (strpos($line, '+<td class="td1">Issue Date:</td>')!==false) {
            for ($j = $index; $j > 0; $j--) {
                if (strpos($diffs[$j], '+++ b/')!==false) {
                    array_push($directives, substr($diffs[$j], 6));
                    break;
                }
            }
        }
    }

    $git->log('--format=%B', '-n', '1', $commits[$i+1]);
    $old = trim($git->getOutput());
    $git->log('--format=%B', '-n', '1', $commits[$i]);
    $new = trim($git->getOutput());

    $html .= PHP_EOL.'<h2>Changed between "'.$old.'" and "'.$new.'"</h2>'.PHP_EOL;

    $diff_path = '/diff/'.$commits[$i+1].'_'.$commits[$i];
    if (!is_dir($public_path.$diff_path)) {
        mkdir($public_path.$diff_path, 0777, true);
    }

    $html .= '<ul>'.PHP_EOL;

    foreach ($directives as $cnt => $file) {
        $file_path = $public_path.$diff_path.'/'.$file;
        // if (file_exists($file_path)) {
        //     $git->show($commits[$i].':'.$file);
        //     $new = $git->getOutput();
        //     $title = [];
        //     preg_match('/<title>(.*?)<\/title>/', $new, $title);
        //     $title = $title[1];
        //     $html .= '<a href="'.$diff_path.'/'.$file.'">'.$title.'</a>'.PHP_EOL;
        //     // we already made the diff, skipping
        //     continue;
        // }

        // echo 'git log '.$commits[$i+1].' '.$file.PHP_EOL;
        // $git->log($commits[$i+1], $file);
        // if (empty($git->getOutput())) {
        //     // new file, skipping
        //     continue;
        // }

        try {
            $git->show($commits[$i+1].':'.$file);
            $old = $git->getOutput();
            $git->show($commits[$i].':'.$file);
            $new = $git->getOutput();
        } catch (Exception $e) {
            echo $e->getMessage().PHP_EOL;
            continue;
        }

        if (strip_tags($old)==strip_tags($new)) break;

        $title = [];
        preg_match('/<title>(.*?)<\/title>/', $new, $title);
        $title = $title[1];

        $diff = new HtmlDiff($old, $new);
        $diff->build();
        $difference = str_replace('="ContentPackages/', '="http://directives.chicagopolice.org/directives/data/ContentPackages/', $diff->getDifference());

        if (!is_dir(substr($file_path, 0, strrpos($file_path, '/')))) {
            mkdir(substr($file_path, 0, strrpos($file_path, '/')), 0777, true);
        }
        file_put_contents($file_path, $difference);

        $html .= '<li><a href="'.$diff_path.'/'.urlencode($file).'">'.$title.'</a></li>'.PHP_EOL;

        echo 'Directive '.($cnt+1).' out of '.count($directives).' complete'.PHP_EOL;
    }
    $html .= '</ul>'.PHP_EOL;

    echo 'Diff set '.(($i+2)/2).' out of '.(count($commits)/2).PHP_EOL;
}

file_put_contents($public_path.'/index.html', $html);

?>
