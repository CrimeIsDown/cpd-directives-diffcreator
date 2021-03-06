<?php
require __DIR__.'/vendor/autoload.php';

use GitWrapper\GitWrapper;
use Caxy\HtmlDiff\HtmlDiff;

class DirectiveDiffer
{
    const PUBLIC_PATH = __DIR__.'/public';
    private $commit;
    private $file;
    private $git;

    public function __construct($commit, $file, $git)
    {
        $this->commit = $commit;
        $this->file = $file;
        $this->git = $git;
    }

    public function generate()
    {
        $new = $this->getNewFile();
        if ($new) {
            $old = $this->getOldFile($new);
            if ($old) {
                $difftext = $this->generateDiff($old, $new);
                $this->writeDiff($difftext);
            }
            return $this->getMetadata($new);
        }
        return false;
    }

    private function getNewFile()
    {
        try {
            return $this->git->show($this->commit.':'.$this->file);
        } catch (\Exception $e) {
            return false;
        }
    }

    private function getOldFile($new)
    {
        try {
            return $this->git->show($this->commit.'^1:'.$this->file);
        } catch (\Exception $e) {
            $this->writeDiff($new);
            return false;
        }
    }

    private function generateDiff($old, $new)
    {
        $diff = new HtmlDiff($old, $new);
        $diff->build();
        $diffHtml = $diff->getDifference();
        // Hacky workaround for https://github.com/caxy/php-htmldiff/issues/59
        $result = preg_replace('/<body(.*?)>(.*?)<\/body>/is', '<body>' . $diffHtml . '</body>', $new);
        if ($result === $new) {
            echo $new.PHP_EOL;
            throw new \Exception('Failed to do replacement');
        }
        return $result;
    }

    private function writeDiff($difftext)
    {
        file_put_contents(self::PUBLIC_PATH."/diff/$this->commit/$this->file", $difftext);
    }

    private function getMetadata($html)
    {
        $metadata = ['path' => $this->commit.'/'.$this->file];

        preg_match('/<title>(.*?)<\/title>/', $html, $matches);
        if (count($matches)) {
            $metadata['title'] = $matches[1];
            $metadata['link'] = '<a href="https://directives.crimeisdown.com/diff/'.$metadata['path'].'">'.$metadata['title'].'</a>';
        }

        preg_match('/<td class="td1">Issue Date:<\/td><td class="td2">(.*?)<\/td>/', $html, $matches);
        if (count($matches)) $metadata['issue_date'] = $matches[1];

        preg_match('/<td class="td1">Effective Date:<\/td><td class="td2">(.*?)<\/td>/', $html, $matches);
        if (count($matches)) $metadata['effective_date'] = $matches[1];

        preg_match('/<td class="td1">Rescinds:<\/td><td class="td3" colspan="3">(.*?)<\/td>/', $html, $matches);
        if (count($matches)) $metadata['rescinds'] = $matches[1];

        preg_match('/<td class="CPDDirectiveTypeAndNumber">(.*?)&nbsp;(.*?)<\/td>/', $html, $matches);
        if (count($matches)) $metadata['index_category'] = $matches[1];

        preg_match('/<td class="td1">Index Category:<\/td><td class="td3" colspan="3">(.*?)<\/td>/', $html, $matches);
        if (count($matches)) $metadata['index_category'] .= ' - '.$matches[1];

        if (count($metadata) == 7) {
            return (object) $metadata;
        }
    }
}

class ChangeFinder
{
    const PUBLIC_PATH = __DIR__.'/public';
    const GIT_PATH = __DIR__.'/directives';
    private $finished_diffs;
    private $git;

    public function __construct()
    {
        $wrapper = new GitWrapper();
        if (file_exists(self::GIT_PATH)) {
            $this->git = $wrapper->workingCopy(self::GIT_PATH);
        } else {
            die('Cannot locate repository');
        }

        if (file_exists(self::PUBLIC_PATH.'/diff_list.json')) {
            $this->finished_diffs = json_decode(file_get_contents(self::PUBLIC_PATH.'/diff_list.json'));
        } else {
            $this->finished_diffs = [];
            file_put_contents(self::PUBLIC_PATH.'/diff_list.json', json_encode($this->finished_diffs), JSON_PRETTY_PRINT);
        }
    }

    // find the commits that we have not checked for diffs
    public function getCommitsToDiff()
    {
        $commits = explode("\n", trim($this->git->log('--format=%H')));
        $to_check = [];

        foreach ($commits as $i => $commit) {
            $diff_folder = self::PUBLIC_PATH . '/diff/' . $commit;
            if (!file_exists($diff_folder) || count(scandir($diff_folder . '/directives/data')) < 3) {
                $to_check[] = $commit;
            }
        }

        echo 'Need to diff '.max(0, count($to_check)-1).' commits out of a total '.(count($commits)-1).PHP_EOL;

        return $to_check;
    }

    public function getFilesChangedInCommit($commit, &$changed_files)
    {
        $data_dir = self::PUBLIC_PATH."/diff/$commit/directives/data/";
        if (!file_exists($data_dir)) {
            mkdir(self::PUBLIC_PATH."/diff/$commit/directives/data/", 0777, true);
        }
        try {
            $file_list = explode("\n", trim($this->git->diff($commit, $commit.'^1', '--numstat', '-w', '--no-abbrev')));
        } catch (\GitWrapper\Exception\GitException $e)  {
            return false; // probably first commit
        }

        foreach ($file_list as $i => $file) {
            preg_match('/^([0-9]+)\t([0-9]+)\t(.*)/', $file, $matches);
            if ($matches[1] != $matches[2] && strpos($matches[3], 'toc.html')===false) {
                $changed_files[] = ['commit' => $commit, 'path' => $matches[3]];
            }
        }
    }

    public function generateDiff($commit, $file)
    {
        $differ = new DirectiveDiffer($commit, $file, $this->git);
        $result = $differ->generate();
        if ($result) {
            $this->finished_diffs[] = $result;
        }
    }

    public function saveJson()
    {
        file_put_contents(self::PUBLIC_PATH.'/diff_list.json', json_encode($this->finished_diffs, JSON_PRETTY_PRINT));
    }
}

echo 'Initializing...'.PHP_EOL;
$c = new ChangeFinder();
$commits = $c->getCommitsToDiff();

$changed_files = [];
foreach ($commits as $commit) {
    $c->getFilesChangedInCommit($commit, $changed_files);
}

echo 'Need to calculate diffs for '.count($changed_files).' files'.PHP_EOL;

foreach ($changed_files as $i => $file) {
    echo 'Calculating diff '.($i+1).' of '.count($changed_files).PHP_EOL;
    $c->generateDiff($file['commit'], $file['path']);
    $c->saveJson();
}

echo 'Saving JSON...'.PHP_EOL;
$c->saveJson();

?>
