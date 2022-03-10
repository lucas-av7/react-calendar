function Header() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  return (
    <div className="week-header">
      {days.map((day, index) => (
        <p className="week-header__label" key={index}>
          {day}
        </p>
      ))}
    </div>
  );
}

export default Header;
