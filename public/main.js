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
