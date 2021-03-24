$(function() {

  var opts = {
    lines: 13, // The number of lines to draw
    length: 38, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-more', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#0080ff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    zIndex: 2000000000, // The z-index (defaults to 2e9)
    className: 'spinner', // The CSS class to assign to the spinner
    position: 'absolute', // Element positioning
  };

    $('#search').keyup(function() {
        var search_term = $(this).val();
        $.ajax({
            method: 'POST',
            url: '/api/search',
            data: {
                search_term
            },
            dataType: 'json',
            success: function(json) {
                var data = json.hits.hits.map(function(hit) {
                    return hit;
                });
                
                $('#searchResults').empty();
                for(var i = 0; i < data.length; i++) {
                    var html = "";

                    html += '<div class="col-md-4">';
                    html += '<div href="#" class="card card-product-grid">';
                    html += '<a href="/product/'+ data[i]._source._id + 'class="img-wrap"><img src="' + data[i]._source.image + '"></a>';
                    html += '<figcaption class="info-wrap">';
                    html += '<hr>';
                    html += '<p>Category:' + data[i]._source.category.name + '</p>';
                    html += '<a href="#" class="title">';
                    html += '<bold>'+ data[i]._source.name + '</bold>';
                    html += '</a>';
                    html += '<div class="rating-wrap">';
                    html += '<ul class="rating-stars">';
                    html += '<li style="width:80%" class="stars-active">';
                    html += '<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>';
                    html += '</li>';
                    html += '<li><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>';
                    html += '</li></ul></div>';
                    html += '<hr>';
                    html += '<div class="price mt-1">Price:' + data[i]._source.price + 'Ksh</div>';
                    html += '</figcaption></div></div>';

                    $('#searchResults').append(html);
                }
            },
            error: function(error) {
                console.log(err);
            }
        });
    });

    $(document).on('click', '#plus', function(e) {
      e.preventDefault();
      var priceValue = parseFloat($('#priceValue').val());
      var quantity = parseInt($('#quantity').val());
  
      priceValue += parseFloat($('#priceHidden').val());
      quantity += 1;
  
      $('#quantity').val(quantity);
      $('#priceValue').val(priceValue.toFixed(2));
      $('#total').html(quantity);
    });
  
  
    $(document).on('click', '#minus', function(e) {
      e.preventDefault();
      var priceValue = parseFloat($('#priceValue').val());
      var quantity = parseInt($('#quantity').val());
  
  
      if (quantity == 1) {
        priceValue = $('#priceHidden').val();
        quantity = 1;
      } else {
        priceValue -= parseFloat($('#priceHidden').val());
        quantity -= 1;
      }
  
      $('#quantity').val(quantity);
      $('#priceValue').val(priceValue.toFixed(2));
      $('#total').html(quantity);
    });

});

