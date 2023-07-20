function time(num: number) {
  return ("0" + num).slice(-2);
}

const mounths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function month(i: number) {
  return mounths[i];
}

export function getLastVisit(date: number) {
  const now = Date.now();
  const d = new Date(date);
  const MS = 60 * 60 * 24 * 30.5 * 1000;
  if (!date) return "online";
  // > year
  if (now - MS * 12 > date) {
    return `${d.getFullYear()}`;
  }
  // > month
  if (now - MS > date) {
    return `${time(d.getDate())} ${month(d.getMonth())}`;
  }
  // > day
  if (new Date(now).getDay() > d.getDay()) {
    return `${time(d.getHours())}:${time(d.getMinutes())} yesterday`;
  }
  // > hour
  if (now - MS / 30.5 / 24 > date) {
    return `${time(d.getHours())}:${time(d.getMinutes())} today`;
  } else {
    // < hour
    return `${new Date(now - date).getMinutes()}m ago`;
  }
}

export function messageTime(date: number) {
  const data = new Date(date);
  return time(data.getHours()) + ":" + time(data.getMinutes());
}
