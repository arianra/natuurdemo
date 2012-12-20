function( arr ){
	if(typeof arr != "array"){
		arr.each( function(i,e){
		excludedTotal += e.outerHeight();
		});
	}
	else
	{
		excludedTotal = arr.outerHeight();
	}
	
	var windowTotal = $(window).outerHeight();
	var excludedTotal = 0;

	try {
		return 100 - ( (excludedTotal / windowTotal) * 100) 
	}
	catch(err)
	{
		console.log( err )
	}

}