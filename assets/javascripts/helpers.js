// Simple function to format a date to an ISO date for the server
// YYYY-mm-dd
function formatDateToISO(date) {
  var day = date.getDate().toString();
  var month = (date.getMonth() + 1).toString(); //months are zero based
  var year = date.getFullYear().toString();;
  // Simple padding
  if (day.length < 2) { day = "0" + day; }
  if (month.length < 2) { month = "0" + month; }

  return year + "-" + month + "-" + day;
}
