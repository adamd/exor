$(document).ready(function() { 
  //Change skin
  $("a.color-box").click(function(e) {	  
	 $("#swatches").attr("href",$(this).attr('href'));	
	 e.preventDefault();	 
  });	
   //Change swatches
  $("a.skin-box").click(function(e) {	  
	 $("#skin").attr("href",$(this).attr('href'));
	 e.preventDefault();		 
  });
  //Show/Hide Theme options
  var $collapse	 = $('#collapse');
  $collapse.on('click', function(){
	  $('#show-hide').toggle('fast');
  });
});
