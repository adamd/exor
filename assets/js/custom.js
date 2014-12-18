// GLOBALS
var last_search = "*";

$(document).ready(listeners);

function listeners() {
  // Search form submitted
  $('#search').submit(function(e) {
    e.preventDefault();
    call_search($('#q').val());
  });

  // Search form may be emptied
  $('#search input').blur(check_search);
  $('#search input').keyup(check_search);

  // Suggest search term clicked
  $('form a').click(function(e) {
    e.preventDefault();
    suggested_search($(e.target).text());
  });

  // Search details clicked
  $('#showcase .btn').click(function(e) {
    e.preventDefault();
    $('#showcase div').removeClass("selected");

    var pdiv = $(e.target).parent();
    pdiv = $(e.target).closest("div");
    var prez = pdiv.attr("id").replace("-details", "");
    pdiv.addClass("selected");
    call_details(prez, last_search, 1);
  });
}


// FUNCTIONS FOR MAIN SEARCH
function fade_search(opacity) {
  $('#showcase h2').fadeTo(500, opacity);
  $('#showcase p').fadeTo(500, opacity);
}
function enable_search() {
  fade_search(1);
  $('#search input').removeClass("loading");
}
function disable_search() {
  fade_search(0);
  $('#search input').addClass("loading");
}
function call_search(q) {
  if (q.trim().length == 0) {
    return;
  }

  fade_details(0);
  $('#showcase div').removeClass("selected");
  disable_search();
  last_search = q;
  $.getJSON("/search/" + encodeURIComponent(q), function(data) {
    $.each( data, function( key, val ) {
      update_president(key, val);
    });
    enable_search();
    //call_details('clinton', last_search, 1);
  });
}
function suggested_search(q) {
  // TODO: local cache the suggested search terms for faster responses
  $('#q').val(q);
  call_search(q);
}
function check_search() {
  if ($('#q').val().length == 0 && last_search != "*") {
    clear_search();
  }
}
function clear_search() {
  update_president('clinton', 308);
  update_president('bush', 287);
  update_president('obama', 192);
  last_search = "*";
  $("#features").fadeOut();
  $('#showcase div').removeClass("selected");
}

function update_president(prez, count) {
  // Update count
  //$('#' + prez + ' h2').text(count); // direct update
  $('#' + prez + ' h2').countTo({from: 0, to: count}); // animated count

  // Update per day
  obamadays = 2151; // as of December 12, 2014
  twotermdays = 2922; // Bush and Clinton both have same 

  var days;

  if (count == 0) {
    days = 0;
  }
  else {
    days = 0;
    if (prez == "obama") {
      days = obamadays / count;
    }
    else {
      days = twotermdays / count;
    }
    days = days.toFixed(2);
  }
  //$('#' + prez + '-days').text(days); // direct update
  $('#' + prez + '-days').countTo({
    from: 0, to: days, 
    formatter: function(value, options){
      return value.toFixed(2);
    }
  }); // animated count
}

// FUNCTIONS FOR DETAIL SEARCH
function call_details(prez, q, pg) {
  fade_details(0);
  $.getJSON("/details/" + prez + "/" + encodeURIComponent(q) + "/" + pg, function(data) {
    $('#results').html("");
    $.each(data.results, function(i, item) {
      var link = $('<a>').attr('href', item.url).text(item.title);
      var tr = $('<tr>').append(
        $('<td>').text(item.signed_date),
        $('<td>').append($('<a>').text(item.title).attr('href', item.url))
      );
      tr.appendTo("#results");
    });
    if (data.results.length == 100) {
      var tr = $('<tr class="notation">').append(
        $('<td colspan="2" style="text-align: center">').text("Results limited to first 100 executive orders")
      );
      tr.appendTo("#results");
    }
    fade_details(1);
    $.scrollTo("#features", 1000, {offset:-150});
  });
}
function fade_details(opacity) {
  var dpane = $('#features');
  switch (opacity) {
    case 0:
      dpane.fadeOut();
    break;
    case 1:
      dpane.fadeIn();
    break;
    default:
      dpane.fadeTo(500, opacity);
    break;
  }
}
