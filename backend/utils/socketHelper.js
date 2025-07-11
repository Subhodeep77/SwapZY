// utils/socketHelpers.js
const emitToRoomIfExists = (io, roomId, event, payload) => {
  if (!roomId) {
    console.log(`⚠️ No roomId provided, event "${event}" not emitted`);
    return;
  }

  const room = io?.sockets?.adapter?.rooms?.get(roomId);

  if (room && room.size > 0) {
    io.to(roomId).emit(event, payload);
    console.log(`✅ Event "${event}" emitted to room ${roomId}`);
  } else {
    console.log(`⚠️ No listeners in room ${roomId}, event "${event}" not emitted`);
  }
};

module.exports = { emitToRoomIfExists };
