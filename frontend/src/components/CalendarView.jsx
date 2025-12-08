import React, { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function getMonthMatrix(year, month) {
	// month: 0-11
	const first = new Date(year, month, 1);
	const last = new Date(year, month + 1, 0);
	const matrix = [];
	const startDay = first.getDay(); // 0 (Sun) - 6
	let week = new Array(7).fill(null);
	// fill leading blanks
	for (let i = 0; i < startDay; i++) week[i] = null;
	let day = 1;
	for (let i = startDay; i < 7; i++) {
		week[i] = day++;
	}
	matrix.push(week);
	while (day <= last.getDate()) {
		week = new Array(7).fill(null);
		for (let i = 0; i < 7 && day <= last.getDate(); i++) {
			week[i] = day++;
		}
		matrix.push(week);
	}
	return matrix;
}

export default function CalendarView() {
	const today = new Date();
	const [display, setDisplay] = useState({
		year: today.getFullYear(),
		month: today.getMonth(),
	});

	const [selectedDate, setSelectedDate] = useState(new Date());

	const monthMatrix = useMemo(
		() => getMonthMatrix(display.year, display.month),
		[display.year, display.month],
	);

	const handlePrev = () => {
		setDisplay((d) => {
			const m = d.month - 1;
			if (m < 0) return { year: d.year - 1, month: 11 };
			return { year: d.year, month: m };
		});
	};
	const handleNext = () => {
		setDisplay((d) => {
			const m = d.month + 1;
			if (m > 11) return { year: d.year + 1, month: 0 };
			return { year: d.year, month: m };
		});
	};

	const onSelectDay = (day) => {
		if (!day) return;
		setSelectedDate(new Date(display.year, display.month, day));
	};

	return (
		<section className="calendar-page">
			<div className="calendar-left">
				<div className="calendar-header">
					<button
						type="button"
						className="icon-btn"
						aria-label="Previous month"
						onClick={handlePrev}
					>
						<FiChevronLeft />
					</button>
					<button type="button" className="btn month-btn" aria-current="date">
						{monthNames[display.month]} {display.year}
					</button>
					<button
						type="button"
						className="icon-btn"
						aria-label="Next month"
						onClick={handleNext}
					>
						<FiChevronRight />
					</button>
				</div>

				<table className="calendar-table" role="grid" aria-label="Calendar">
					<thead>
						<tr>
							<th>Sun</th>
							<th>Mon</th>
							<th>Tue</th>
							<th>Wed</th>
							<th>Thu</th>
							<th>Fri</th>
							<th>Sat</th>
						</tr>
					</thead>
					<tbody>
						{monthMatrix.map((week, wi) => (
							<tr key={wi}>
								{week.map((d, i) => (
									<td key={i} className={d ? "day-cell" : "empty-cell"}>
										{d ? (
											<button
												type="button"
												className={
													"day-btn " +
													(selectedDate.getDate() === d &&
													selectedDate.getMonth() === display.month &&
													selectedDate.getFullYear() === display.year
														? "selected"
														: "")
												}
												onClick={() => onSelectDay(d)}
											>
												{d}
											</button>
										) : (
											""
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<aside className="calendar-right">
				<div className="day-box" role="complementary" aria-label="Day details">
					<h3 className="day-box-title">{selectedDate.toDateString()}</h3>
					<div className="day-box-body">
						<p className="muted">Tasks for this day will appear here.</p>
						{/* TODO: fetch and show tasks for selectedDate */}
					</div>
				</div>
			</aside>
		</section>
	);
}
