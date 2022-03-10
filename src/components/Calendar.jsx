import React from "react";
import Day from "./Day";
import Header from "./Header";

function Calendar(props) {
  const date = new Date();
  const month = date.getMonth();
  const monthString = date.toLocaleString("default", { month: "long" });
  date.setDate(1);
  date.setDate(-date.getDay());

  let days = [];

  for (let i = 0; i < 35; i++) {
    date.setDate(date.getDate() + 1);
    days.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: month === date.getMonth()
    });
  }

  return (
    <div className="container">
      <h1>Calendar: {monthString}</h1>
      <div className="calendar">
        <Header />
        {days.map((date, index) => (
          <Day key={index} date={date} />
        ))}
      </div>
    </div>
  );
}

export default Calendar;
