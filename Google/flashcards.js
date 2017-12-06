$(function()
{
	// Generate unordered array of flashcards
	let numberFlash = 0;
	let front;
	let back;
	let questions = 0; // Default number of sufficient questions
	let total_correct = 0; // How many correct answers user has input
	let location = 0; // Location of random question in array

	chrome.storage.sync.get(['numberFlash', 'front', 'back', 'nbr'], function(flashcards)
	{
		questions = flashcards.nbr;
		front = JSON.parse(flashcards.front);
		back = JSON.parse(flashcards.back);
		numberFlash = flashcards.numberFlash;

		// Make sure there are flashcards
		if (!flashcards.numberFlash)
		{
			chrome.tabs.update({url:chrome.extension.getURL('error.html')});
		};

		// Define total correct answers to pass (default 10 unless fewer exist)
		if (numberFlash < questions)
		{
			questions = numberFlash;
		};

		$("#questions").text(questions);

		ask();

		// Listen for user submission
		$('#check').click(function()
		{
			check();
		});
	});

	// Displays random question
	function ask()
	{
		// Location used in both ask and check
		location = Math.floor(Math.random() * numberFlash);

		// Render random question
		$("#question").text(front[location]);
	};

	// Checks user input
	function check()
	{
		let elem = document.getElementById("result_box");

		// Check if user input matches correct answer
		if ($('#answer').val() == back[location])
		{
			front.splice(location, 1);
			back.splice(location, 1);

			// Remeber total correct answers
			total_correct++;

			// Update page
			$("#answer").val('');
			$("#total_correct").text(total_correct);
			$("#result").text("Correct!");
			elem.setAttribute("style","visibility: visible; background-color: lime;");
		}

		// Incorrect answer
		else
		{
			// Update page
			$("#answer").val('');
			$("#result").text("Correct Answer: " + back[location]);
			elem.setAttribute("style","visibility: visible; background-color: red;");
		};

		// Check if sufficient correct answer
		if (total_correct == questions)
		{
			chrome.storage.sync.get(['last_block', 'websites'], function(newUrl)
			{
				let d = new Date();
				chrome.storage.sync.set({'Unlocked' : d.getTime()});
				chrome.tabs.update({url: newUrl.last_block});
			});
		}
		else
		{
			// Ask another question
			ask();
		};
	};
});
