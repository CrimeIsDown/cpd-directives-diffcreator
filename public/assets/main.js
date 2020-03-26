var form = document.getElementById('findDirectiveForm');
form.addEventListener('submit', function (event) {
    event.preventDefault();
    var url = new URL(document.getElementById('url').value);
    var date = document.getElementById('date').value;
    location.assign(url.pathname + '?date=' + date);
});

$.getJSON('https://directives.crimeisdown.com/diff_list.json', function(directives) {
  $('#directives').bootstrapTable({data: directives});

  $('#directives td > a').click(function (event) {
    event.preventDefault();
    openDirective($(this).attr('href'), $(this).text());
  });

  if (window.location.hash) {
    var path = window.location.hash.substring(1);
    var title = $('#directives td > a[href="https://directives.crimeisdown.com/diff/' + path + '"]').text();
    window.location.hash = '';
    openDirective('https://directives.crimeisdown.com/diff/' + path, title);
  }

  $('#directiveViewer').on('hidden.bs.modal', function (e) {
    var scrollPos = window.scrollY;
    window.location.hash = '';
    window.scroll(0, scrollPos);
  });
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
  var url = (new URL(path)).pathname.replace('/diff/', '');
  $('#directiveViewer #no-highlights-btn').attr('href', '/' + url);
  window.location.hash = url;
  $('#directiveViewer input[type="text"]').val(window.location);
  ga('send', 'event', 'Directive', 'open', title);
}

$('#directiveViewer form input').focus(function (event) {
  $(this).select();
  try {
    document.execCommand('copy');
  } catch (e) {
    // not supported
  }
});

// GOOGLE ANALYTICS START
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-30674963-12', 'auto');
ga('send', 'pageview');
// GOOGLE ANALYTICS END
