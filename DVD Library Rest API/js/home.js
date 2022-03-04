$(document).ready(function () {
    loadDVDs();
    $('#editDvdDiv').hide();

	//brings up the Add Dvd menu
    $('#createButton').click(function () {
		$('#mainPage').hide();
		$('#addDvdDiv').show();
    });

	//resets the page back to initial load
    $('#addCancel').click(function () {
		resetAll();
    });

	//resets the page back to initial load
    $('#editCancel').click(function () {
		resetAll();
    });

	//resets the page back to initial load
    $('#displayCancel').click(function () {
		resetAll();
    });


    // Button click to add dvd to api
    $('#addDvdButton').click(function (event) {
		//emptys potential errors already loaded
        $('#errorMessages').empty();

		//title required, checks if it exists otherwise makes appropriate error
        if ($('#addDVDTitle').val() == "" ){

			$('#errorMessages')
				.append($('<li>')
				.attr({class: 'list-group-item list-group-item-danger'})
				.text('Please enter a title for the DVD.'));

				var stop = true;
        }

		//checks if year is empthy and if it doesnt have 4 digits, makes appropriate error accordingly	
        var year = $('#addReleaseYear').val();

        if (year.length !=4 || isNaN(year)==true){

			$('#errorMessages')
				.append($('<li>')
				.attr({class: 'list-group-item list-group-item-danger'})
				.text('Please enter a 4-digit year.'));

				var stop = true;
        }

		//if either error condition exists stop function so that it can be printed to user
        if(stop==true){return false;}

        //ajax call to add our valid info to a dvd in the api
        $.ajax({
			type: 'POST',
            url: 'http://dvd-library.us-east-1.elasticbeanstalk.com/dvd',
				data: JSON.stringify({
                title: $('#addDVDTitle').val(),
                releaseYear: $('#addReleaseYear').val(),
                director: $('#addDirector').val(),
                rating: $('#addRating').val(),
                notes: $('#addNotes').val()
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            'dataType': 'json',
            success: function(data) {
				//hides form and shows main table
                $('#addDvdDiv').hide();
                $('#mainPage').show();
				// clear errors
                $('#errorMessages').empty();
				// Clear the create form inputs
                $('#addDVDTitle').val('');
                $('#addReleaseYear').val('');
                $('#addDirector').val('');
                $('#addRating').val('');
                $('#addNotes').val('');
				//refresh the table to include new dvd
                loadDVDs();
                $('#errorMessages').empty();
            },
            error: function() {
				//error message if api cannot be reached
                $('#errorMessages')
					.append($('<li>')
					.attr({class: 'list-group-item list-group-item-danger'})
					.text('Error calling web service.  Please try again later.'));
            }
        });
        loadDVDs();
    });

    // Updates exisiting dvd with new user inputs
    $('#editDvdButton').click(function (event) {
		//emptys potential errors already loaded
        $('#errorMessages').empty();
		
		//hides edit form and brings up the main table
        $('#editDvdDiv').hide();
        $('#mainPage').show();

        //title required, checks if it exists otherwise makes appropriate error
        if ($('#editDVDTitle').val() == "" ){

			$('#errorMessages')
				.append($('<li>')
				.attr({class: 'list-group-item list-group-item-danger'})
				.text('Please enter a title for the DVD.'));

				var stop = true;

        }

		//checks if year is empthy and if it doesnt have 4 digits, makes appropriate error accordingly	
        var year = $('#editReleaseYear').val();

        if (year.length !=4 || isNaN(year)==true){

			$('#errorMessages')
				.append($('<li>')
				.attr({class: 'list-group-item list-group-item-danger'})
				.text('Please enter a 4-digit year.'));

				var stop = true;
        }

		//if either error condition exists stop function so that it can be printed to user
        if(stop==true){return false;}

        //ajax call to add new our valid info to an existing dvd in the api
        $.ajax({
			async: true,
			crossDomain: true,
			type: 'PUT',
			url: 'http://dvd-library.us-east-1.elasticbeanstalk.com/dvd/' + $('#editDVDId').val(),
			dataType: 'text',
			processData: false,
			data: JSON.stringify({
				id: $('#editDVDId').val(),
				title: $('#editDVDTitle').val(),
				releaseYear: $('#editReleaseYear').val(),
				director: $('#editDirector').val(),
				rating: $('#editRating').val(),
				notes: $('#editNotes').val(),
			}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
            success: function() {
				//clears any existing errors
				$('#errorMessages').empty();
				// refreshs main table to include new data
                loadDVDs();
           },
           error: function() {
				//error message if api cannot be reached
				$('#errorMessages')
					.append($('<li>')
					.attr({class: 'list-group-item list-group-item-danger'})
					.text('Error calling web service.  Please try again later.'));
           }
       })
    });

	//searchs api based on user criteria
    $('#searchButton').click(function(){
		//clear dvd table to get it prepped for search results
		clearDVDTable();
		
		//ensures that the main table is the only thing showing, not any forms
		resetAll();

		//parses choice from drop down and the user entered term
        var choice = $('#searchCategory').val();
        var term = $('#searchTerm').val();
		
		//uses the choice and term to determine the appropriate url needed if either one isnt valid then an error is thrown informing user
        if(choice == "showAll"){
			var tempurl='http://dvd-library.us-east-1.elasticbeanstalk.com/dvds';
        }
        else if(choice == "searchTitle" && term != null){
			var tempurl='http://dvd-library.us-east-1.elasticbeanstalk.com/dvds/title/' + term;
        }
        else if(choice == "searchYear" && term != null && term.length == 4 && isNaN(term) == false){
			var tempurl='http://dvd-library.us-east-1.elasticbeanstalk.com/dvds/year/' + term;
        }
        else if(choice == "searchDirector" && term != null){
			var tempurl='http://dvd-library.us-east-1.elasticbeanstalk.com/dvds/director/' + term;
        }
        else if(choice == "searchRating" && term != null){
			var tempurl='http://dvd-library.us-east-1.elasticbeanstalk.com/dvds/rating/' + term;
        }
        else{
            $('#errorMessages').append($('<li>Both Search Category and Search Term are required</li>'));
		}
		//assuming choice and term are valid passes the url to the next function to get the results
        searchDVDs(tempurl);
    });
})

//dynamically loads the dvd library into the user table
function loadDVDs() {
    //clear table data to ensure no duplicating each load
    clearDVDTable();
	
	//ensures that the main table is the only thing showing, not any forms
    resetAll();
	
	//emptys potential errors already loaded
    $('#errorMessages').empty();

    //grabs and loads the corresponding table element
    var contentRows = $('#contentRows');

	//ajax call to grab an array of dvds in the api and loads it into each row
    $.ajax ({
        type: 'GET',
        url: 'http://dvd-library.us-east-1.elasticbeanstalk.com/dvds',
        success: function (data, status) {
            //goes through the array and poppulating each index to its own row
			$.each(data, function (index, dvd) {
                var title = dvd.title;
                var releaseYear = dvd.releaseYear;
                var director = dvd.director;
                var rating = dvd.rating;
                var id = dvd.id;

                var row = '<tr>';
                    row += '<td align="center" width="25%"><a onclick="displayDVD(' + id + ')">' + title + '</a></td>';
                    row += '<td align="center" width="25%">' + releaseYear + '</td>';
                    row += '<td align="center" width="15%">' + director + '</td>';
                    row += '<td align="center" width="10%">' + rating + '</td>';
                    row += '<td align="center" width="5%"><a onclick="showEditForm(' + id + ')"><button type="button" class="btn btn-info">Edit</button></a></td>';
                    row += '<td align="center" width="5%"><a onclick="deleteDVD(' + id + ')"><button type="button" class="btn btn-danger">Delete</button></a></td>';
                    row += '<td width="15%"></td>';
                    row += '</tr>';
                contentRows.append(row);

                $('#errorMessages').empty();
            });
        },
        error: function() {
			//error message if api cannot be reached
            $('#errorMessages')
                .append($('<li>')
                .attr({class: 'list-group-item list-group-item-danger'})
                .text('Error calling web service.  Please try again later.'));
        }

    });
}

//emptys out the main table
function clearDVDTable() {
    $('#contentRows').empty();
}

// checks the passed input for errors
function checkAndDisplayValidationErrors(input) {
    //emptys potential errors already loaded
    $('#errorMessages').empty();
    
	//array to hold error the input might potentially have
    var errorMessages = [];

    // go through the input and check for validation errors
    input.each(function() {
        // Uses the HTML5 validation API to find the validation errors
        if(!this.validity.valid)
        {
            var errorField = $('label[for='+this.id+']').text();
            errorMessages.push(errorField + ' ' + this.validationMessage);
        }
    });

    // prints any validation errors found out to user
    if (errorMessages.length > 0){
        $.each(errorMessages,function(index,message){
            $('#errorMessages').append($('<li>').attr({class: 'list-group-item list-group-item-danger'}).text(message));
        });
        // return true if there were errors
        return true;
    } else {
        // return false if there weren't errors
        return false;
    }
}

//brings up the edit form for user
function showEditForm(dvdId) {
	//emptys potential errors already loaded
    $('#errorMessages').empty();

	//hides main table, add form and the button row
    $('#mainPage').hide();
    $('#addDvdDiv').hide();
    $('#displayDiv').hide();

    //emptys potential errors already loaded
    $('#errorMessages').empty();
	
    // ajax call using passed id from corresponding dvd 
    $.ajax({
        type: 'GET',
        url: 'http://dvd-library.us-east-1.elasticbeanstalk.com/dvd/' + dvdId,
        success: function(data, status) {
			//populates the edit form with the dvds current data
			$('#editDVDTitle').val(data.title);
            $('#editReleaseYear').val(data.releaseYear);
            $('#editDirector').val(data.director);
            $('#editRating').val(data.rating);
            $('#editNotes').val(data.notes);
            $('#editDVDId').val(data.id);

            $('#errorMessages').empty();
        },
        error: function() {
			//error message if api cannot be reached
            $('#errorMessages')
				.append($('<li>')
				.attr({class: 'list-group-item list-group-item-danger'})
				.text('Error calling web service.  Please try again later.'));
        }
    });
	
	//shows the populated edit form to user
    $('#editDvdDiv').show();
}

//prompts user if they want to delete and if they do then deletes dvd from library
function deleteDVD(dvdId) {
	//gets conformation that the user intends to delete the dvd
	var r = confirm("Are you sure you want to delete this DVD from your collection?");
	if (r == true) {
	//delete call made to remove dvd from library
    $.ajax ({
        type: 'DELETE',
        url: "http://dvd-library.us-east-1.elasticbeanstalk.com/dvd/" + dvdId,
        success: function (status) {
			//loads the new library
			loadDVDs();
        }
    });

	} else {
		//reloads library untouched
        loadDVDs();
	}
}

//displays the selected dvds information to user
function displayDVD(dvdId){
	//emptys potential errors already loaded
	$('#errorMessages').empty();

	//hides main table and shows form for the individual dvd
	$('#mainPage').hide();
	$('#displayDiv').show();
	
	//ajax get to get the highlighted dvd from library
	$.ajax({
		type: 'GET',
		url: 'http://dvd-library.us-east-1.elasticbeanstalk.com/dvd/' + dvdId,
		success: function(data, status) {
			//enters data from dvd
			$('#displayTitle').text(data.title);
            $('#displayYear').text(data.releaseYear);
            $('#displayDirector').text(data.director);
            $('#displayRating').text(data.rating);
            $('#displayNotes').text(data.notes);

            $('#errorMessages').empty();
        },
        error: function() {
			//error message if api cannot be reached
			$('#errorMessages')
				.append($('<li>')
				.attr({class: 'list-group-item list-group-item-danger'})
				.text('Error calling web service.  Please try again later.'));
        }
	});
}

//uses the generate url to get an array of dvds that satisfy the search condition
function searchDVDs(tempURL) {
	// clears table so that it is ready to be populated with relevant dvds
    clearDVDTable();

	//ensures that the main table is the only thing showing, not any forms
    resetAll();

	//emptys potential errors already loaded
    $('#errorMessages').empty();

    //grabs and loads the corresponding table element
    var contentRows = $('#contentRows');
	
	//ajax call using the url to get the relevant dvds (if they exist) from the library
    $.ajax ({
        type: 'GET',
        url: tempURL,
        success: function (data, status) {
            $.each(data, function (index, dvd) {
				//loads the dvds into the table to be displayed
                var title = dvd.title;
                var releaseYear = dvd.releaseYear;
                var director = dvd.director;
                var rating = dvd.rating;
                var id = dvd.id;

                var row = '<tr>';
                    row += '<td align="center" width="25%"><a onclick="displayDVD(' + id + ')">' + title + '</a></td>';
                    row += '<td align="center" width="25%">' + releaseYear + '</td>';
                    row += '<td align="center" width="15%">' + director + '</td>';
                    row += '<td align="center" width="10%">' + rating + '</td>';
                    row += '<td align="center" width="5%"><a onclick="showEditForm(' + id + ')"><button type="button" class="btn btn-info">Edit</button></a></td>';
                    row += '<td align="center" width="5%"><a onclick="deleteDVD(' + id + ')"><button type="button" class="btn btn-danger">Delete</button></a></td>';
                    row += '<td width="15%"></td>';
                    row += '</tr>';
                contentRows.append(row);

                $('#errorMessages').empty();
            });
        },
        error: function() {
			//error message if api cannot be reached
            $('#errorMessages')
                .append($('<li>')
                .attr({class: 'list-group-item list-group-item-danger'})
                .text('Both Search Category and Search Term are required.'));
        }

    });
}

//resets display to initial launch where main table is shown and everything else is hidden
function resetAll(){
	$('#mainPage').show();
	$('#addDvdDiv').hide();
	$('#editDvdDiv').hide();
	$('#displayDiv').hide();
	$('#errorMessages').empty();
}