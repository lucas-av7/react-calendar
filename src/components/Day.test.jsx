import Day from "./Day";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"

test("Day component", async () => {
  const currentDate = new Date();

  const date = {
    day: currentDate.getDate(),
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    isCurrentMonth: true
  }

  const {getByText, findByText, getByTestId, queryByTestId, getByPlaceholderText} = render(<Day date={date} />)

  expect(getByText(currentDate.getDate())).toBeInTheDocument()

  fireEvent.mouseOver(queryByTestId(`day-box-${date.day}`));
  const newButton = await findByText("New")
  expect(newButton).toBeInTheDocument()

  fireEvent.click(newButton)
  const reminderDetails = getByTestId(`reminder-details-${date.day}-0`)
  expect(reminderDetails).toBeInTheDocument()

  const inputReminder = getByPlaceholderText("New reminder");
  fireEvent.change(inputReminder, { target: { value: "Play guitar" } })

  const closableArea = getByTestId(`closable-area-${date.day}-0`)
  expect(closableArea).toBeInTheDocument()
  fireEvent.click(closableArea);

  const reminder = getByTestId(`reminder-${date.day}-0`);
  expect(reminder).toBeInTheDocument();
  expect(reminder).toHaveTextContent("Play guitar");
});
