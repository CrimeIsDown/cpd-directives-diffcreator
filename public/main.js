$.getJSON('diff_list.json', function(directives) {
  $('#directives').bootstrapTable({data: directives});

  $('#directives td > a').click(function (event) {
    event.preventDefault();
    openDirective($(this).attr('href'), $(this).text());
  });

  if (window.location.hash) {
    var path = window.location.hash.substring(1);
    var title = $('#directives td > a[href="./diff/' + path + '"]').text();
    openDirective('./diff/' + path, title);
  }
});

function dateSorter(a, b) {
  a = new Date(a);
  b = new Date(b);
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

function openDirective(path, title) {
  $('#directiveViewer h4.modal-title').text(title);
  $('#directiveViewer iframe a').attr('href', path);
  $('#directiveViewer iframe').attr('src', path);
  $('#directiveViewer').modal();
  window.location.hash = '#' + path.substring(7);
  $('#directiveViewer input[type="text"]').val(window.location);
}

$('#directiveViewer form input').focus(function (event) {
  $(this).select();
  try {
    document.execCommand('copy');
  } catch (e) {
    // not supported
  }
});

$('#directiveViewer').on('hidden.bs.modal', function () {
    window.location.hash = '';
});

// GOOGLE ANALYTICS START
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-30674963-12', 'auto');
ga('send', 'pageview');
// GOOGLE ANALYTICS END
