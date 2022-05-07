document.addEventListener("DOMContentLoaded", () => {
	switch_mode("pomodoro");
});

const { ipcRenderer } = require("electron");

// Minimize Window
const minimize = () => {
	ipcRenderer.send("minimize");
};

// Maximize Window
const maximize = () => {
	ipcRenderer.send("maximize");
};

// Close Window
const closed = () => {
	ipcRenderer.send("closed");
};

let interval;

// Duration and Minutes of Timer
const timer = {
	pomodoro: 25,
	short_break: 5,
	long_break: 15,
	long_break_interval: 4,
	sessions: 0,
};

const mode_buttons = document.querySelector("#js-mode-buttons");
mode_buttons.addEventListener("click", handle_mode);

function get_remaining_time(end_time) {
	const current_time = Date.parse(new Date());
	const difference = end_time - current_time;

	const total = Number.parseInt(difference / 1000, 10);
	const minutes = Number.parseInt((total / 60) % 60, 10);
	const seconds = Number.parseInt(total % 60, 10);

	return {
		total,
		minutes,
		seconds,
	};
}

function reset_session() {
	clearInterval(interval);

	switch_mode(timer.mode);

	document
		.getElementById("js-start-btn")
		.setAttribute("onclick", "start_timer()");
	document.getElementById("js-start-btn").innerHTML =
		'<ion-icon name="play-outline"></ion-icon>';
}

function skip_session() {
	clearInterval(interval);

	switch (timer.mode) {
		case "pomodoro":
			if (timer.sessions % timer.long_break_interval === 0) {
				switch_mode("long_break");
			} else {
				switch_mode("short_break");
			}
			break;
		default:
			switch_mode("pomodoro");
	}

	document
		.getElementById("js-start-btn")
		.setAttribute("onclick", "start_timer()");
	document.getElementById("js-start-btn").innerHTML =
		'<ion-icon name="pause-outline">';
}

function start_timer() {
	let { total } = timer.remaining_time;
	const end_time = Date.parse(new Date()) + total * 1000;

	if (timer.mode === "pomodoro") timer.sessions++;

	console.log("sessions" + timer.sessions);
	console.log(timer.mode);

	document
		.getElementById("js-start-btn")
		.setAttribute("onclick", "stop_timer()");

	document.getElementById("js-start-btn").innerHTML =
		'<ion-icon name="pause-outline"></ion-icon>';

	interval = setInterval(function () {
		timer.remaining_time = get_remaining_time(end_time);
		update_clock();

		total = timer.remaining_time.total;
		if (total <= 0) {
			clearInterval(interval);

			switch (timer.mode) {
				case "pomodoro":
					if (timer.sessions % timer.long_break_interval === 0) {
						switch_mode("long_break");
					} else {
						switch_mode("short_break");
					}
					break;
				default:
					switch_mode("pomodoro");
			}
			start_timer();
		}
		console.log("logged 2");
		console.log(timer.remaining_time.minutes);
		console.log(timer.remaining_time.seconds);
	}, 1000);
}

function stop_timer() {
	clearInterval(interval);

	document
		.getElementById("js-start-btn")
		.setAttribute("onclick", "start_timer()");

	document.getElementById("js-start-btn").innerHTML =
		'<ion-icon name="play-outline"></ion-icon>';
}

function update_clock() {
	const { remaining_time } = timer;
	const minutes = `${remaining_time.minutes}`.padStart(2, "0");
	const seconds = `${remaining_time.seconds}`.padStart(2, "0");

	const min = document.getElementById("js-minutes");
	const sec = document.getElementById("js-seconds");

	min.textContent = minutes;
	sec.textContent = seconds;

	const progress = document.getElementById("js-progress");
	progress.value =
		timer[timer.mode] * 60 -
		timer.remaining_time.total +
		timer.remaining_time.total * 0.075;
}

function switch_mode(mode) {
	timer.mode = mode;
	timer.remaining_time = {
		total: timer[mode] * 60,
		minutes: timer[mode],
		seconds: 0,
	};

	document
		.getElementById("js-progress")
		.setAttribute("max", timer.remaining_time.total);

	update_clock();
}

function handle_mode(event) {
	const { mode } = event.target.dataset;

	if (!mode) return;

	switch_mode(mode);
	stop_timer();
}
