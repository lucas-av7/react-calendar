import React, { useMemo, useState } from "react";
import api from "../services/api";

var _ = require("lodash");

function Day(props) {
  const day = props.date.day;
  const month = props.date.month;
  const year = props.date.year;
  const isCurrentMonth = props.date.isCurrentMonth;

  const [reminders, setReminders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serching, setSerching] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const searchLocation = useMemo(
    () =>
      _.debounce((value) => {
        if (value.length >= 1) {
          api
            .get("/search/", { params: { query: value } })
            .then((response) => {
              setLocations([...response.data]);
              setSerching(false);
            })
            .catch((error) => {
              setLocations([]);
              setSerching(false);
            });
        } else {
          setLocations([]);
          setSerching(false);
        }
      }, 2000),
    []
  );

  const handleChangeLabel = (event, index) => {
    const tempReminders = [...reminders];
    tempReminders[index].label = event.target.value;

    setReminders([...tempReminders]);
  };

  const handleChangeLocation = (event, index) => {
    const tempReminders = [...reminders];
    tempReminders[index].location = event.target.value;
    tempReminders[index].woeid = "";
    tempReminders[index].weather = "";

    setReminders([...tempReminders]);

    setSerching(true);
    searchLocation(event.target.value);
  };

  const handleChangeTimeHour = (event, index) => {
    const tempReminders = [...reminders];
    tempReminders[index].time.hour = event.target.value;

    setReminders([...tempReminders]);
  };

  const handleChangeTimeMinute = (event, index) => {
    const tempReminders = [...reminders];
    tempReminders[index].time.minute = event.target.value;

    setReminders([...tempReminders]);
  };

  const sortReminders = (reminders) => {
    const tempReminders = [...reminders];
    tempReminders.sort((itemA, itemB) => {
      return (
        itemA.time.hour +
        itemA.time.minute -
        (itemB.time.hour + itemB.time.minute)
      );
    });

    return tempReminders;
  };

  const hideReminderDetails = (index) => {
    setLocations([]);

    const tempReminders = [...reminders];
    tempReminders[index].isVisible = false;

    if (!tempReminders[index].woeid) {
      tempReminders[index].location = "";
      tempReminders[index].weather = "";
    }

    if (tempReminders[index].time.hour > 23) {
      tempReminders[index].time.hour = "00";
    } else {
      tempReminders[index].time.hour = tempReminders[index].time.hour.padStart(
        2,
        "0"
      );
    }

    if (tempReminders[index].time.minute > 59) {
      tempReminders[index].time.minute = "00";
    } else {
      tempReminders[index].time.minute = tempReminders[
        index
      ].time.minute.padStart(2, "0");
    }

    setReminders([...sortReminders(tempReminders)]);
  };

  const showReminderDetails = async (index) => {
    const tempReminders = [...reminders];
    tempReminders[index].isVisible = true;

    setReminders([...tempReminders]);

    if (!tempReminders[index].weather && tempReminders[index].woeid) {
      tempReminders[index].weather = await getWeather(
        tempReminders[index].woeid
      );

      setReminders([...tempReminders]);
    }
  };

  const setLocation = async (index, woeid, location) => {
    setLocations([]);

    const tempReminders = [...reminders];
    tempReminders[index].woeid = woeid;
    tempReminders[index].location = location;
    tempReminders[index].weather = await getWeather(woeid);

    setReminders([...tempReminders]);
  };

  const getWeather = async (woeid) => {
    setLoadingWeather(true);

    try {
      const response = await api.get(`/${woeid}/${year}/${month}/${day}/`);
      setLoadingWeather(false);
      return response.data[0].weather_state_name;
    } catch (error) {
      setLoadingWeather(false);
      return "";
    }
  };

  const addNewReminder = () => {
    setReminders([
      {
        label: "",
        isVisible: true,
        time: {
          hour: String(new Date().getHours() + 1).padStart(2, "0"),
          minute: String(new Date().getMinutes()).padStart(2, "0")
        },
        location: "",
        woeid: "",
        weather: ""
      },
      ...reminders
    ]);
  };

  const deleteReminder = (index) => {
    const tempReminders = [...reminders];
    tempReminders.splice(index, 1);

    setReminders([...tempReminders]);
  };

  const someVisiable = () => {
    return reminders.some((element) => element.isVisible);
  };

  function allowDrop(event) {
    event.preventDefault();
  }

  function drag(event, index) {
    const reminder = JSON.stringify(reminders[index]);
    event.dataTransfer.setData("reminder", reminder);
  }

  function drop(event) {
    event.preventDefault();
    const reminder = JSON.parse(event.dataTransfer.getData("reminder"));
    reminder.weather = "";

    setReminders([...sortReminders([reminder, ...reminders])]);
  }

  return (
    <div
      data-testid={`day-box-${day}`}
      className={`day-box ${isCurrentMonth ? "" : "not-current"}`}
      onDragOver={allowDrop}
      onDrop={drop}
    >
      <p className="day-box__label">{day}</p>
      <div
        className="day-box__reminders"
        style={{ overflowY: someVisiable() ? "visible" : "auto" }}
      >
        {reminders.map((reminder, index) => (
          <div
            data-testid={`reminder-${day}-${index}`}
            className="reminder"
            key={index}
            draggable="true"
            onDragStart={(event) => drag(event, index)}
            onDragEnd={() => deleteReminder(index)}
          >
            <p
              className="reminder__label"
              onClick={() => showReminderDetails(index)}
            >
              <span className="reminder__time">
                {reminder.time.hour}:{reminder.time.minute}
              </span>
              {reminder.label || "New reminder"}
            </p>
            {reminder.isVisible && (
              <React.Fragment>
                <div 
                  data-testid={`reminder-details-${day}-${index}`}
                  className="reminder__details"
                >
                  <button
                    className="day-box__delete"
                    onClick={() => deleteReminder(index)}
                    title="Delete reminder"
                  >
                    Delete
                  </button>
                  <textarea
                    placeholder="New reminder"
                    name="text"
                    rows="1"
                    cols="10"
                    maxLength="30"
                    value={reminder.label}
                    onChange={(event) => handleChangeLabel(event, index)}
                  />
                  <hr />
                  <p>
                    <input
                      className="reminder__input reminder__input--location"
                      type="text"
                      placeholder="Add location"
                      value={reminder.location}
                      onChange={(event) => handleChangeLocation(event, index)}
                    />
                    {serching && (
                      <span className="reminder__input--location-loading">
                        <span className="loading-icon"></span>
                      </span>
                    )}
                  </p>

                  {locations.length > 0 && (
                    <div className="reminder__locations">
                      {locations.map((location) => (
                        <p
                          onClick={() =>
                            setLocation(index, location.woeid, location.title)
                          }
                          key={location.woeid}
                        >
                          {location.title}
                        </p>
                      ))}
                    </div>
                  )}

                  {!locations.length &&
                    reminder.location &&
                    !reminder.woeid &&
                    !serching && (
                      <div className="reminder__locations">
                        <p className="reminder__locations--not-found">
                          No locations found
                        </p>
                      </div>
                    )}

                  <p>
                    <input
                      className="reminder__input reminder__input--time"
                      type="text"
                      maxLength="2"
                      value={reminder.time.hour}
                      onChange={(event) => handleChangeTimeHour(event, index)}
                    />
                    :
                    <input
                      className="reminder__input reminder__input--time"
                      type="text"
                      maxLength="2"
                      value={reminder.time.minute}
                      onChange={(event) => handleChangeTimeMinute(event, index)}
                    />
                  </p>
                  {reminder.weather && <p>Weather: {reminder.weather}</p>}
                  {loadingWeather && (
                    <span className="reminder__input--weather-loading">
                      <span className="loading-icon"></span>
                    </span>
                  )}
                </div>
                <div
                  data-testid={`closable-area-${day}-${index}`}
                  className="reminder__background"
                  onClick={() => hideReminderDetails(index)}
                ></div>
              </React.Fragment>
            )}
          </div>
        ))}
      </div>
      {!someVisiable() && (
        <button className="day-box__new" onClick={addNewReminder}>
          New
        </button>
      )}
    </div>
  );
}

export default Day;
