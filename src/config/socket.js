module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join session
    socket.on('joinSession', (sessionId) => {
      socket.join(sessionId);
      io.to(sessionId).emit('sessionUpdate', `User ${socket.id} joined session ${sessionId}`);
    });

    // Send alerts
    socket.on('sendAlert', (alert) => {
      io.emit('receiveAlert', alert);  //send alert to all except the sender
    });

    // User activity
    socket.on('userActivity', (activity) => {
      socket.broadcast.emit('activityUpdate', activity);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
