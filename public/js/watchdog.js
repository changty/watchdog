$('body').on('click', '.action', function(e) {
	e.preventDefault(); 
	var self = this; 
	console.log($(this).attr('data-device'));

	$.ajax({
		data: {
				device: $(this).attr('data-device'), 
				status: $(this).attr('data-status')
		},
		type: 'POST',
		url: '/action',
		success: function(data) {
			console.log(data, $(self).attr('data-device'), self);
			if($(self).attr('data-status') === 'on') {
				$(self).attr('data-status', 'off');
			}
			else {
				$(self).attr('data-status', 'on')
			}
		},
		error: function(err) {
			console.log(err); 
		} 
	});
});