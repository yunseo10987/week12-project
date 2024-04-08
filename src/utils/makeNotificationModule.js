const notification = require("../mongooseSchema/notificationsSchema");

const makeNotification = async (type, nickname, data, receiver) => {
  if (type === "global") {
    await notification.create({
      type: type,
      writer: nickname,
      data: data,
    });
  } else {
    await notification.create({
      type: type,
      writer: nickname,
      data: data,
      receiver: receiver,
      is_read: false,
    });
  }
};

module.exports = makeNotification;
